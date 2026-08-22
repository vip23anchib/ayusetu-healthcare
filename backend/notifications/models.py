from django.db import models
from django.conf import settings

class Notification(models.Model):
    class Type(models.TextChoices):
        BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION', 'Booking Confirmation'
        APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER', 'Appointment Reminder'
        RESCHEDULE = 'RESCHEDULE', 'Reschedule'
        CANCELLATION = 'CANCELLATION', 'Cancellation'
        DOCTOR_LEAVE = 'DOCTOR_LEAVE', 'Doctor Leave'
        MEDICATION_REMINDER = 'MEDICATION_REMINDER', 'Medication Reminder'

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        SENT = 'SENT', 'Sent'
        FAILED = 'FAILED', 'Failed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    appointment = models.ForeignKey('appointments.Appointment', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    type = models.CharField(max_length=30, choices=Type.choices)
    channel = models.CharField(max_length=10, choices=Channel.choices, default=Channel.EMAIL)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    attempts = models.PositiveIntegerField(default=0)
    scheduled_at = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification {self.id} for {self.user.email} - Type: {self.type} - Status: {self.status}"
