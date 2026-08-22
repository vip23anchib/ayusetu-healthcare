from django.db import models
from django.conf import settings
from django.db.models import Q

class Appointment(models.Model):
    class Status(models.TextChoices):
        HELD = 'HELD', 'Held'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        EXPIRED = 'EXPIRED', 'Expired'

    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.HELD)
    hold_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'appointment_date', 'start_time'],
                condition=Q(status__in=['HELD', 'CONFIRMED', 'COMPLETED']),
                name='unique_active_appointment_slot'
            )
        ]

    def __str__(self):
        return f"{self.patient.name} with {self.doctor.user.name} on {self.appointment_date} at {self.start_time}"
