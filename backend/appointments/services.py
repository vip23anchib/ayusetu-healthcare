from django.db import transaction, IntegrityError, OperationalError
from django.utils import timezone
from django.db.models import Q
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta, date, time
from doctors.models import Doctor, DoctorWorkingHours, DoctorLeave
from .models import Appointment

class SlotConflictError(ValidationError):
    """Exception raised when an appointment slot is already taken."""
    pass

def generate_available_slots(doctor_id, check_date):
    """
    Computes list of available slots for a doctor on a specific date.
    Returns list of dicts: [{'start_time': '09:00:00', 'end_time': '09:30:00', 'available': True}]
    """
    if isinstance(check_date, str):
        check_date = datetime.strptime(check_date, "%Y-%m-%d").date()

    try:
        doctor = Doctor.objects.get(id=doctor_id)
    except Doctor.DoesNotExist:
        return []

    # 1. No booking during leave
    if DoctorLeave.objects.filter(doctor=doctor, leave_date=check_date).exists():
        return []

    # 2. Get working hours for the day of week
    day_of_week = check_date.weekday()  # Monday=0, Sunday=6
    working_hours = DoctorWorkingHours.objects.filter(doctor=doctor, day_of_week=day_of_week).first()
    if not working_hours:
        return []

    # 3. Get active appointments and holds
    now = timezone.now()
    active_appointments = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=check_date
    ).filter(
        Q(status__in=[Appointment.Status.CONFIRMED, Appointment.Status.COMPLETED]) |
        Q(status=Appointment.Status.HELD, hold_expires_at__gt=now)
    ).values_list('start_time', flat=True)

    active_slots = set(active_appointments)

    # 4. Segment working hours into slot duration chunks
    slots = []
    current_dt = datetime.combine(check_date, working_hours.start_time)
    end_dt = datetime.combine(check_date, working_hours.end_time)
    duration = timedelta(minutes=doctor.slot_duration)

    while current_dt + duration <= end_dt:
        slot_start = current_dt.time()
        slot_end = (current_dt + duration).time()
        
        # Format string time
        start_str = slot_start.strftime("%H:%M:%S")
        end_str = slot_end.strftime("%H:%M:%S")

        # Check if slot is available (not occupied and not in past if today)
        is_available = slot_start not in active_slots
        if check_date == date.today():
            is_available = is_available and current_dt > datetime.now()

        slots.append({
            'start_time': start_str,
            'end_time': end_str,
            'available': is_available
        })
        current_dt += duration

    return slots


@transaction.atomic
def hold_slot(patient, doctor_id, check_date, start_time_str):
    """
    Places a 5-minute hold on a doctor slot. Row-locks doctor record to prevent races.
    """
    try:
        if isinstance(check_date, str):
            check_date = datetime.strptime(check_date, "%Y-%m-%d").date()

        # Lock doctor row
        try:
            doctor = Doctor.objects.select_for_update().get(id=doctor_id)
        except Doctor.DoesNotExist:
            raise ValidationError("Doctor profile not found.")

        # Parse start time
        try:
            start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
        except ValueError:
            try:
                start_time = datetime.strptime(start_time_str, "%H:%M").time()
            except ValueError:
                raise ValidationError("Invalid start_time format. Use HH:MM:SS.")

        start_dt = datetime.combine(check_date, start_time)
        end_dt = start_dt + timedelta(minutes=doctor.slot_duration)
        end_time = end_dt.time()

        # 1. No booking outside working hours
        day_of_week = check_date.weekday()
        working_hours = DoctorWorkingHours.objects.filter(doctor=doctor, day_of_week=day_of_week).first()
        if not working_hours:
            raise ValidationError("Doctor does not work on this day of the week.")
        
        if start_time < working_hours.start_time or end_time > working_hours.end_time:
            raise ValidationError("Requested slot is outside the doctor's working hours.")

        # 2. No booking during leave
        if DoctorLeave.objects.filter(doctor=doctor, leave_date=check_date).exists():
            raise ValidationError("Doctor is on leave on this date.")

        # 3. Check for concurrency conflicts (holds/active bookings)
        now = timezone.now()
        conflicting = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=check_date,
            start_time=start_time
        ).filter(
            Q(status__in=[Appointment.Status.CONFIRMED, Appointment.Status.COMPLETED]) |
            Q(status=Appointment.Status.HELD, hold_expires_at__gt=now)
        ).select_for_update().exists()

        if conflicting:
            raise SlotConflictError("This slot was just booked by another patient. Please choose another slot.")

        # Create HELD appointment
        hold_expires_at = now + timedelta(minutes=5)
        appointment = Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            appointment_date=check_date,
            start_time=start_time,
            end_time=end_time,
            status=Appointment.Status.HELD,
            hold_expires_at=hold_expires_at
        )
        return appointment
    except (IntegrityError, OperationalError):
        raise SlotConflictError("This slot was just booked by another patient. Please choose another slot.")



@transaction.atomic
def confirm_booking(appointment_id, symptoms_text):
    """
    Confirms a HELD appointment and associates symptoms.
    """
    try:
        appointment = Appointment.objects.select_for_update().get(id=appointment_id)
    except Appointment.DoesNotExist:
        raise ValidationError("Appointment not found.")

    if appointment.status != Appointment.Status.HELD:
        raise ValidationError("Only held appointments can be confirmed.")

    if appointment.hold_expires_at and appointment.hold_expires_at < timezone.now():
        appointment.status = Appointment.Status.EXPIRED
        appointment.save()
        raise ValidationError("This slot hold has expired. Please select the slot again.")

    # Confirm transition
    appointment.status = Appointment.Status.CONFIRMED
    appointment.hold_expires_at = None
    appointment.save()

    # Save raw symptoms
    # Dynamic import to avoid circular dependency
    from consultations.models import Symptom
    Symptom.objects.create(appointment=appointment, symptoms_text=symptoms_text)

    # 1. Trigger AI Pre-Visit summary (non-blocking)
    try:
        from consultations.services import trigger_pre_visit_summary
        trigger_pre_visit_summary(appointment.id)
    except Exception as e:
        # Technical error logged, but does not break the booking flow
        print(f"Pre-visit summary calculation failed: {e}")

    # 2. Queue Email Notifications (non-blocking)
    try:
        from notifications.services import queue_booking_notifications
        queue_booking_notifications(appointment.id)
    except Exception as e:
        print(f"Booking notification queue failed: {e}")

    # 3. Google Calendar Sync (non-blocking)
    try:
        from calendar_integration.services import sync_appointment_event
        sync_appointment_event(appointment.id)
    except Exception as e:
        print(f"Google Calendar sync failed: {e}")

    return appointment


@transaction.atomic
def cancel_appointment(appointment_id, user):
    """
    Cancels appointment and frees slot. Respects roles.
    """
    try:
        appointment = Appointment.objects.select_for_update().get(id=appointment_id)
    except Appointment.DoesNotExist:
        raise ValidationError("Appointment not found.")

    # Role check
    if user.role == 'PATIENT' and appointment.patient != user:
        raise ValidationError("You do not have permission to cancel this appointment.")
    if user.role == 'DOCTOR' and appointment.doctor.user != user:
        raise ValidationError("You do not have permission to cancel this appointment.")

    if appointment.status in [Appointment.Status.CANCELLED, Appointment.Status.EXPIRED]:
        raise ValidationError("Appointment is already inactive.")
    
    if appointment.status == Appointment.Status.COMPLETED:
        raise ValidationError("Completed appointments cannot be cancelled.")

    appointment.status = Appointment.Status.CANCELLED
    appointment.save()

    # Queue Cancellation Notifications
    try:
        from notifications.services import queue_cancellation_notifications
        queue_cancellation_notifications(appointment.id)
    except Exception as e:
        print(f"Cancellation notifications failed: {e}")

    # Cancel Calendar Event
    try:
        from calendar_integration.services import delete_appointment_event
        delete_appointment_event(appointment.id)
    except Exception as e:
        print(f"Google Calendar deletion failed: {e}")

    return appointment


@transaction.atomic
def reschedule_appointment(appointment_id, user, new_date, new_start_time_str):
    """
    Atomically reschedules appointment. Re-validates slot availability.
    """
    try:
        appointment = Appointment.objects.select_for_update().get(id=appointment_id)
    except Appointment.DoesNotExist:
        raise ValidationError("Appointment not found.")

    # Permissions
    if user.role == 'PATIENT' and appointment.patient != user:
        raise ValidationError("You do not have permission to reschedule this appointment.")
    if user.role == 'DOCTOR' and appointment.doctor.user != user:
        raise ValidationError("You do not have permission to reschedule this appointment.")

    if appointment.status != Appointment.Status.CONFIRMED:
        raise ValidationError("Only confirmed appointments can be rescheduled.")

    if isinstance(new_date, str):
        new_date = datetime.strptime(new_date, "%Y-%m-%d").date()

    try:
        new_start_time = datetime.strptime(new_start_time_str, "%H:%M:%S").time()
    except ValueError:
        try:
            new_start_time = datetime.strptime(new_start_time_str, "%H:%M").time()
        except ValueError:
            raise ValidationError("Invalid start_time format. Use HH:MM:SS.")

    doctor = appointment.doctor
    start_dt = datetime.combine(new_date, new_start_time)
    end_dt = start_dt + timedelta(minutes=doctor.slot_duration)
    end_time = end_dt.time()

    # Check working hours
    day_of_week = new_date.weekday()
    working_hours = DoctorWorkingHours.objects.filter(doctor=doctor, day_of_week=day_of_week).first()
    if not working_hours:
        raise ValidationError("Doctor does not work on this day of the week.")
    if new_start_time < working_hours.start_time or end_time > working_hours.end_time:
        raise ValidationError("Slot is outside doctor's working hours.")

    # Check leave
    if DoctorLeave.objects.filter(doctor=doctor, leave_date=new_date).exists():
        raise ValidationError("Doctor is on leave on this date.")

    # Check conflict (excluding current appointment itself)
    now = timezone.now()
    conflicting = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=new_date,
        start_time=new_start_time
    ).exclude(
        id=appointment.id
    ).filter(
        Q(status__in=[Appointment.Status.CONFIRMED, Appointment.Status.COMPLETED]) |
        Q(status=Appointment.Status.HELD, hold_expires_at__gt=now)
    ).select_for_update().exists()

    if conflicting:
        raise SlotConflictError("This slot was just booked by another patient. Please choose another slot.")

    # Update appointment details
    appointment.appointment_date = new_date
    appointment.start_time = new_start_time
    appointment.end_time = end_time
    appointment.save()

    # Queue Reschedule notifications
    try:
        from notifications.services import queue_reschedule_notifications
        queue_reschedule_notifications(appointment.id)
    except Exception as e:
        print(f"Reschedule notification failed: {e}")

    # Update Calendar Event
    try:
        from calendar_integration.services import update_appointment_event
        update_appointment_event(appointment.id)
    except Exception as e:
        print(f"Google Calendar update failed: {e}")

    return appointment


@transaction.atomic
def handle_doctor_leave(doctor_id, leave_date):
    """
    Cancels/reschedules bookings affected by doctor leave and notifies patients.
    """
    if isinstance(leave_date, str):
        leave_date = datetime.strptime(leave_date, "%Y-%m-%d").date()

    # Find active bookings
    affected_appointments = Appointment.objects.select_for_update().filter(
        doctor_id=doctor_id,
        appointment_date=leave_date,
        status__in=[Appointment.Status.HELD, Appointment.Status.CONFIRMED]
    )

    for appointment in affected_appointments:
        appointment.status = Appointment.Status.CANCELLED
        appointment.save()

        # Queue doctor leave cancel notification
        try:
            from notifications.services import queue_leave_notifications
            queue_leave_notifications(appointment.id)
        except Exception as e:
            print(f"Leave notification failed: {e}")

        # Delete Calendar Event
        try:
            from calendar_integration.services import delete_appointment_event
            delete_appointment_event(appointment.id)
        except Exception as e:
            print(f"Google Calendar deletion on leave failed: {e}")
