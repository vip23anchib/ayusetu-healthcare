# AyuSetu — Technical Interview Preparation Guide

This guide is designed for developers, candidate engineers, or system architects presenting **AyuSetu** in a technical interview. It anticipates potential technical questions and provides clear, honest, and architectural answers based on the actual codebase implementation.

---

## Top 10 Anticipated Technical Interview Questions

### Q1: "Why did you choose Django REST Framework for the backend instead of Node.js / Express or FastAPI?"
**Answer**: 
"We chose Django REST Framework (DRF) because of its battle-tested relational ORM, robust database migration engine, built-in admin panel, and seamless transaction management. For a healthcare platform where appointment booking requires strict ACID compliance and database row-level locking (`select_for_update`), Django's ORM provides first-class support for `@transaction.atomic` blocks and partial database constraints (`UniqueConstraint`), which eliminated entire classes of race conditions out of the box."

---

### Q2: "How did you prevent double-booking when two patients attempt to book the exact same slot at the exact same millisecond?"
**Answer**:
"We implemented a two-phase reservation model combining database row locking and partial unique indexes:
1. When a patient initiates a hold, the request opens an atomic transaction (`@transaction.atomic`) and executes `select_for_update()` on overlapping appointment slots.
2. The system checks whether the slot is already `CONFIRMED` or held by a valid `HELD` slot (`hold_expires_at > now()`).
3. If free, it creates a `HELD` appointment with a 5-minute expiry timer.
4. If a concurrent request comes in at the same millisecond, PostgreSQL's partial unique constraint `unique_active_appointment_slot` or row lock enforces atomic isolation, causing the second request to throw a `SlotConflictError` and return `409 Conflict`.
5. If the patient does not confirm within 5 minutes, our background task worker (`release_expired_holds_task`) automatically releases the slot hold."

---

### Q3: "What happens if the OpenAI API fails, times out, or returns invalid JSON during symptom triage?"
**Answer**:
"We designed the AI integration to be non-blocking and fault-tolerant:
- Symptom analysis runs inside a try/except safety wrapper.
- If OpenAI times out or fails, the exception is caught silently.
- The `PreVisitSummary` record is saved with `status = 'UNAVAILABLE'`, `urgency = 'UNAVAILABLE'`, and a friendly fallback message ("AI summary is temporarily unavailable. Please review raw symptoms.").
- **Crucially**, the core appointment creation transaction is **never** rolled back due to an AI failure. The patient's appointment remains 100% valid, and the doctor UI falls back to showing the raw symptoms."

---

### Q4: "How does the system handle emergency doctor leaves when appointments are already booked on that date?"
**Answer**:
"When an admin or doctor schedules a leave date (`POST /api/admin/doctors/{id}/leave/`):
1. A `DoctorLeave` record is created.
2. The `handle_doctor_leave` service runs atomically: it queries all active `HELD` or `CONFIRMED` appointments on that date using `select_for_update()`.
3. It updates their status to `CANCELLED`.
4. It queues asynchronous `DOCTOR_LEAVE` email notifications to notify affected patients.
5. It sends delete requests to Google Calendar API to clear synced events.
6. Future slot generation calls automatically evaluate `DoctorLeave` entries and return zero available slots for that date."

---

### Q5: "How are background tasks and notifications handled? Why didn't you require Celery + Redis for local development?"
**Answer**:
"We used `django-q2` with an ORM database broker for background execution. This gave us:
1. **Zero External Infrastructure Overhead**: Local developers can clone and run the app without installing or configuring Redis or RabbitMQ instances.
2. **Reliable Async Queueing**: Email dispatches, medication reminders, and hold releases run in background workers.
3. **Retry Backoff**: If an email delivery fails (e.g. SMTP server down), the worker catches the error, increments the attempt counter, and schedules a one-shot retry task for 2 minutes later (up to 3 retries max)."

---

### Q6: "How is object-level security handled? Can Patient A view Patient B's medical records by tweaking the ID in the URL?"
**Answer**:
"No. Object-level security is enforced at two distinct layers:
1. **Queryset Level (`get_queryset`)**: When a user queries `/api/appointments/`, the viewset filters records based on `request.user`:
   - Patients only receive appointments where `patient = request.user`.
   - Doctors only receive appointments where `doctor.user = request.user`.
   - Admins receive all appointments.
2. **Permission Class (`IsParticipantOrAdmin`)**: On direct object retrievals (`GET /api/appointments/99/`), DRF executes `has_object_permission`, verifying `obj.patient == request.user` or `obj.doctor.user == request.user`. Attempting to fetch another patient's appointment returns `404 Not Found`."

---

### Q7: "How did you design the database schema for prescriptions and medications?"
**Answer**:
"We separated `Prescription` and `Medication` into a 1-to-N relationship:
- A `Consultation` has one `Prescription` header.
- A `Prescription` owns multiple `Medication` items (each storing `medicine_name`, `dosage`, `frequency`, `duration`, `instructions`).
- This design conforms to 3rd Normal Form (3NF), prevents dirty string delimiters in the database, and allows structured JSON parsing for AI follow-up summaries and patient medication reminders."

---

### Q8: "What would you do differently if you had 2 more weeks to work on AyuSetu?"
**Answer**:
"If given two more weeks, I would add:
1. **WebSockets (Django Channels)**: Real-time slot availability updates on patient screens without manual polling.
2. **Redis + Celery Broker**: Migrate Django-Q's ORM broker to Redis for high-throughput production task processing.
3. **WebRTC Telehealth Video Rooms**: Integrated video consultation rooms directly within the doctor dashboard.
4. **WhatsApp Business API Integration**: Dispatching instant SMS/WhatsApp reminders alongside email."

---

### Q9: "How did you handle timezones across Indian patient bookings?"
**Answer**:
"The entire backend is configured with `TIME_ZONE = 'Asia/Kolkata'` and `USE_TZ = True` in Django settings. All slots, working hours, and calendar timestamps are processed in Indian Standard Time (IST), avoiding off-by-one day bugs when converting UTC timestamps for morning slots."

---

### Q10: "How do you verify system correctness beyond manual clicking?"
**Answer**:
"We built an automated Django unit test suite containing **31 comprehensive test cases** covering:
- SimpleJWT auth & permissions
- Concurrent double-booking race condition prevention
- Expired hold cleanup background tasks
- AI pre-visit triage success and failure fallback modes
- Consultation prescription completion
- Email notifications retry tracking
- Google Calendar sync OAuth mocks & event handlers
- Object-level security isolation

All 31 tests pass cleanly on every build."
