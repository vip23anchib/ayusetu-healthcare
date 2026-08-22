# AyuSetu — System Architecture Documentation

This document describes the high-level architecture of AyuSetu, highlighting core boundaries, request paths, and external API interfaces.

---

## 1. High-Level Directory Overview

AyuSetu is structured as a full-stack, decouple-ready web application:
- **`backend/`:** A Django monolithic REST API backend. It isolates logic inside business services (`services.py` modules per app) rather than spreading checks across serializers and controllers.
- **`frontend/`:** A Vite-powered React client. Communication routes through a centralized Axios client intercepting SimpleJWT headers.

```
                  ┌──────────────────────┐
                  │  React Client (SPA)  │
                  └──────────┬───────────┘
                             │ (HTTPS / JSON REST API)
                             ▼
                  ┌──────────────────────┐
                  │   Django Monolith    │
                  │ (REST Framework)     │
                  └────┬────────────┬────┘
                       │            │
         (DB Queries)  │            │ (Queue Tasks)
                       ▼            ▼
                 ┌──────────┐  ┌──────────────┐
                 │ Database │  │   Django-Q   │ (Email retries / holds)
                 │ (Postgres│  │(ORM Broker)  │
                 │  / SQLite│  └──────────────┘
                 └──────────┘
```

---

## 2. Request Pipelines & Workflows

### A. Patient Booking Flow
1. **Directory Search:** Patient fetches `/api/doctors/` and filters by specialization.
2. **Slots Check:** Patient requests `/api/doctors/{id}/slots/?date=YYYY-MM-DD`. Backend computes working hours, subtracting leaves, confirmed bookings, and active slot leases.
3. **Slot Hold:** Patient selects a slot, sending `POST /api/appointments/`. Backend obtains a row lock on the target `Doctor` profile, checks slot availability, and inserts an appointment in state `HELD` with a 5-minute lease.
4. **Symptom Confirmation:** Patient enters symptoms and clicks Confirm. Frontend sends `POST /api/appointments/{id}/symptoms/`.
5. **Triage Summary:** The confirmation endpoint triggers symptom-analysis services asynchronously, parsing urgency indices, chief complaints, and prompts. The booking status changes from `HELD` to `CONFIRMED`.
6. **Task Scheduling:** The backend creates notifications logs in the database and dispatches events to sync calendars.

### B. Doctor Checkup Flow
1. **Triage Review:** Doctor opens their dashboard, reviewing today's schedule, patient symptoms, AI urgency ratings, and suggested clinical review prompts.
2. **Consultation Build:** Doctor opens the consult builder, typing clinical observations and adding medications (medicine name, dosage, frequency, duration).
3. **Submission:** Submitting the form posts to `/api/appointments/{id}/consultation/`.
4. **Post-Visit Summary:** The checkup service creates a consultation log, saves the prescription sheet, registers medications, and schedules a background task to generate a patient-friendly summary.
5. **Reminders:** The backend parses duration and frequency tokens to schedule medication reminder alerts.

### C. Asynchronous Notifications & Retries
1. **Decoupling:** To prevent slow external APIs (e.g. SMTP hosts) from locking DB transactions, all notification and reminder tasks run in background threads managed by `qcluster`.
2. **Workers:** A worker thread pulls `send_notification_task` items from the database broker queue.
3. **Fault-Tolerance:** If mail delivery fails, the worker logs the error string, increments the task's attempt counter, and schedules a retry task using a one-shot `Schedule` record in 2 minutes. On the 3rd final failed attempt, it marks the task status as `FAILED`.
