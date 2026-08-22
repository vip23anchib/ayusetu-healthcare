from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User
from doctors.models import Doctor, DoctorWorkingHours, DoctorLeave
from appointments.models import Appointment
from consultations.models import Consultation, Prescription, Medication, PostVisitSummary
import datetime

class Command(BaseCommand):
    help = 'Seeds the AyuSetu database with default users, doctors, and slots.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding AyuSetu database with authentic Indian clinic data...")

        # 1. Create Admin
        admin_user, created = User.objects.get_or_create(
            email='admin@ayusetu.com',
            defaults={
                'username': 'admin@ayusetu.com',
                'name': 'AyuSetu Multispeciality Clinic Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('adminpassword')
            admin_user.save()
            self.stdout.write("Created Admin: admin@ayusetu.com (password: adminpassword)")

        # 2. Create Patients
        patient_data = [
            {'email': 'rohan.malhotra@example.com', 'name': 'Rohan Malhotra'},
            {'email': 'aditya.sharma@example.com', 'name': 'Aditya Sharma'},
            {'email': 'priya.nair@example.com', 'name': 'Priya Nair'},
            {'email': 'kabir.meeta@example.com', 'name': 'Kabir Mehta'}
        ]

        patients_list = []
        for p in patient_data:
            p_user, created = User.objects.get_or_create(
                email=p['email'],
                defaults={
                    'username': p['email'],
                    'name': p['name'],
                    'role': User.Role.PATIENT
                }
            )
            if created:
                p_user.set_password('patientpassword')
                p_user.save()
                self.stdout.write(f"Created Patient: {p['name']} ({p['email']})")
            patients_list.append(p_user)

        # 3. Create Doctors & Profiles
        doctor_data = [
            {
                'email': 'ananya.reddy@example.com',
                'name': 'Ananya Reddy',
                'specialization': 'Cardiology',
                'slot_duration': 30,
                'split_shift': False
            },
            {
                'email': 'vikram.iyer@example.com',
                'name': 'Vikram Iyer',
                'specialization': 'General Physician',
                'slot_duration': 30,
                'split_shift': True  # split shift
            },
            {
                'email': 'meera.krishnan@example.com',
                'name': 'Meera Krishnan',
                'specialization': 'Dermatology',
                'slot_duration': 30,
                'split_shift': False
            },
            {
                'email': 'arjun.kapoor@example.com',
                'name': 'Arjun Kapoor',
                'specialization': 'Orthopedics',
                'slot_duration': 30,
                'split_shift': False
            },
            {
                'email': 'sana.sheikh@example.com',
                'name': 'Sana Sheikh',
                'specialization': 'Pediatrics',
                'slot_duration': 30,
                'split_shift': False
            },
            {
                'email': 'rajesh.nair@example.com',
                'name': 'Rajesh Nair',
                'specialization': 'ENT Specialist',
                'slot_duration': 30,
                'split_shift': False
            }
        ]

        doctors_list = []
        for doc in doctor_data:
            doc_user, created = User.objects.get_or_create(
                email=doc['email'],
                defaults={
                    'username': doc['email'],
                    'name': doc['name'],
                    'role': User.Role.DOCTOR
                }
            )
            if created:
                doc_user.set_password('doctorpassword')
                doc_user.save()
                self.stdout.write(f"Created Doctor User: {doc['email']} (password: doctorpassword)")

            doctor_profile, created = Doctor.objects.get_or_create(
                user=doc_user,
                defaults={
                    'specialization': doc['specialization'],
                    'slot_duration': doc['slot_duration']
                }
            )
            doctors_list.append(doctor_profile)

            # Auto-create Mon-Fri working hours
            if created:
                if doc['split_shift']:
                    # Split shift: 9:00 - 13:00 and 17:00 - 21:00
                    for day in range(5):
                        DoctorWorkingHours.objects.create(
                            doctor=doctor_profile,
                            day_of_week=day,
                            start_time=datetime.time(9, 0),
                            end_time=datetime.time(13, 0)
                        )
                        DoctorWorkingHours.objects.create(
                            doctor=doctor_profile,
                            day_of_week=day,
                            start_time=datetime.time(17, 0),
                            end_time=datetime.time(21, 0)
                        )
                    self.stdout.write(f"Configured Split Shift (9:00-13:00 & 17:00-21:00) for Dr. {doc_user.name}")
                else:
                    # Standard Mon-Fri working hours (9 AM to 5 PM)
                    for day in range(5):  # Mon-Fri
                        DoctorWorkingHours.objects.create(
                            doctor=doctor_profile,
                            day_of_week=day,
                            start_time=datetime.time(9, 0),
                            end_time=datetime.time(17, 0)
                        )
                    self.stdout.write(f"Configured standard Mon-Fri hours for Dr. {doc_user.name}")

        # 4. Create a completed appointment and consultation history
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        appt_completed, created = Appointment.objects.get_or_create(
            doctor=doctors_list[0],  # Dr. Ananya Reddy (Cardiology)
            patient=patients_list[0],  # Rohan Malhotra
            appointment_date=yesterday,
            start_time=datetime.time(10, 0),
            defaults={
                'end_time': datetime.time(10, 30),
                'status': Appointment.Status.COMPLETED
            }
        )
        
        if created:
            # Create symptoms
            from consultations.models import Symptom
            Symptom.objects.create(
                appointment=appt_completed,
                symptoms_text="Fever for 2 days with body ache and mild cough."
            )
            # Create Consultation Checkup
            consult = Consultation.objects.create(
                appointment=appt_completed,
                doctor_notes="Patient presented with acute viral symptoms. Body aches and fever peaking at 101F. Chest clear on auscultation. Advised hydration and complete rest."
            )
            # Create Prescription
            presc = Prescription.objects.create(consultation=consult)
            Medication.objects.create(
                prescription=presc,
                medicine_name="Paracetamol",
                dosage="650mg",
                frequency="Three times daily",
                duration="3 days",
                instructions="Take after food."
            )
            Medication.objects.create(
                prescription=presc,
                medicine_name="Cetirizine",
                dosage="10mg",
                frequency="Once daily",
                duration="5 days",
                instructions="Take at bedtime."
            )
            # Create Post Visit Summary
            PostVisitSummary.objects.create(
                consultation=consult,
                summary="Dr. Ananya Reddy noted fever and body aches indicating a viral infection. Please take rest and keep hydrated. Paracetamol 650mg is prescribed 3 times daily for 3 days after meals. Cetirizine 10mg should be taken once daily at bedtime for 5 days."
            )
            self.stdout.write("Created yesterday's completed consultation for Rohan Malhotra.")

        # 5. Create upcoming confirmed appointments for tomorrow
        tomorrow = datetime.date.today() + datetime.timedelta(days=1)
        
        Appointment.objects.get_or_create(
            doctor=doctors_list[1],  # Dr. Vikram Iyer (General Physician, split shift)
            patient=patients_list[0],  # Rohan Malhotra
            appointment_date=tomorrow,
            start_time=datetime.time(11, 0),
            defaults={
                'end_time': datetime.time(11, 30),
                'status': Appointment.Status.CONFIRMED
            }
        )
        
        Appointment.objects.get_or_create(
            doctor=doctors_list[2],  # Dr. Meera Krishnan (Dermatology)
            patient=patients_list[1],  # Aditya Sharma
            appointment_date=tomorrow,
            start_time=datetime.time(14, 0),
            defaults={
                'end_time': datetime.time(14, 30),
                'status': Appointment.Status.CONFIRMED
            }
        )

        self.stdout.write("Successfully seeded AyuSetu Multispeciality Clinic database!")
