from django.db import models
from django.conf import settings

class DoctorGoogleCredentials(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='google_credentials')
    token = models.TextField()
    refresh_token = models.TextField(null=True, blank=True)
    token_uri = models.CharField(max_length=255)
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    scopes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Google Credentials for {self.user.email}"

class CalendarEvent(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        DELETED = 'DELETED', 'Deleted'
        FAILED = 'FAILED', 'Failed'

    appointment = models.OneToOneField('appointments.Appointment', on_delete=models.CASCADE, related_name='calendar_event')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='calendar_events')
    google_event_id = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Google Event for Appointment {self.appointment_id} - Status: {self.status}"
