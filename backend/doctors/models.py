from django.db import models
from django.conf import settings

class Doctor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=255)
    slot_duration = models.PositiveIntegerField(default=30)  # duration in minutes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.user.name} - {self.specialization}"

class DoctorWorkingHours(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, 'Monday'
        TUESDAY = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY = 3, 'Thursday'
        FRIDAY = 4, 'Friday'
        SATURDAY = 5, 'Saturday'
        SUNDAY = 6, 'Sunday'

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='working_hours')
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        verbose_name_plural = "Doctor Working Hours"
        # Optional: constraint to ensure unique working hours per day for a doctor
        constraints = [
            models.UniqueConstraint(fields=['doctor', 'day_of_week'], name='unique_doctor_working_day')
        ]

    def __str__(self):
        return f"{self.doctor.user.name} - {self.get_day_of_week_display()}: {self.start_time} to {self.end_time}"

class DoctorLeave(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='leaves')
    leave_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['doctor', 'leave_date'], name='unique_doctor_leave_date')
        ]

    def __str__(self):
        return f"{self.doctor.user.name} Leave on {self.leave_date}"
