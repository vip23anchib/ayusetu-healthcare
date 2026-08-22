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
        self.stdout.write("Seeding AyuSetu database...")

        # 1. Create Admin
        admin_user, created = User.objects.get_or_create(
            email='admin@ayusetu.com',
            defaults={
                'username': 'admin@ayusetu.com',
                'name': 'AyuSetu Administrator',
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
        patient_1, created = User.objects.get_or_create(
            email='patient@ayusetu.com',
            defaults={
                'username': 'patient@ayusetu.com',
                'name': 'Jane Patient',
                'role': User.Role.PATIENT
            }
        )
        if created:
            patient_1.set_password('patientpassword')
            patient_1.save()
            self.stdout.write("Created Patient 1: patient@ayusetu.com (password: patientpassword)")

        patient_2, created = User.objects.get_or_create(
            email='patient2@ayusetu.com',
            defaults={
                'username': 'patient2@ayusetu.com',
                'name': 'John Patient',
                'role': User.Role.PATIENT
            }
        )
        if created:
            patient_2.set_password('patientpassword')
            patient_2.save()
            self.stdout.write("Created Patient 2: patient2@ayusetu.com (password: patientpassword)")

        # 3. Create Doctors & Profiles
        doctor_data = [
            {
                'email': 'heart@ayusetu.com',
                'name': 'Sarah Heart',
                'specialization': 'Cardiology',
                'slot_duration': 30
            },
            {
                'email': 'brain@ayusetu.com',
                'name': 'Charles Brain',
                'specialization': 'Neurology',
                'slot_duration': 30
            },
            {
                'email': 'child@ayusetu.com',
                'name': 'Lily Child',
                'specialization': 'Paediatrics',
                'slot_duration': 30
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

            # Auto-create Mon-Fri working hours (9 AM to 5 PM)
            if created:
                for day in range(5):  # Mon-Fri
                    DoctorWorkingHours.objects.get_or_create(
                        doctor=doctor_profile,
                        day_of_week=day,
                        defaults={
                            'start_time': datetime.time(9, 0),
                            'end_time': datetime.time(17, 0)
                        }
                    )
                self.stdout.write(f"Configured standard Mon-Fri hours for Dr. {doc_user.name}")

        # 4. Create an completed appointment and consultation history
        # Scheduled yesterday
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        appt_completed, created = Appointment.objects.get_or_create(
            doctor=doctors_list[0],  # Dr. Heart
            patient=patient_1,
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
                symptoms_text="Experiencing elevated heart rate after drinking coffee."
            )
            # Create Consultation Checkup
            consult = Consultation.objects.create(
                appointment=appt_completed,
                doctor_notes="Patient presented with transient sinus tachycardia. Recommended reducing caffeine intake and monitoring heart rates."
            )
            # Create Prescription
            presc = Prescription.objects.create(consultation=consult)
            Medication.objects.create(
                prescription=presc,
                medicine_name="Propranolol",
                dosage="10mg",
                frequency="Once daily",
                duration="5 days",
                instructions="Take in the morning if heart rate is over 100bpm."
            )
            # Create Post Visit Summary
            PostVisitSummary.objects.create(
                consultation=consult,
                summary="Dr. Sarah Heart noted a temporary fast heart rate related to caffeine. Reduced coffee consumption is advised. Propranolol 10mg was prescribed for 5 days to be taken once daily in the morning only if needed."
            )
            self.stdout.write("Created yesterday's completed heart consult and prescription.")

        # 5. Create upcoming confirmed appointments for today/tomorrow
        today = datetime.date.today()
        tomorrow = today + datetime.timedelta(days=1)
        
        Appointment.objects.get_or_create(
            doctor=doctors_list[1],  # Dr. Brain
            patient=patient_1,
            appointment_date=tomorrow,
            start_time=datetime.time(11, 0),
            defaults={
                'end_time': datetime.time(11, 30),
                'status': Appointment.Status.CONFIRMED
            }
        )
        
        Appointment.objects.get_or_create(
            doctor=doctors_list[2],  # Dr. Child
            patient=patient_2,
            appointment_date=tomorrow,
            start_time=datetime.time(14, 0),
            defaults={
                'end_time': datetime.time(14, 30),
                'status': Appointment.Status.CONFIRMED
            }
        )

        self.stdout.write("Successfully seeded database with clinical MVP profiles!")
