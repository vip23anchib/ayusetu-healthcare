# AyuSetu — System Design Document

> **Word budget: 800 words max. Focused on the four core mechanisms.**

---

## 1. Double-Booking Prevention

**The race condition:** Two patients concurrently call `POST /api/appointments/` for the same doctor, same date, same start time. A naive "check-then-write" approach would let both succeed.

**The three-layer defense (all three must fire for guarantees):**

**Layer 1 — Application check.** `hold_slot()` queries active appointments for the target `(doctor, date, start_time)` tuple, filtering for statuses `CONFIRMED`, `COMPLETED`, and any `HELD` entry whose `hold_expires_at > now`. If a match exists, a `SlotConflictError` is raised before any write occurs.

**Layer 2 — Database row lock.** The entire check-and-write is wrapped in `transaction.atomic()`. Inside, a `select_for_update()` lock is acquired on the target `Doctor` row before the availability check. This serializes all concurrent booking attempts for the same doctor at the database level: the second transaction blocks at the lock acquisition step and cannot read stale data.

**Layer 3 — Partial unique index.** The `appointments_appointment` table carries the constraint `unique_active_appointment_slot` defined as `UNIQUE (doctor_id, appointment_date, start_time) WHERE status NOT IN ('CANCELLED', 'EXPIRED')`. If both application-layer checks somehow pass (e.g., under SQLite which has weaker locking), the DB raises an `IntegrityError` which the view catches and maps to `HTTP 409 Conflict`:

```
"This slot was just booked by another patient. Please choose another slot."
```

This defense-in-depth ensures correctness under PostgreSQL's serializable isolation and degrades gracefully to the unique-index fallback on SQLite.

---

## 2. Doctor Leave Conflict Handling

**Trigger:** `POST /api/admin/doctors/{id}/leave/` with a `leave_date`.

**Actual flow:**

1. **Leave row created.** A `DoctorLeave` record is written with `(doctor_id, leave_date)`. A unique constraint on this pair prevents duplicate leave entries per day.
2. **Conflict scan.** `appointments.filter(doctor=doctor, appointment_date=leave_date, status__in=['CONFIRMED', 'HELD'])` finds all affected bookings.
3. **Bulk cancellation.** Each affected appointment's `status` is set to `CANCELLED` and saved. The `hold_expires_at` field is cleared.
4. **Notification queue.** For each cancelled appointment, a `Notification` record is created in state `PENDING` with type `DOCTOR_LEAVE` for both the patient and doctor. These are submitted to the Django-Q task queue.
5. **Calendar cleanup.** Any `CalendarEvent` record linked to a cancelled appointment is updated to `DELETED` status and the Google Calendar delete API call is queued.
6. **Slot blocking.** Going forward, the `/api/doctors/{id}/slots/` endpoint filters out dates present in `DoctorLeave`, so no new bookings can be made for that date.

---

## 3. Slot Hold Lease Mechanism

**Why it exists:** After clicking a slot, the patient must fill in a symptom form before confirming. Without a hold, another patient could book the same slot during that window.

**Implementation:**

1. `POST /api/appointments/` (hold request) calls `hold_slot()`. Inside `transaction.atomic()` + `select_for_update()`, it creates an `Appointment` with `status=HELD` and `hold_expires_at = timezone.now() + timedelta(minutes=5)`.
2. The 5-minute countdown is displayed in the React UI via a live timer component.
3. **Lease protection:** Any subsequent booking check for the same slot inspects `status=HELD AND hold_expires_at > now`. An unexpired hold is treated as a live occupancy and blocks the slot.
4. **Confirmation:** `POST /api/appointments/{id}/symptoms/` submits symptoms, updates `status` from `HELD` to `CONFIRMED`, and triggers the AI triage task asynchronously.
5. **Expired hold cleanup:** A Django-Q scheduled task (`release_expired_holds`) runs periodically. It calls `Appointment.objects.filter(status='HELD', hold_expires_at__lt=now).update(status='EXPIRED')`, atomically releasing all stale holds in a single bulk update.

---

## 4. Notification Failure Handling

**Design principle:** Appointment booking success must be independent of email delivery. A failed SMTP call must never roll back a booking.

**State machine:** `PENDING → PROCESSING → SENT` (success path) or `PENDING → PROCESSING → PENDING` (retry, up to 3 times) → `FAILED`.

**Actual flow:**

1. When an appointment event occurs (booking confirmed, cancelled, etc.), a `Notification` row is written with `status=PENDING` and `attempts=0`. This write happens inside the appointment's own transaction — if the appointment commit succeeds, the notification record exists.
2. Notification dispatch runs in a separate Django-Q task (`send_notification_task`). The task fetches the `Notification`, sets `status=PROCESSING`, and attempts email delivery via the configured backend (`console` or SendGrid SMTP).
3. **Success:** `status` is set to `SENT`, `sent_at = now()`.
4. **Failure:** `attempts` is incremented. If `attempts < 3`, `status` resets to `PENDING` and a one-shot Django-Q `Schedule` is created to retry after 2 minutes. If `attempts == 3`, `status` is set to `FAILED` and `last_error` stores the exception message.
5. Appointment state is never touched during this process — a `FAILED` notification does not affect the `Appointment` record.

---

## 5. Third-Party Integration Fallbacks

- **AI Triage (OpenAI):** Called with an 8-second `httpx` timeout. If the key is missing or the call fails, the task stores `PreVisitSummary` with `urgency=UNAVAILABLE` and `status=FAILED`. The raw patient symptoms remain visible to the doctor.
- **Post-Visit AI Summary:** Same pattern. 10-second timeout. If it fails, `PostVisitSummary` is stored with `status=FAILED`; the consultation notes and prescription still save successfully.
- **Google Calendar:** If credentials are unconfigured or the OAuth token is absent, the calendar task logs the error and sets `CalendarEvent.status=FAILED`. Bookings are unaffected.
