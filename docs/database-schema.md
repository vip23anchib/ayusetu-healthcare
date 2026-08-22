# AyuSetu — Database Schema Documentation

This document describes the database schema, models relationships, constraints, indexes, and database selection rationale.

## 1. Why PostgreSQL Was Chosen
PostgreSQL was selected as the target production database engine due to several key features:
1. **Robust Row-Level Locking:** High-concurrency schedules require reliable row serialization. PostgreSQL's implementation of `SELECT FOR UPDATE` blocks competing transaction requests until the lock is released or committed.
2. **Partial Unique Indexes:** Supported natively via partial conditions (e.g. unique constraint applied only where status is active, filtering out cancelled/expired schedules).
3. **Transactional DDL & ACID Integrity:** Full compliance with complex nested saves, rolling back cleanly if integrations fail.

---

## 2. Table Schemas & Relationships

### accounts_user (User Profile)
- **id:** `integer` (Primary Key)
- **name:** `varchar(255)`
- **email:** `varchar(254)` (Unique Index)
- **username:** `varchar(150)` (Unique)
- **role:** `varchar(10)` (Choice: `PATIENT`, `DOCTOR`, `ADMIN`)

### doctors_doctor (Doctor Profile)
- **id:** `integer` (Primary Key)
- **user_id:** `integer` (ForeignKey → `accounts_user.id`, One-to-One)
- **specialization:** `varchar(100)`
- **slot_duration:** `integer` (Duration in minutes)

### doctors_doctorworkinghours (Working Hours Schedule)
- **id:** `integer` (Primary Key)
- **doctor_id:** `integer` (ForeignKey → `doctors_doctor.id`)
- **day_of_week:** `integer` (Choice: `0` [Mon] to `6` [Sun])
- **start_time:** `time`
- **end_time:** `time`

### doctors_doctorleave (Doctor Leave Logs)
- **id:** `integer` (Primary Key)
- **doctor_id:** `integer` (ForeignKey → `doctors_doctor.id`)
- **leave_date:** `date`
- **reason:** `varchar(255)`
- **Constraint:** Unique index on `(doctor_id, leave_date)` to prevent duplicate entries per day.

### appointments_appointment (Appointment ledger)
- **id:** `integer` (Primary Key)
- **doctor_id:** `integer` (ForeignKey → `doctors_doctor.id`)
- **patient_id:** `integer` (ForeignKey → `accounts_user.id`)
- **appointment_date:** `date`
- **start_time:** `time`
- **end_time:** `time`
- **status:** `varchar(15)` (Choice: `HELD`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `EXPIRED`)
- **hold_expires_at:** `datetime` (Null if not in held state)
- **Constraint:** Unique partial constraint `unique_active_appointment_slot` on `(doctor_id, appointment_date, start_time)` filtered to apply only for active statuses (`HELD`, `CONFIRMED`, `COMPLETED`).

### consultations_symptom (Patient symptoms raw log)
- **id:** `integer` (Primary Key)
- **appointment_id:** `integer` (ForeignKey → `appointments_appointment.id`, One-to-One)
- **symptoms_text:** `text`

### consultations_previsitsummary (AI Pre-visit triage summaries)
- **id:** `integer` (Primary Key)
- **appointment_id:** `integer` (ForeignKey → `appointments_appointment.id`, One-to-One)
- **urgency:** `varchar(15)` (Choice: `LOW`, `MEDIUM`, `HIGH`, `UNAVAILABLE`)
- **chief_complaint:** `text`
- **suggested_questions:** `json` (List of 3 questions)
- **status:** `varchar(15)` (Choice: `PENDING`, `COMPLETED`, `FAILED`)

### consultations_consultation (Doctor consult checkup notes)
- **id:** `integer` (Primary Key)
- **appointment_id:** `integer` (ForeignKey → `appointments_appointment.id`, One-to-One)
- **doctor_notes:** `text`
- **follow_up_date:** `date` (Null if not requested)

### consultations_prescription (Prescriptions)
- **id:** `integer` (Primary Key)
- **consultation_id:** `integer` (ForeignKey → `consultations_consultation.id`, One-to-One)

### consultations_medication (Individual medicines)
- **id:** `integer` (Primary Key)
- **prescription_id:** `integer` (ForeignKey → `consultations_prescription.id`)
- **medicine_name:** `varchar(255)`
- **dosage:** `varchar(100)`
- **frequency:** `varchar(100)`
- **duration:** `varchar(100)`
- **instructions:** `text`

### consultations_postvisitsummary (AI Post-visit summary)
- **id:** `integer` (Primary Key)
- **consultation_id:** `integer` (ForeignKey → `consultations_consultation.id`, One-to-One)
- **summary:** `text`
- **status:** `varchar(15)`

### notifications_notification (Background email logger)
- **id:** `integer` (Primary Key)
- **user_id:** `integer` (ForeignKey → `accounts_user.id`)
- **appointment_id:** `integer` (ForeignKey → `appointments_appointment.id`, Nullable)
- **type:** `varchar(30)` (Choice: `BOOKING_CONFIRMATION`, `APPOINTMENT_REMINDER`, `RESCHEDULE`, `CANCELLATION`, `DOCTOR_LEAVE`, `MEDICATION_REMINDER`)
- **channel:** `varchar(10)` (Choice: `EMAIL`)
- **status:** `varchar(15)` (Choice: `PENDING`, `PROCESSING`, `SENT`, `FAILED`)
- **attempts:** `integer`
- **scheduled_at:** `datetime`
- **sent_at:** `datetime` (Null if not sent yet)
- **last_error:** `text`

### calendar_integration_calendarevent (Google Calendar sync logs)
- **id:** `integer` (Primary Key)
- **appointment_id:** `integer` (ForeignKey → `appointments_appointment.id`, One-to-One)
- **user_id:** `integer` (ForeignKey → `accounts_user.id`)
- **google_event_id:** `varchar(255)`
- **status:** `varchar(15)` (Choice: `ACTIVE`, `DELETED`, `FAILED`)
