from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from django_q.models import Schedule
from django_q.tasks import async_task
from .models import Notification
import sys

def send_notification_task(notification_id):
    """
    Background worker task to dispatch emails and handle retries with backoff.
    """
    try:
        notification = Notification.objects.get(id=notification_id)
    except Notification.DoesNotExist:
        return

    # Check state safety
    if notification.status in [Notification.Status.SENT]:
        return

    notification.status = Notification.Status.PROCESSING
    notification.attempts += 1
    notification.save()

    # Build email contents
    subject, body = generate_email_contents(notification)

    try:
        # Call Django's email sending interface
        # Configured backend/console depending on settings
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.EMAIL_FROM,
            recipient_list=[notification.user.email],
            fail_silently=False
        )
        # Success
        notification.status = Notification.Status.SENT
        notification.sent_at = timezone.now()
        notification.save()
        print(f"[Notifications Task] Notification {notification_id} sent successfully to {notification.user.email}.")
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"[Notifications Task Error] Failed to send notification {notification_id}: {error_msg}")
        
        notification.last_error = error_msg
        
        # Check retry limit
        MAX_RETRIES = 3
        if notification.attempts < MAX_RETRIES:
            notification.status = Notification.Status.PENDING
            notification.save()
            
            # Schedule retry task in 2 minutes
            retry_time = timezone.now() + timezone.timedelta(minutes=2)
            Schedule.objects.create(
                func='notifications.tasks.send_notification_task',
                args=(notification.id,),
                schedule_type=Schedule.ONCE,
                next_run=retry_time,
                cluster='ayusetu_tasks'
            )
            print(f"[Notifications Task] Scheduled retry #{notification.attempts} for notification {notification_id} at {retry_time}.")
        else:
            notification.status = Notification.Status.FAILED
            notification.save()
            print(f"[Notifications Task] Notification {notification_id} exceeded max retries. Marked as FAILED.")


def generate_email_contents(notification):
    """
    Helper to generate email subject and body based on notification type and relationships.
    """
    t_type = notification.type
    appt = notification.appointment
    user = notification.user
    
    # Generic fallbacks
    subject = "AyuSetu Notification"
    body = f"Hello {user.name},\n\nYou have a update from AyuSetu."

    if t_type == Notification.Type.BOOKING_CONFIRMATION:
        subject = "Appointment Confirmed - AyuSetu"
        body = (
            f"Hello {user.name},\n\n"
            f"Your appointment has been confirmed.\n"
            f"Doctor: Dr. {appt.doctor.user.name} ({appt.doctor.specialization})\n"
            f"Date: {appt.appointment_date}\n"
            f"Time: {appt.start_time} - {appt.end_time}\n\n"
            f"Please prepare to share symptoms or review details in your dashboard.\n\n"
            f"Thank you,\n"
            f"AyuSetu Multispeciality Clinic"
        )
    elif t_type == Notification.Type.CANCELLATION:
        subject = "Appointment Cancelled - AyuSetu"
        body = (
            f"Hello {user.name},\n\n"
            f"Your scheduled appointment has been cancelled.\n"
            f"Doctor: Dr. {appt.doctor.user.name} ({appt.doctor.specialization})\n"
            f"Date: {appt.appointment_date}\n"
            f"Time: {appt.start_time}\n\n"
            f"If you need to reschedule, please visit your dashboard.\n\n"
            f"Thank you,\n"
            f"AyuSetu Multispeciality Clinic"
        )
    elif t_type == Notification.Type.RESCHEDULE:
        subject = "Appointment Rescheduled - AyuSetu"
        body = (
            f"Hello {user.name},\n\n"
            f"Your appointment details have changed.\n"
            f"Doctor: Dr. {appt.doctor.user.name}\n"
            f"New Date: {appt.appointment_date}\n"
            f"New Time: {appt.start_time} - {appt.end_time}\n\n"
            f"Thank you,\n"
            f"AyuSetu Multispeciality Clinic"
        )
    elif t_type == Notification.Type.DOCTOR_LEAVE:
        subject = "Urgent: Doctor Leave Reschedule Required - AyuSetu"
        body = (
            f"Hello {user.name},\n\n"
            f"We regret to inform you that Dr. {appt.doctor.user.name} is on leave on {appt.appointment_date}.\n"
            f"Your appointment at {appt.start_time} has been cancelled.\n"
            f"Please log into AyuSetu to book an alternative slot.\n\n"
            f"Thank you,\n"
            f"AyuSetu Multispeciality Clinic"
        )
    elif t_type == Notification.Type.MEDICATION_REMINDER:
        # Get medicine details if prescription exists
        subject = "Medication Reminder - AyuSetu"
        body = (
            f"Hello {user.name},\n\n"
            f"This is a reminder to take your prescribed medication.\n"
            f"Please refer to the prescription guidelines in your dashboard.\n\n"
            f"Be well,\n"
            f"AyuSetu Healthcare System"
        )
    elif t_type == Notification.Type.APPOINTMENT_REMINDER:
        subject = "Upcoming Appointment Reminder - AyuSetu"
        body = (
            f"Hello {user.name},\n\n"
            f"Reminder: You have an appointment tomorrow.\n"
            f"Doctor: Dr. {appt.doctor.user.name}\n"
            f"Date: {appt.appointment_date}\n"
            f"Time: {appt.start_time}\n\n"
            f"Thank you,\n"
            f"AyuSetu Multispeciality Clinic"
        )

    return subject, body
