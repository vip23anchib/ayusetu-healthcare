from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from accounts.models import User
from doctors.models import Doctor
from appointments.models import Appointment
from consultations.models import Symptom, PreVisitSummary, Consultation, PostVisitSummary
from consultations.services import trigger_pre_visit_summary, create_consultation
import datetime

class ConsultationTests(TestCase):
    def setUp(self):
        self.patient = User.objects.create_user(
            email='patient@ayusetu.com',
            name='Jane Patient',
            password='patientpassword',
            role='PATIENT'
        )
        self.doctor_user = User.objects.create_user(
            email='doctor@ayusetu.com',
            name='Dr. Hart',
            password='doctorpassword',
            role='DOCTOR'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization='Cardiology',
            slot_duration=30
        )
        # Create HELD appointment
        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            appointment_date=datetime.date.today(),
            start_time=datetime.time(9, 0),
            end_time=datetime.time(9, 30),
            status=Appointment.Status.HELD,
            hold_expires_at=timezone.now() + datetime.timedelta(minutes=5)
        )
        # Save symptoms
        self.symptom = Symptom.objects.create(
            appointment=self.appointment,
            symptoms_text='Experiencing mild chest tightness after light exercise.'
        )

    def test_pre_visit_summary_success(self):
        # Trigger summary (mock OpenAI is used since env OPENAI_API_KEY is empty)
        summary = trigger_pre_visit_summary(self.appointment.id)
        self.assertEqual(summary.status, 'COMPLETED')
        self.assertIn(summary.urgency, [PreVisitSummary.Urgency.LOW, PreVisitSummary.Urgency.MEDIUM, PreVisitSummary.Urgency.HIGH])
        self.assertGreater(len(summary.suggested_questions), 0)

    def test_pre_visit_summary_ai_failure(self):
        # Force OpenAI failure by setting an invalid state or monkeypatching the helper
        import consultations.services
        def fail_analyze(text):
            raise Exception("OpenAI API Down")
        
        original_analyze = consultations.services.analyze_symptoms
        consultations.services.analyze_symptoms = fail_analyze
        
        try:
            summary = trigger_pre_visit_summary(self.appointment.id)
            # The booking/trigger flow itself succeeds
            self.assertEqual(summary.status, 'UNAVAILABLE')
            self.assertEqual(summary.urgency, PreVisitSummary.Urgency.UNAVAILABLE)
            self.assertEqual(summary.chief_complaint, "AI summary is temporarily unavailable. Please review the patient's original symptoms.")
        finally:
            # Restore
            consultations.services.analyze_symptoms = original_analyze

    def test_create_consultation_flow(self):
        # Confirm appointment first
        self.appointment.status = Appointment.Status.CONFIRMED
        self.appointment.save()

        medications = [
            {
                'medicine_name': 'Aspirin',
                'dosage': '75mg',
                'frequency': 'Once daily',
                'duration': '30 days',
                'instructions': 'Take in the morning with food'
            }
        ]

        consult = create_consultation(
            appointment_id=self.appointment.id,
            doctor_notes='Patient has mild hypertension. Advised lifestyle changes and regular monitoring.',
            follow_up_date=datetime.date.today() + datetime.timedelta(days=14),
            medications=medications
        )

        self.assertEqual(consult.doctor_notes, 'Patient has mild hypertension. Advised lifestyle changes and regular monitoring.')
        # Check that appointment is marked completed
        self.appointment.refresh_from_db()
        self.assertEqual(self.appointment.status, Appointment.Status.COMPLETED)

        # Check medications count
        self.assertEqual(consult.prescription.medications.count(), 1)
        # Check post visit summary exists
        summary = PostVisitSummary.objects.get(consultation=consult)
        self.assertEqual(summary.status, 'COMPLETED')
        self.assertIn("Aspirin", summary.summary)
