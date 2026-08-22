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
## Phase 5: Background Processing & Notifications (Completed)
- **What was done:**
  - Implemented the database-backed `Notification` model to handle asynchronous communication logs (emails and reminders).
  - Integrated `django-q2` task queue utilizing the Django ORM database broker as our zero-external-service fallback.
  - Implemented async notification workers in `notifications/tasks.py` handling email dispatch via standard Django email engines, retries on failure, and transaction-independent execution.
  - Created automated retry scheduling (with 3-attempt limit and delayed one-shot Django-Q `Schedule` logs).
  - Developed medication reminder schedule generation parsing duration and frequency strings into discrete future notifications and scheduled one-shot tasks.
  - Wrote robust unit tests in `notifications/tests.py` verifying successful delivery, failure-retry scheduling, and reminder scheduling.
  - Resolved timing dependencies by mocking `timezone.now()` to ensure deterministic reminder counting.
  - Verified that all 25 unit tests across the entire test suite compile, run, and pass successfully.
## Phase 6: Google Calendar Sync (Completed)
- **What was done:**
  - Implemented `DoctorGoogleCredentials` and `CalendarEvent` database models.
  - Developed full OAuth 2.0 connection views (`POST /api/calendar/connect/` and `GET /api/calendar/callback/`) handling credentials exchange, offline refresh tokens, and consent storage.
  - Implemented Google Calendar event synchronization service dispatching calls on creation, reschedule, and deletion.
  - Designed fallback development mocks: if client secrets are missing, connect flow redirects to callback directly with code `mock_code_123`, saving mock credentials in database. Event synchronization logs mock parameters to console and marks state `ACTIVE` or `DELETED`, avoiding API blockages.
  - Wrote 4 comprehensive tests in `calendar_integration/tests.py` verifying OAuth routes, mock callbacks, sync creation, reschedule patches, and cancel deletes.
  - Verified that all 29 tests across all backend apps compile, run, and pass successfully.
- **What's next:** Phase 7 (Frontend Dashboards: Patient, Doctor, Admin).
- **Known issues / Shortcuts:**
  - Standardized the connect view to return mock callback targets when client settings are missing, ensuring zero-configuration local setups are fully testable.



