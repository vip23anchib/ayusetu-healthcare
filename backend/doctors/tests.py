from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from doctors.models import Doctor, DoctorWorkingHours, DoctorLeave
import datetime

class DoctorTests(APITestCase):
    def setUp(self):
        # Create users
        self.admin_user = User.objects.create_user(
            email='admin@ayusetu.com',
            name='Clinic Admin',
            password='adminpassword',
            role='ADMIN'
        )
        self.doctor_user = User.objects.create_user(
            email='doctor@ayusetu.com',
            name='Doctor Smith',
            password='doctorpassword',
            role='DOCTOR'
        )
        # Create a doctor profile for doctor_user
        self.doctor_profile = Doctor.objects.create(
            user=self.doctor_user,
            specialization='Cardiology',
            slot_duration=30
        )
        
        self.list_url = reverse('doctor-list')
        self.detail_url = reverse('doctor-detail', args=[self.doctor_profile.id])
        self.admin_list_url = reverse('admin-doctor-list')
        self.admin_detail_url = reverse('admin-doctor-detail', args=[self.doctor_profile.id])

    def test_list_doctors_authenticated(self):
        self.client.force_authenticate(user=self.doctor_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_doctors_unauthenticated(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_create_doctor(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'email': 'newdoctor@ayusetu.com',
            'name': 'Dr. John Watson',
            'password': 'watsonpassword',
            'specialization': 'General Medicine',
            'slot_duration': 20
        }
        response = self.client.post(self.admin_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Doctor.objects.filter(user__email='newdoctor@ayusetu.com').exists())

    def test_patient_cannot_create_doctor(self):
        patient = User.objects.create_user(
            email='patient@ayusetu.com',
            name='Jane Patient',
            password='patientpassword',
            role='PATIENT'
        )
        self.client.force_authenticate(user=patient)
        data = {
            'email': 'newdoctor@ayusetu.com',
            'name': 'Dr. Watson',
            'specialization': 'General Medicine'
        }
        response = self.client.post(self.admin_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_doctor_update_working_hours(self):
        self.client.force_authenticate(user=self.doctor_user)
        url = reverse('doctor-working-hours', args=[self.doctor_profile.id])
        data = {
            'day_of_week': 0, # Monday
            'start_time': '09:00:00',
            'end_time': '17:00:00'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(DoctorWorkingHours.objects.filter(doctor=self.doctor_profile, day_of_week=0).exists())

    def test_admin_manage_doctor_leave(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-doctor-leave', args=[self.doctor_profile.id])
        data = {
            'leave_date': '2026-09-01',
            'reason': 'Medical Conference'
        }
        # Add leave
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(DoctorLeave.objects.filter(doctor=self.doctor_profile, leave_date='2026-09-01').exists())

        # Duplicate leave should be rejected
        response_dup = self.client.post(url, data)
        self.assertEqual(response_dup.status_code, status.HTTP_400_BAD_REQUEST)

        # Remove leave
        response_del = self.client.delete(f"{url}?leave_date=2026-09-01")
        self.assertEqual(response_del.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DoctorLeave.objects.filter(doctor=self.doctor_profile, leave_date='2026-09-01').exists())
