from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from accounts.models import User
from doctors.models import Doctor
from appointments.models import Appointment
from calendar_integration.models import CalendarEvent, DoctorGoogleCredentials
from calendar_integration.services import (
    sync_appointment_event, 
    update_appointment_event, 
    delete_appointment_event
)
import datetime

class CalendarIntegrationTests(APITestCase):
    def setUp(self):
        self.patient = User.objects.create_user(
            email='patient@ayusetu.com',
            name='Jane Patient',
            password='patientpassword',
            role='PATIENT'
        )
        self.doctor_user = User.objects.create_user(
            email='doctor@ayusetu.com',
            name='Dr. Heart',
            password='doctorpassword',
            role='DOCTOR'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization='Cardiology',
            slot_duration=30
        )
        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            appointment_date=datetime.date.today(),
            start_time=datetime.time(14, 0),
            end_time=datetime.time(14, 30),
            status=Appointment.Status.CONFIRMED
        )
        self.connect_url = reverse('calendar-connect')
        self.callback_url = reverse('calendar-callback')

    def test_connect_unauthenticated(self):
        response = self.client.post(self.connect_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_connect_doctor_success_mock(self):
        self.client.force_authenticate(user=self.doctor_user)
        response = self.client.post(self.connect_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("authorization_url", response.data)
        self.assertIn("mock_code_123", response.data["authorization_url"])

    def test_callback_mock_creates_credentials(self):
        # Triggering mock callback URL
        url = f"{self.callback_url}?code=mock_code_123&user_id={self.doctor_user.id}"
        response = self.client.get(url)
        
        # Verify redirect to doctor dashboard
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn("/doctor/dashboard?calendar=connected", response.url)
        
        # Verify credentials database record exists
        self.assertTrue(DoctorGoogleCredentials.objects.filter(user=self.doctor_user).exists())

    def test_calendar_sync_create_update_delete(self):
        # 1. Sync Event (Create)
        sync_appointment_event(self.appointment.id)
        
        # Assert CalendarEvent model created
        cal_event = CalendarEvent.objects.get(appointment=self.appointment)
        self.assertEqual(cal_event.status, CalendarEvent.Status.ACTIVE)
        self.assertTrue(cal_event.google_event_id.startswith("mock_google_event_"))

        # 2. Reschedule Update
        self.appointment.start_time = datetime.time(15, 0)
        self.appointment.end_time = datetime.time(15, 30)
        self.appointment.save()

        update_appointment_event(self.appointment.id)
        cal_event.refresh_from_db()
        self.assertEqual(cal_event.status, CalendarEvent.Status.ACTIVE)

        # 3. Cancellation Delete
        delete_appointment_event(self.appointment.id)
        cal_event.refresh_from_db()
        self.assertEqual(cal_event.status, CalendarEvent.Status.DELETED)
