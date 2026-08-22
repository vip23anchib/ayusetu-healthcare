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
- **What's next:** Phase 2 (Doctor profile, working hours, and leaves schema & CRUD).
- **Known issues / Shortcuts:**
  - Used SQLite locally to avoid PostgreSQL dependency path configuration issues; PostgreSQL is configured dynamically via the `DATABASE_URL` environment variable for production.
