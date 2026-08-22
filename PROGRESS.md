# AyuSetu — Progress Log

## Phase 1: Foundation (Completed)
- **What was done:**
  - Initialized backend Django project `config` and 7 local applications.
  - Configured PostgreSQL support using `dj-database-url`, and database fallbacks to SQLite for development.
  - Implemented custom User model (`accounts.User`) with roles (`PATIENT`, `DOCTOR`, `ADMIN`).
  - Implemented register, login, and profile REST API endpoints with SimpleJWT auth.
  - Created automated test suite for authentication (6 tests, all passing).
  - Initialized frontend with Vite, React, and Tailwind CSS.
  - Integrated `@tailwindcss/postcss` for Tailwind v4 compatibility.
  - Set up Axios client with bearer token interception, `AuthContext` state, routing gates, and layouts.
  - Verified frontend builds successfully.
## Phase 2: Doctor Profiles & Availability (Completed)
- **What was done:**
  - Implemented the core scheduling schema: `Doctor`, `DoctorWorkingHours`, and `DoctorLeave` models.
  - Set database-level constraints on leaves to prevent duplicate scheduled leaves per doctor per date.
  - Implemented API views for reading, searching, and managing doctor profiles, daily working hours, and leaves.
  - Exposed `/api/admin/doctors/{id}/leave/` matching POST/DELETE specifications.
  - Created automated test suite for doctor profiles and leave rules (6 tests, all passing).
## Phase 3: Appointments & Concurrency Core (Completed)
- **What was done:**
  - Implemented `Appointment` model with status choices and a database-level partial unique constraint `unique_active_appointment_slot` enforcing one active booking per doctor/date/start_time.
  - Developed business logic in `appointments/services.py` featuring a slot generator, a 5-minute hold mechanism, and transaction-isolated booking/rescheduling using `select_for_update` row locking.
  - Implemented CRUD and custom actions on REST endpoints (`POST /api/appointments/`, `POST /api/appointments/{id}/symptoms/`, `POST /api/appointments/{id}/cancel/`, `PATCH /api/appointments/{id}/reschedule/`).
  - Implemented doctor leave conflict resolver (cancelling affected slots and trigger notifications).
  - Wrote a multi-threaded concurrency unit test in `appointments/tests.py` using `TransactionTestCase` to simulate simultaneous bookings for the same slot.
  - Verified that all 7 tests pass successfully (ensuring exactly one booking succeeds and the other receives a conflict exception).
  - Seeded consultation models ahead of schedule to unblock appointments testing.
## Phase 4: AI Pre/Post-Visit Summaries & Consultations (Completed)
- **What was done:**
  - Implemented core consultation database models: `Symptom`, `PreVisitSummary`, `Consultation`, `Prescription`, `Medication`, and `PostVisitSummary`.
  - Created `ai_service.py` to communicate directly with OpenAI's Chat Completions endpoint via `httpx` and handle timeouts and API key omissions gracefully.
  - Implemented symptom-analysis services generating chief complaint summaries, urgency rankings (LOW, MEDIUM, HIGH), and doctor prompt questions.
  - Implemented consultation completion service registering doctor notes, follow-up dates, custom prescriptions/medications, and triggering patient-friendly follow-up summaries.
  - Added robust nested transaction handling catching unique constraints/locks (`OperationalError` and `IntegrityError`) and translating database exceptions cleanly.
  - Wrote 3 comprehensive unit tests in `consultations/tests.py` verifying successful AI summaries, mocked OpenAI outages, fallback states, and consultation updates.
  - Verified that all 10 tests across the test suite run and pass successfully.
- **What's next:** Phase 5 (Background Processing, Django-Q cluster setup, notifications, reminders, and retries).
- **Known issues / Shortcuts:**
  - Standardized local SQLite tests to use a file-based target `test_db.sqlite3` so that multi-threaded connection pools correctly lock and trigger unique constraints.
  - Normalised raw AI urgency outputs to uppercase choices to ensure database level validation.

