from django.test import TransactionTestCase
from django.utils import timezone
from django.db import connection
from django.core.exceptions import ValidationError
from accounts.models import User
from doctors.models import Doctor, DoctorWorkingHours, DoctorLeave
from appointments.models import Appointment
from appointments.services import (
    hold_slot, 
    confirm_booking, 
    cancel_appointment, 
    reschedule_appointment, 
    SlotConflictError,
    generate_available_slots
)
import datetime
import threading
import time

class AppointmentTests(TransactionTestCase):
    # Use TransactionTestCase to test multi-threaded database transactions

    def setUp(self):
        # Create unique users
        self.patient_1 = User.objects.create_user(
            email='patient1@ayusetu.com',
            name='Jane Patient One',
            password='patientpassword',
            role='PATIENT'
        )
        self.patient_2 = User.objects.create_user(
            email='patient2@ayusetu.com',
            name='John Patient Two',
            password='patientpassword',
            role='PATIENT'
        )
        self.doctor_user = User.objects.create_user(
            email='cardiologist@ayusetu.com',
            name='Dr. Heart',
            password='doctorpassword',
            role='DOCTOR'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization='Cardiology',
            slot_duration=30
        )
        # Setup Monday working hours: 09:00:00 to 12:00:00
        self.working_hours = DoctorWorkingHours.objects.create(
            doctor=self.doctor,
            day_of_week=0, # Monday
            start_time='09:00:00',
            end_time='12:00:00'
        )
        # Test Monday date
        self.test_date = datetime.date(2026, 8, 24) # 2026-08-24 is a Monday

    def test_generate_available_slots(self):
        slots = generate_available_slots(self.doctor.id, self.test_date)
        # 9:00-9:30, 9:30-10:00, 10:00-10:30, 10:30-11:00, 11:00-11:30, 11:30-12:00
        self.assertEqual(len(slots), 6)
        self.assertTrue(slots[0]['available'])

    def test_hold_slot_success(self):
        appt = hold_slot(self.patient_1, self.doctor.id, self.test_date, '09:00:00')
        self.assertEqual(appt.status, Appointment.Status.HELD)
        self.assertEqual(appt.patient, self.patient_1)

    def test_hold_slot_outside_hours(self):
        with self.assertRaises(ValidationError):
            hold_slot(self.patient_1, self.doctor.id, self.test_date, '08:30:00')
        with self.assertRaises(ValidationError):
            hold_slot(self.patient_1, self.doctor.id, self.test_date, '12:00:00')

    def test_hold_slot_during_leave(self):
        DoctorLeave.objects.create(doctor=self.doctor, leave_date=self.test_date, reason='Conference')
        with self.assertRaises(ValidationError):
            hold_slot(self.patient_1, self.doctor.id, self.test_date, '09:00:00')

    def test_double_booking_concurrency(self):
        """
        Simulate two simultaneous threads booking the same slot for the same doctor.
        Assert that exactly one succeeds and one fails with a SlotConflictError or IntegrityError.
        """
        results = []
        
        # Define thread worker
        def book_slot_worker(patient, results_list):
            # Close connection to force thread to open its own DB connection
            connection.close()
            try:
                hold_slot(patient, self.doctor.id, self.test_date, '09:30:00')
                results_list.append("SUCCESS")
            except SlotConflictError:
                results_list.append("CONFLICT")
            except Exception as e:
                results_list.append(f"ERROR: {str(type(e))}")
            finally:
                connection.close()

        # Start two threads at the same time
        thread1 = threading.Thread(target=book_slot_worker, args=(self.patient_1, results))
        thread2 = threading.Thread(target=book_slot_worker, args=(self.patient_2, results))

        thread1.start()
        thread2.start()

        thread1.join()
        thread2.join()

        # Assertions
        self.assertEqual(results.count("SUCCESS"), 1)
        self.assertEqual(results.count("CONFLICT"), 1)

    def test_cancellation_and_slot_release(self):
        appt = hold_slot(self.patient_1, self.doctor.id, self.test_date, '10:00:00')
        cancel_appointment(appt.id, self.patient_1)
        
        # After cancellation, slot should be reusable
        appt_2 = hold_slot(self.patient_2, self.doctor.id, self.test_date, '10:00:00')
        self.assertEqual(appt_2.status, Appointment.Status.HELD)
        self.assertEqual(appt_2.patient, self.patient_2)

    def test_reschedule_success(self):
        appt = hold_slot(self.patient_1, self.doctor.id, self.test_date, '10:30:00')
        confirmed = confirm_booking(appt.id, 'Stomach pain')
        
        rescheduled = reschedule_appointment(confirmed.id, self.patient_1, self.test_date, '11:00:00')
        self.assertEqual(rescheduled.start_time, datetime.time(11, 0))
