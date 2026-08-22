from django.utils import timezone
from django_q.tasks import async_task
from django_q.models import Schedule
from appointments.models import Appointment
from consultations.models import Prescription, Medication
from .models import Notification
import re

def _queue_task_safe(notification_id):
    """Triggers the async task wrapper."""
    try:
        async_task('notifications.tasks.send_notification_task', notification_id)
    except Exception as e:
        print(f"[Notifications Service Warning] Failed to schedule async task in Django-Q: {e}")

def queue_booking_notifications(appointment_id):
    try:
        appt = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return

    now = timezone.now()

    # Patient Notification
    n_pat = Notification.objects.create(
        user=appt.patient,
        appointment=appt,
        type=Notification.Type.BOOKING_CONFIRMATION,
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_pat.id)

    # Doctor Notification
    n_doc = Notification.objects.create(
        user=appt.doctor.user,
        appointment=appt,
        type=Notification.Type.BOOKING_CONFIRMATION,
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_doc.id)


def queue_cancellation_notifications(appointment_id):
    try:
        appt = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return

    now = timezone.now()

    # Patient Notification
    n_pat = Notification.objects.create(
        user=appt.patient,
        appointment=appt,
        type=Notification.Type.CANCELLATION,
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_pat.id)

    # Doctor Notification
    n_doc = Notification.objects.create(
        user=appt.doctor.user,
        appointment=appt,
        type=Notification.Type.CANCELLATION,
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_doc.id)


def queue_reschedule_notifications(appointment_id):
    try:
        appt = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return

    now = timezone.now()

    n_pat = Notification.objects.create(
        user=appt.patient,
        appointment=appt,
        type=Notification.Type.RESCHEDULE,
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_pat.id)

    n_doc = Notification.objects.create(
        user=appt.doctor.user,
        appointment=appt,
        type=Notification.Type.RESCHEDULE,
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_doc.id)


def queue_leave_notifications(appointment_id):
    try:
        appt = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return

    now = timezone.now()

    n_pat = Notification.objects.create(
        user=appt.patient,
        appointment=appt,
        type=Notification.Type.DOCTOR_LEAVE,
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_pat.id)


def queue_post_visit_notifications(appointment_id):
    try:
        appt = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return

    now = timezone.now()

    n_pat = Notification.objects.create(
        user=appt.patient,
        appointment=appt,
        # Notify of completed consultation summary availability
        type=Notification.Type.APPOINTMENT_REMINDER, 
        status=Notification.Status.PENDING,
        scheduled_at=now
    )
    _queue_task_safe(n_pat.id)


def schedule_medication_reminders(prescription_id):
    """
    Derives reminder schedule based on medication duration and frequency.
    """
    try:
        prescription = Prescription.objects.get(id=prescription_id)
    except Prescription.DoesNotExist:
        return

    patient = prescription.consultation.appointment.patient
    appointment = prescription.consultation.appointment
    medications = prescription.medications.all()

    for med in medications:
        # Extract number of days from duration string, e.g., "5 days"
        days_count = 3  # default fallback
        match = re.search(r'\d+', med.duration)
        if match:
            days_count = int(match.group())

        # Determine daily times based on frequency string
        freq = med.frequency.lower()
        times_of_day = [9]  # 9 AM default
        
        if "twice" in freq or "2 times" in freq or "bid" in freq:
            times_of_day = [9, 21]  # 9 AM, 9 PM
        elif "three" in freq or "3 times" in freq or "tid" in freq:
            times_of_day = [8, 14, 20]  # 8 AM, 2 PM, 8 PM
        elif "four" in freq or "4 times" in freq or "qid" in freq:
            times_of_day = [8, 12, 16, 20]

        # Schedule notifications for each day and time
        now = timezone.now()
        
        for d in range(days_count):
            for t_hour in times_of_day:
                # Calculate scheduled time
                scheduled_time = now + timezone.timedelta(days=d)
                # Set target hour
                scheduled_time = scheduled_time.replace(hour=t_hour, minute=0, second=0, microsecond=0)
                
                # Ensure we don't schedule medication reminders in the past
                if scheduled_time > timezone.now():
                    notification = Notification.objects.create(
                        user=patient,
                        appointment=appointment,
                        type=Notification.Type.MEDICATION_REMINDER,
                        status=Notification.Status.PENDING,
                        scheduled_at=scheduled_time
                    )
                    
                    try:
                        Schedule.objects.create(
                            func='notifications.tasks.send_notification_task',
                            args=(notification.id,),
                            schedule_type=Schedule.ONCE,
                            next_run=scheduled_time,
                            cluster='ayusetu_tasks'
                        )
                    except Exception as e:
                        print(f"[Notifications Service Error] Failed to schedule medication reminder: {e}")
