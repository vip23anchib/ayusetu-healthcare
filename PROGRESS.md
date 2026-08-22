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
- **What's next:** Phase 3 (Appointments, Slot Hold, Concurrency Control, and double-booking tests).
- **Known issues / Shortcuts:**
  - Standardized leave action to support both body and query parameters for date deletion, facilitating simpler frontend API requests.

