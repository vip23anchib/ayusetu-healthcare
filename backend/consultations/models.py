from django.db import models

class Symptom(models.Model):
    appointment = models.OneToOneField('appointments.Appointment', on_delete=models.CASCADE, related_name='symptoms')
    symptoms_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Symptoms for Appointment {self.appointment_id}"

class PreVisitSummary(models.Model):
    class Urgency(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        UNAVAILABLE = 'UNAVAILABLE', 'Unavailable'

    appointment = models.OneToOneField('appointments.Appointment', on_delete=models.CASCADE, related_name='pre_visit_summary')
    urgency = models.CharField(max_length=15, choices=Urgency.choices, default=Urgency.UNAVAILABLE)
    chief_complaint = models.TextField(blank=True)
    suggested_questions = models.JSONField(default=list)  # Store exact 3 questions list
    raw_response = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='PENDING')  # PENDING, COMPLETED, FAILED
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Pre Visit Summaries"

    def __str__(self):
        return f"PreVisit Summary for Appointment {self.appointment_id} - Urgency: {self.urgency}"

class Consultation(models.Model):
    appointment = models.OneToOneField('appointments.Appointment', on_delete=models.CASCADE, related_name='consultation')
    doctor_notes = models.TextField()
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consultation for Appointment {self.appointment_id}"

class Prescription(models.Model):
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='prescription')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Prescription for Consultation {self.consultation_id}"

class Medication(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='medications')
    medicine_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=255)  # e.g., "500mg"
    frequency = models.CharField(max_length=255)  # e.g., "Twice daily"
    duration = models.CharField(max_length=255)  # e.g., "5 days"
    instructions = models.CharField(max_length=255, blank=True)  # e.g., "Take after food"

    def __str__(self):
        return f"{self.medicine_name} - {self.dosage} ({self.frequency})"

class PostVisitSummary(models.Model):
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='post_visit_summary')
    summary = models.TextField()
    status = models.CharField(max_length=20, default='PENDING')  # PENDING, COMPLETED, FAILED
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Post Visit Summaries"

    def __str__(self):
        return f"PostVisit Summary for Consultation {self.consultation_id}"
