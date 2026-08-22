from django.test import TestCase
from django.core import mail
from django.utils import timezone
from django_q.models import Schedule
from accounts.models import User
from doctors.models import Doctor
from appointments.models import Appointment
from consultations.models import Consultation, Prescription, Medication
from notifications.models import Notification
from notifications.tasks import send_notification_task
from notifications.services import (
    queue_booking_notifications, 
    schedule_medication_reminders
)
import datetime
from unittest.mock import patch

class NotificationTests(TestCase):
    def setUp(self):
        self.patient = User.objects.create_user(
            email='patient@ayusetu.com',
            name='Jane Patient',
            password='patientpassword',
            role='PATIENT'
        )
        self.doctor_user = User.objects.create_user(
            email='doctor@ayusetu.com',
            name='Dr. Smith',
            password='doctorpassword',
            role='DOCTOR'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization='General Medicine',
            slot_duration=30
        )
        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            appointment_date=datetime.date.today(),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(10, 30),
            status=Appointment.Status.CONFIRMED
        )

    def test_send_notification_success(self):
        # Create pending notification
        notification = Notification.objects.create(
            user=self.patient,
            appointment=self.appointment,
            type=Notification.Type.BOOKING_CONFIRMATION,
            status=Notification.Status.PENDING,
            scheduled_at=timezone.now()
        )

        send_notification_task(notification.id)

        notification.refresh_from_db()
        self.assertEqual(notification.status, Notification.Status.SENT)
        self.assertEqual(notification.attempts, 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Appointment Confirmed", mail.outbox[0].subject)

    def test_send_notification_retry_on_failure(self):
        notification = Notification.objects.create(
            user=self.patient,
            appointment=self.appointment,
            type=Notification.Type.BOOKING_CONFIRMATION,
            status=Notification.Status.PENDING,
            scheduled_at=timezone.now()
        )

        # Mock send_mail to raise exception
        with patch('notifications.tasks.send_mail', side_effect=Exception("SMTP Server Down")):
            send_notification_task(notification.id)

        notification.refresh_from_db()
        # Status should remain PENDING (ready for retry)
        self.assertEqual(notification.status, Notification.Status.PENDING)
        self.assertEqual(notification.attempts, 1)
        self.assertIn("SMTP Server Down", notification.last_error)
        
        # Verify a Django-Q Schedule was created for retry
        self.assertTrue(Schedule.objects.filter(func='notifications.tasks.send_notification_task').exists())

    def test_schedule_medication_reminders_derivation(self):
        consultation = Consultation.objects.create(
            appointment=self.appointment,
            doctor_notes='Patient has mild issues'
        )
        prescription = Prescription.objects.create(consultation=consultation)
        
        # 5 days duration, "Twice daily" frequency -> should schedule 10 reminders
        Medication.objects.create(
            prescription=prescription,
            medicine_name='Metformin',
            dosage='500mg',
            frequency='Twice daily',
            duration='5 days',
            instructions='Take with meals'
        )

        # Clear existing schedules
        Schedule.objects.all().delete()

        fixed_now = timezone.make_aware(datetime.datetime(2026, 8, 22, 5, 0, 0))
        with patch('django.utils.timezone.now', return_value=fixed_now):
            schedule_medication_reminders(prescription.id)

        # Assert correct count of generated reminders (we only schedule future reminders, since starting time is now,
        # it will schedule all 10 because time is offset by days/hours into the future)
        notifications = Notification.objects.filter(type=Notification.Type.MEDICATION_REMINDER)
        schedules = Schedule.objects.filter(func='notifications.tasks.send_notification_task')
        
        self.assertEqual(notifications.count(), 10)
        self.assertEqual(schedules.count(), 10)
