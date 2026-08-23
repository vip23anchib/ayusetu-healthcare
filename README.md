# AyuSetu — AI-Powered Healthcare Appointment & Management Platform

![AyuSetu Logo](frontend/public/logo.png)

## Problem Statement

Scheduling clinic appointments in India is still largely phone-based, leading to double-bookings, missed follow-ups, and no structured pre-visit information for doctors. **AyuSetu** (translating to *"Bridge of Health"*) is a full-stack clinical appointment platform that allows patients to self-book slots, submit symptoms before their visit, and receive AI-generated triage summaries and post-visit instructions — while giving doctors and clinic admins structured oversight of schedules, leaves, and consultation records.

---

## ✅ Verified Working Features

> Every item below was verified against the running application, not inferred from code.

- **Patient Portal**: Register/login, browse doctors by specialisation, book an appointment slot, submit pre-visit symptoms, view upcoming & past appointments, reschedule or cancel, view AI triage summary and post-visit instructions.
- **Doctor Portal**: View today's schedule, view patient chief complaint and AI-generated triage questions before a consult, write consultation notes, add prescriptions with medications, finalize consult (triggers post-visit AI summary + email).
- **Admin Portal**: Register doctors, configure slot duration, schedule doctor leaves (auto-cancels conflicting appointments and notifies patients), view global appointment ledger with patient/doctor/date/status filters, view any appointment detail.
- **Double-Booking Prevention**: `select_for_update()` row lock + partial unique index on `(doctor, date, start_time)` returns HTTP 409 on concurrent booking conflicts.
- **5-Minute Slot Hold**: Booking creates a `HELD` status with `hold_expires_at`; a Django-Q periodic task releases expired holds automatically.
- **AI Pre-Visit Triage**: OpenAI `gpt-4o-mini` analyzes submitted symptoms and returns urgency level (LOW/MEDIUM/HIGH), chief complaint, and 3 suggested doctor questions. Falls back to keyword-based mock if API key is absent.
- **AI Post-Visit Summary**: After a doctor finalizes notes, OpenAI converts clinical notes + medications into a patient-friendly summary.
- **Email Notifications**: Booking confirmation, cancellation, and doctor-leave cancellation emails with retry logic (up to 3 attempts, 2-minute backoff).
- **Google Calendar Sync**: Adds appointment as a calendar event on the patient's Google Calendar after OAuth 2.0 authorization. Falls back gracefully if credentials are missing.
- **Light / Dark Theme**: Persistent theme toggle (localStorage) with full contrast support across all three portals.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Lucide Icons, Axios |
| **Backend** | Python 3.10+, Django 6.1, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL (production) / SQLite (local dev) |
| **Async Workers** | django-q2 (ORM broker, synchronous fallback on Windows) |
| **AI** | OpenAI API — `gpt-4o-mini` |
| **Email** | SendGrid SMTP (production) / Django console backend (dev) |
| **Calendar** | Google Calendar API v3, OAuth 2.0 |
| **Hosting** | Vercel (frontend) · Render (backend) · Neon (PostgreSQL) |

---

## 🏗️ Architecture Overview

```
[Patient/Doctor/Admin Browser]
        │  HTTPS (JWT Bearer)
        ▼
[Vite/React SPA — Vercel]
        │  REST API calls to /api/
        ▼
[Django REST Framework — Render]
  ├── accounts/      → Auth (register, login, JWT)
  ├── doctors/       → Doctor profiles, working hours, leaves (admin-only writes)
  ├── appointments/  → Hold → Confirm (symptoms) → Complete/Cancel/Reschedule
  ├── consultations/ → Notes, prescriptions, pre/post-visit AI summaries
  ├── notifications/ → Email queue with retry state machine
  ├── ai/            → OpenAI wrapper (pre-visit triage + post-visit summary)
  └── calendar_integration/ → Google OAuth + Calendar event creation
        │  Django-Q ORM task queue
        ▼
[PostgreSQL — Neon]         [Redis — optional, falls back to ORM]
```

See [`docs/full-guide.md`](docs/full-guide.md) for a full narrative walkthrough.

---

## ⚡ Local Setup (Zero Prior Setup Assumed)

### Prerequisites
- **Python 3.10+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+ & npm** — [nodejs.org](https://nodejs.org/)
- **PostgreSQL** (optional for local dev — SQLite is used automatically if `DATABASE_URL` is unset)
- **Redis** (optional — Django-Q falls back to ORM/synchronous mode without it)

### 1. Clone the repository
```bash
git clone https://github.com/vip23anchib/ayusetu-healthcare.git
cd ayusetu-healthcare
```

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy environment template and edit values
cp .env.example .env
# Edit backend/.env — at minimum, leave DATABASE_URL empty to use SQLite

# Apply migrations
python manage.py migrate

# Seed authentic Indian demo data (doctors, patients, admin)
python manage.py seed_data

# (Optional) Run the full test suite — 31 tests
python manage.py test accounts doctors appointments consultations notifications calendar_integration

# Start the backend server
python manage.py runserver
# → Listening at http://127.0.0.1:8000
```

> **Windows / No Redis note:** Django-Q runs tasks synchronously by default (`DJANGO_Q_SYNC=True` in `.env`). No separate worker process is needed for local dev.

### 3. Frontend Setup

Open a **new terminal**:
```bash
cd frontend

# Install Node packages
npm install

# Start Vite dev server
npm run dev
# → http://localhost:5173
```

### 4. (Optional) Background Workers — Linux/macOS with Redis

If you set `REDIS_URL` in `.env` and `DJANGO_Q_SYNC=False`:
```bash
# In a third terminal, with the venv activated:
cd backend
python manage.py qcluster
```

---

## 🔐 Demo Credentials (seeded by `seed_data`)

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Patient** | Rohan Malhotra | `rohan.malhotra@example.com` | `Patient@123` |
| **Patient** | Ananya Reddy | `ananya.reddy@example.com` | `Patient@123` |
| **Patient** | Aditya Sharma | `aditya.sharma@example.com` | `Patient@123` |
| **Patient** | Priya Nair | `priya.nair@example.com` | `Patient@123` |
| **Patient** | Kabir Mehta | `kabir.mehta@example.com` | `Patient@123` |
| **Doctor** | Dr. Ananya Reddy *(Cardiology)* | `dr.ananya.reddy@example.com` | `Doctor@123` |
| **Doctor** | Dr. Vikram Iyer *(General Physician)* | `dr.vikram.iyer@example.com` | `Doctor@123` |
| **Doctor** | Dr. Meera Krishnan *(Dermatology)* | `dr.meera.krishnan@example.com` | `Doctor@123` |
| **Doctor** | Dr. Arjun Kapoor *(Orthopedics)* | `dr.arjun.kapoor@example.com` | `Doctor@123` |
| **Doctor** | Dr. Sana Sheikh *(Pediatrics)* | `dr.sana.sheikh@example.com` | `Doctor@123` |
| **Doctor** | Dr. Rajesh Nair *(ENT Specialist)* | `dr.rajesh.nair@example.com` | `Doctor@123` |
| **Admin** | Clinic Admin | `admin@ayusetu.com` | `Admin@123` |

---

## 🔧 Environment Variables Reference

All variables are defined in `backend/.env.example`. Key ones:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `SECRET_KEY` | ✅ | Django secret key (generate a unique one for production) |
| `DEBUG` | ✅ | `True` for dev, `False` for production |
| `DATABASE_URL` | ⚠️ | Postgres URL. If blank, SQLite is used. |
| `JWT_SECRET_KEY` | ✅ | JWT signing key (can equal `SECRET_KEY`) |
| `OPENAI_API_KEY` | ⚠️ | AI triage features. Falls back to keyword mock if absent. |
| `EMAIL_PROVIDER` | ✅ | `console` (dev) or `sendgrid` (production) |
| `EMAIL_API_KEY` | ⚠️ | SendGrid API key. Only needed if `EMAIL_PROVIDER=sendgrid`. |
| `GOOGLE_CLIENT_ID` | ⚠️ | Google Calendar OAuth. Calendar sync disabled if absent. |
| `GOOGLE_CLIENT_SECRET` | ⚠️ | Google Calendar OAuth. |
| `GOOGLE_REDIRECT_URI` | ✅ | OAuth callback URL. Must match Google Cloud Console setting. |
| `REDIS_URL` | ⚠️ | Redis for Django-Q. Falls back to synchronous ORM if blank. |
| `DJANGO_Q_SYNC` | ✅ | `True` = synchronous tasks (Windows/CI). `False` = async workers. |
| `FRONTEND_URL` | ✅ | Used in email templates for links back to the app. |
| `BACKEND_URL` | ✅ | Used in calendar OAuth redirects. |

---

## 🚀 Live Demo

> **Deployment status:** This project is configured for deployment to Vercel (frontend) + Render (backend) + Neon PostgreSQL. See [`docs/full-guide.md`](docs/full-guide.md) for the complete step-by-step deployment guide.

| Service | URL |
| :--- | :--- |
| **Frontend** | *(deploy to Vercel — see deployment guide)* |
| **Backend API** | *(deploy to Render — see deployment guide)* |

---

## ⚠️ Known Limitations

1. **Google Calendar OAuth requires user authorization** — works locally with valid credentials; in production, the redirect URI must be updated to the deployed backend URL.
2. **AI triage is not a medical diagnosis** — summaries are clearly labeled and wrapped in disclaimers. The app operates in triage-assist mode only.
3. **Django-Q on Windows** runs in synchronous mode (`DJANGO_Q_SYNC=True`) because Windows does not support forking. In production (Linux), set `DJANGO_Q_SYNC=False` and run `python manage.py qcluster`.
4. **Email in dev** defaults to `console` backend — emails print to the terminal, not delivered to inboxes. Set `EMAIL_PROVIDER=sendgrid` + `EMAIL_API_KEY` for real delivery.
5. **SQLite limitations for concurrency** — The `select_for_update()` row lock is fully effective only on PostgreSQL. Use `DATABASE_URL` pointing to Postgres in any multi-user testing scenario.

---

## 📚 Documentation Index

| Document | Description |
| :--- | :--- |
| [`docs/full-guide.md`](docs/full-guide.md) | Complete narrative guide: architecture, mechanisms, deployment, roadmap |
| [`docs/system-design.md`](docs/system-design.md) | Concurrency controls, slot hold, leave conflict, notification retry |
| [`docs/database-schema.md`](docs/database-schema.md) | All tables, columns, constraints, indexes, and DB selection rationale |
| [`docs/api-documentation.md`](docs/api-documentation.md) | Every implemented endpoint with request/response shapes and error codes |
| [`docs/llm-prompts.md`](docs/llm-prompts.md) | Verbatim AI prompts used for pre-visit triage and post-visit summaries |
| [`docs/google-calendar-setup.md`](docs/google-calendar-setup.md) | Step-by-step Google Cloud OAuth setup guide |
| [`docs/interview-prep.md`](docs/interview-prep.md) | Top technical interview Q&A for this project |

---

## 📄 License

Built for the AyuSetu Healthcare MVP Assignment.
