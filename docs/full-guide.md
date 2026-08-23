# AyuSetu — Full System Architecture & Complete Operational Guide

Welcome to the comprehensive documentation guide for **AyuSetu** (AI-Powered Healthcare Appointment & Follow-up Platform). This guide is written to serve both non-technical stakeholders and technical reviewers or system architects.

---

## 1. What is AyuSetu? (In Plain English)

### The Problem It Solves
In traditional clinic management systems, three major pain points occur constantly:
1. **Double Bookings & Scheduling Chaos**: Two patients try to book the exact same doctor at 10:00 AM simultaneously. Without strict atomic controls, both get booked, forcing staff to manually apologize and cancel one.
2. **Unprepared Consultations & Unclear Follow-ups**: Doctors spend 5–10 minutes of a 15-minute consultation reading through unstructured symptom notes or asking basic background questions. After the visit, patients forget complex dosage instructions written in medical shorthand.
3. **Emergency Doctor Leaves**: When a doctor takes emergency leave, staff have to manually call every scheduled patient to cancel, leading to missed notifications and angry patients showing up at the clinic.

### Who Uses AyuSetu?
AyuSetu is a multi-portal platform designed for three roles:
- **Patients**: Browse specialist doctors, view available real-time time slots, hold a slot while completing booking details, receive AI-powered triage pre-summaries, view consultation notes, and receive automated medication reminders.
- **Doctors**: Manage their weekly working shifts, view upcoming appointments enriched with AI triage analysis and suggested diagnostic questions, record consultation notes and structured prescriptions, view patient follow-up summaries, mark leave dates, and synchronize their clinic schedule directly with **Google Calendar**.
- **Admins**: Manage practitioner profiles, configure slot durations, register clinic-wide doctor leaves (which automatically cancel conflicting bookings and dispatch patient alerts), and monitor global booking activity logs with search and filter capabilities.

### End-to-End User Journey
```
[ Patient ]                             [ System / AI ]                          [ Doctor / Admin ]
     │                                         │                                         │
     ├─ 1. Searches Doctors ───────────────────┼─────────────────────────────────────────┤
     ├─ 2. Selects Slot (5-min Hold) ──────────┼─────────────────────────────────────────┤
     ├─ 3. Enters Symptoms & Confirms ─────────┼─► 4. Triggers OpenAI Symptom Triage ───┤
     │                                         ├─► 5. Dispatches Email Notification ─────┼─► Receives Booking Email
     │                                         ├─► 6. Syncs with Google Calendar ────────┼─► Calendar Updated
     │                                         │                                         │
     │                                         │                                         ├─► 7. Reviews AI Triage & Conducts Visit
     │                                         │                                         ├─► 8. Enters Notes & Medication Guidelines
     │                                         ├─► 9. Triggers Patient-Friendly Summary ─┤
     ├─ 10. Reviews Prescriptions & Summary ───┼─────────────────────────────────────────┤
```

---

## 2. System Architecture Explained

### Plain English View
Imagine AyuSetu as a modern, high-tech medical clinic building:
- **The Front Desk (Frontend - React + Tailwind)**: What the patient sees on their phone or laptop screen. It is fast, clean, responsive, and updates immediately when you click a button.
- **The Clinic Management Manager (Backend API - Django REST Framework)**: The central brain in the back office. It enforces all rules (e.g. checking if a doctor is on leave before allowing a booking, verifying passwords, and processing requests).
- **The Secure Filing Cabinet (Database - PostgreSQL / SQLite)**: Stores all doctor profiles, patient accounts, appointment timestamps, and clinical notes safely.
- **The Automated Assistant Worker (Background Queue - Django-Q)**: Works behind the scenes to send emails, release expired slot holds, and update Google Calendars without making the user wait on the screen.
- **The Specialist Medical Consultant (External AI Service - OpenAI GPT-4o-mini)**: Reads patient symptoms and doctor notes to generate clinical triage summaries and easy-to-read patient summaries.

### Technical Architecture View
```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                    |
|                  React 18 + Vite + Tailwind CSS v4 + Axios                        |
|             (Dark / Light Theme Context, JWT Auth Interceptors, SPA Router)       |
+-----------------------------------------------------------------------------------+
                                         │  HTTPS / REST JSON
                                         ▼
+-----------------------------------------------------------------------------------+
|                                  BACKEND LAYER                                    |
|                     Django 6.1 + Django REST Framework + SimpleJWT                |
|           - Middleware: Auth, CORS, Exception Handler                            |
|           - Applications: accounts, doctors, appointments, consultations,         |
|                           notifications, calendar_integration                     |
+-----------------------------------------------------------------------------------+
                     │                                   │
      ORM (SQL queries)                                   │ Async Task Dispatch
                     ▼                                   ▼
+-------------------------+             +-------------------------------------------+
|     DATABASE LAYER      |             |           BACKGROUND QUEUE LAYER          |
|  PostgreSQL / SQLite    |             |      Django-Q2 ORM Task Broker / Worker    |
| (Row-locking & Partial  |             |  - Email Workers & Retry Scheduler        |
|   Unique Constraints)   |             |  - Expired Holds Cleanup Periodic Task    |
+-------------------------+             +-------------------------------------------+
                                                         │                 │
                                               HTTPS API │                 │ HTTPS API
                                                         ▼                 ▼
                                               +------------------+ +---------------+
                                               |  OpenAI API      | | Google        |
                                               |  (GPT-4o-mini)   | | Calendar API  |
                                               +------------------+ +---------------+
```

---

## 3. Core Feature Mechanisms & Engineering Deep Dive

### A. Booking Flow, 5-Minute Slot Hold & Double-Booking Prevention
#### The Failure Scenario Prevented
Without concurrency control, if Patient A and Patient B click "Book 10:00 AM" at the exact same millisecond:
1. Server checks Patient A request: "10:00 AM is free!"
2. Server checks Patient B request: "10:00 AM is free!"
3. Server saves Patient A booking to Database.
4. Server saves Patient B booking to Database.
Result: Two patients arrive at the clinic at 10:00 AM for a single doctor.

#### Technical Implementation
AyuSetu implements a **2-Phase Commit Reservation Pattern**:
1. **Phase 1: Slot Hold (`POST /api/appointments/`)**:
   - The user selects a time slot.
   - The backend begins an atomic database transaction (`@transaction.atomic`).
   - Uses `select_for_update()` to lock candidate appointment rows for that doctor and date.
   - Verifies no active `CONFIRMED` or valid `HELD` slot exists for that timestamp.
   - If available, creates an `Appointment` with `status = 'HELD'` and `hold_expires_at = now() + 5 minutes`.
   - If another request holds or confirms the slot simultaneously, a `SlotConflictError` is raised, returning `409 Conflict` to the second user.
   - A database-level partial unique index ensures strict uniqueness:
     ```python
     UniqueConstraint(
         fields=['doctor', 'appointment_date', 'start_time'],
         condition=Q(status__in=['HELD', 'CONFIRMED', 'COMPLETED']),
         name='unique_active_appointment_slot'
     )
     ```
2. **Phase 2: Confirmation (`POST /api/appointments/{id}/symptoms/`)**:
   - The patient enters symptom text and submits.
   - Status transitions from `HELD` to `CONFIRMED`, clearing `hold_expires_at`.
   - Async background triggers initiate AI triage, confirmation email queuing, and Google Calendar sync.
3. **Hold Expiration Cleanup**:
   - If 5 minutes elapse without confirmation, the background task `release_expired_holds_task` sets `status = 'EXPIRED'`, freeing the slot for other patients.

---

### B. AI Pre-Visit Triage & Post-Visit Summaries
1. **Pre-Visit Triage (`trigger_pre_visit_summary`)**:
   - Passes raw patient symptoms to OpenAI `gpt-4o-mini` with strict JSON mode.
   - Generates:
     - `urgency`: `LOW` | `MEDIUM` | `HIGH`
     - `chief_complaint`: Concise symptom summary.
     - `suggested_questions`: Exactly 3 diagnostic prompts for the physician.
2. **AI Failure Fallback Handling**:
   - If OpenAI times out, the API key is missing, or the model fails, the exception is caught silently.
   - The `PreVisitSummary` record is saved with `status = 'UNAVAILABLE'`, `urgency = 'UNAVAILABLE'`, and `chief_complaint = "AI summary is temporarily unavailable..."`.
   - **Critical Contract**: The appointment booking transaction is **NEVER** rolled back due to AI failure. The doctor dashboard gracefully falls back to displaying the raw patient symptoms with an "AI analysis unavailable" indicator.
3. **Post-Visit Summary (`generate_patient_summary`)**:
   - Takes clinician notes and structured prescription medications as input.
   - Prompt rules strictly prohibit inventing diagnoses, changing dosages, or adding unlisted medications.

---

### C. Emergency Doctor Leave Resolution
When an Admin or Doctor marks a leave date (`POST /api/admin/doctors/{id}/leave/`):
1. `DoctorLeave` entry is recorded in the database.
2. `handle_doctor_leave` service runs in an atomic block:
   - Queries all `HELD` or `CONFIRMED` appointments for that doctor on that date using `select_for_update()`.
   - Updates appointment status to `CANCELLED`.
   - Queues `DOCTOR_LEAVE` cancellation email notifications for all affected patients.
   - Deletes corresponding synced events from Google Calendar.
   - Removes available slots for that date in all subsequent availability queries.

---

### D. Async Notifications & Retry Queue
- Handled by `django-q2` database queue broker (zero external infrastructure dependency required).
- Notification status lifecycle: `PENDING` -> `PROCESSING` -> `SENT` or `FAILED`.
- If an email send fails (e.g. SMTP timeout), the worker catches the error, increments `attempts`, and if `attempts < 3`, creates a delayed `Schedule` task for retry in 2 minutes. The primary database action (appointment creation/cancellation) remains intact.

---

### E. Google Calendar Integration
- OAuth 2.0 flow exchanges authorization code for refresh tokens stored in `DoctorGoogleCredentials`.
- When an appointment is booked, rescheduled, or cancelled, `sync_appointment_event`, `update_appointment_event`, or `delete_appointment_event` updates Google Calendar.
- **Graceful Degradation**: If Google API keys or credentials are missing or invalid, the error is logged and caught. The appointment transaction completes successfully while calendar sync state is set to `FAILED`.

---

## 4. Database Schema Walkthrough

```
  +------------------+         +----------------------+         +---------------------+
  |  accounts_user   | 1────1  |    doctors_doctor    | 1────N  | doctorworkinghours  |
  +------------------+         +----------------------+         +---------------------+
  | id               |         | id                   |         | id                  |
  | email (unique)   |         | user_id (FK)         |         | doctor_id (FK)      |
  | name             |         | specialization       |         | day_of_week (0-6)   |
  | role             |         | slot_duration        |         | start_time          |
  +------------------+         +----------------------+         | end_time            |
           │                              │                     +---------------------+
           │ 1                            │ 1
           │                              │                     +---------------------+
           │ N                            │ N                   |     doctorleave     |
           ▼                              ▼                     +---------------------+
  +---------------------------------------------------+         | id                  |
  |             appointments_appointment              |         | doctor_id (FK)      |
  +---------------------------------------------------+         | leave_date          |
  | id                                                |         | reason              |
  | doctor_id (FK)                                    |         +---------------------+
  | patient_id (FK)                                   |
  | appointment_date                                  |
  | start_time / end_time                             |
  | status (HELD, CONFIRMED, COMPLETED, CANCELLED...) |
  | hold_expires_at                                   |
  +---------------------------------------------------+
       │ 1               │ 1               │ 1               │ 1
       │                 │                 │                 │
       ▼ 1               ▼ 1               ▼ 1               ▼ 1
+--------------+  +---------------+  +---------------+  +---------------------+
| consultations|  | previsitsumm  |  | consultations |  | calendarintegration |
| _symptom     |  | _previsit     |  | _consultation |  | _calendarevent      |
+--------------+  +---------------+  +---------------+  +---------------------+
| appointment  |  | appointment   |  | appointment   |  | appointment_id (FK) |
| symptoms_txt |  | urgency       |  | doctor_notes  |  | google_event_id     |
+--------------+  | questions     |  | follow_up_date|  +---------------------+
                  +---------------+  +---------------+
                                             │ 1
                                             ▼ 1
                                     +---------------+
                                     | prescriptions |
                                     +---------------+
                                             │ 1
                                             ▼ N
                                     +---------------+
                                     |  medications  |
                                     +---------------+
                                     | medicine_name |
                                     | dosage        |
                                     | frequency     |
                                     | duration      |
                                     +---------------+
```

### Key Relational Design Decisions
1. **Why `Doctor` extends `User` with a One-to-One Link**:
   - Keeps authentication credentials (`email`, `password_hash`, `role`) unified in `accounts_user`.
   - Allows specialist medical metadata (`specialization`, `slot_duration`) to live independently in `doctors_doctor`.
2. **Why `Prescription` and `Medication` are Separate Tables**:
   - A single consultation produces one `Prescription` header, but a patient can be prescribed multiple `Medication` rows (e.g. Paracetamol + Amoxicillin). Separating them normalizes the schema and avoids dirty string delimiters.
3. **Why `DoctorWorkingHours` Uses `day_of_week` (0–6)**:
   - Supports recurring weekly schedules (e.g. Mondays 9:00 AM - 1:00 PM and 5:00 PM - 9:00 PM for split shifts) without requiring hardcoded daily records.

---

## 5. Step-by-Step Local Setup Guide

Follow these exact commands to run AyuSetu locally on a fresh computer.

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- Git installed

### Step 1: Clone Repository
```bash
git clone https://github.com/vip23anchib/ayusetu-healthcare.git
cd ayusetu-healthcare
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Seed database with authentic Indian demo data (Doctors, Patients, Working Hours, Slots)
python manage.py seed_data

# (Optional) Run test suite to verify 31 unit tests pass
python manage.py test accounts doctors appointments consultations notifications calendar_integration

# Start Backend Server (runs on http://127.0.0.1:8000)
python manage.py runserver
```

### Step 3: Frontend Setup (New Terminal Window)
```bash
# Navigate to frontend directory
cd f:\ayusetu_healthcare\frontend

# Install npm packages
npm install

# Start Vite Development Server (runs on http://localhost:5173)
npm run dev
```

### Default Seed Demo Login Credentials
- **Patient**: `rohan.malhotra@example.com` / `Patient@123`
- **Doctor**: `ananya.reddy@example.com` / `Doctor@123`
- **Admin**: `admin@ayusetu.com` / `Admin@123`

---

## 6. Step-by-Step Production Deployment Guide

### Deployment Overview
- **Frontend**: Deployed to **Vercel**
- **Backend API**: Deployed to **Render** or **Railway**
- **Database**: Managed PostgreSQL on **Neon.tech** or **Render Postgres**
- **Background Worker / Queue**: Django-Q ORM runner or Redis on **Upstash**

---

### Step A: Database Setup (Neon PostgreSQL)
1. Create a free account at [Neon.tech](https://neon.tech).
2. Create a new PostgreSQL database named `ayusetu_db`.
3. Copy the Connection String URI:
   `postgres://user:password@ep-xyz.neon.tech/ayusetu_db?sslmode=require`

---

### Step B: Backend Deployment (Render / Railway)
1. Create a new **Web Service** on Render connected to your GitHub repository `ayusetu-healthcare`.
2. Set **Root Directory** to `backend`.
3. Set **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py seed_data
   ```
4. Set **Start Command**:
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```
5. Configure Production Environment Variables in Render:
   | Variable | Production Value |
   | :--- | :--- |
   | `SECRET_KEY` | Generates secure random key string |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | `postgres://user:password@ep-xyz.neon.tech/ayusetu_db?sslmode=require` |
   | `ALLOWED_HOSTS` | `your-backend.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
   | `OPENAI_API_KEY` | `sk-proj-...` (Your production OpenAI API key) |
   | `EMAIL_PROVIDER` | `sendgrid` |
   | `EMAIL_API_KEY` | `SG.xyz...` (Production SendGrid key) |
   | `EMAIL_FROM` | `notifications@yourdomain.com` |
   | `GOOGLE_CLIENT_ID` | Production Google OAuth Client ID |
   | `GOOGLE_CLIENT_SECRET` | Production Google OAuth Secret |
   | `GOOGLE_REDIRECT_URI` | `https://your-backend.onrender.com/api/calendar/callback/` |

> **Production OAuth Note**: In Google Cloud Console (`console.cloud.google.com`), add `https://your-backend.onrender.com/api/calendar/callback/` to Authorized Redirect URIs.

---

### Step C: Frontend Deployment (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Set **Framework Preset**: Vite.
3. Set **Root Directory**: `frontend`.
4. Set **Build Command**: `npm run build`.
5. Set **Output Directory**: `dist`.
6. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api/`
7. Deploy! Vercel will issue a live HTTPS URL (e.g. `https://ayusetu.vercel.app`).

---

## 7. Known Limitations & Future Roadmap

### Known Limitations (2-Day Time-Box Constraints)
1. **ORM Queue Worker in Local Dev**: Uses Django ORM broker for zero-config local runs. In high-traffic production, a dedicated Redis broker with Celery is recommended.
2. **Mock AI & OAuth Fallbacks**: In local development without environment keys, OpenAI and Google Calendar return deterministic mock data so developers can test complete workflows without paid credentials.
3. **Telehealth Video Calls**: Current MVP schedules clinic appointments and generates pre/post visit summaries; live WebRTC video rooms are planned for v2.

### Future Roadmap
- Integration with WhatsApp Business API for instant appointment reminders.
- Electronic Health Record (EHR) PDF export for prescriptions.
- Patient portal multi-language support (Hindi, Telugu, Tamil, Marathi).
