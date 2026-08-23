# AyuSetu — Google Calendar Integration Setup Guide

This guide walks through setting up Google Calendar OAuth 2.0 so AyuSetu can add appointment events to a patient's Google Calendar.

---

## Prerequisites

- A Google account (use a personal or dedicated project account)
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- The AyuSetu backend running locally or deployed

---

## Step 1: Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/).
2. Click the project dropdown at the top → **New Project**.
3. Name it `AyuSetu` (or any name).
4. Click **Create** and wait for the project to be created.
5. Select the new project from the dropdown.

---

## Step 2: Enable the Google Calendar API

1. In the left sidebar, go to **APIs & Services → Library**.
2. Search for **Google Calendar API**.
3. Click it and press **Enable**.

---

## Step 3: Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**.
2. Select **External** (allows any Google account to authorize).
3. Click **Create**.
4. Fill in required fields:
   - **App name:** `AyuSetu`
   - **User support email:** your email
   - **Developer contact email:** your email
5. Click **Save and Continue** through Scopes (no extra scopes needed here).
6. On the **Test Users** screen, add the Google accounts you'll use for testing (required while app is in "Testing" mode).
7. Click **Save and Continue**.

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**.
2. Click **+ Create Credentials → OAuth client ID**.
3. Select **Application type: Web application**.
4. Name it `AyuSetu Backend`.
5. Under **Authorized redirect URIs**, add:

   **Local development:**
   ```
   http://localhost:8000/api/calendar/callback/
   ```

   **Production (add after deploying to Render):**
   ```
   https://your-backend.onrender.com/api/calendar/callback/
   ```

6. Click **Create**.
7. A dialog shows your **Client ID** and **Client Secret**. Copy both immediately (you can also download the JSON).

---

## Step 5: Add Credentials to `.env`

In `backend/.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/callback/
```

Restart the Django server after editing `.env`.

---

## Step 6: Authorize a User (First-Time Flow)

1. Log in to the AyuSetu frontend as a patient.
2. Call (or visit) `GET /api/calendar/connect/` — this returns a Google OAuth URL.
3. Redirect the user (or open in browser) to that URL.
4. The user logs in with their Google account and grants calendar access.
5. Google redirects to `GOOGLE_REDIRECT_URI` — Django's `GoogleCallbackView` handles this, exchanges the code for tokens, and stores them.

From this point forward, newly confirmed appointments will automatically create Google Calendar events.

---

## Step 7: Test Event Creation

1. Book a new appointment as a patient (go through the full hold → symptoms → confirm flow).
2. After confirming, check the Google Calendar of the test account.
3. You should see a new event titled `AyuSetu Appointment — Dr. <Name>` with the correct date and time.

---

## Changing the Redirect URI for Production

When you deploy the backend to Render:

1. Go back to **Google Cloud Console → APIs & Services → Credentials → your OAuth client**.
2. Add the production URI to **Authorized redirect URIs**:
   ```
   https://your-backend.onrender.com/api/calendar/callback/
   ```
3. Update `GOOGLE_REDIRECT_URI` in your Render environment variables to match.
4. Users who authorized with the local URI must re-authorize with the production URI.

> **Important:** Both URIs (local and production) can coexist in the list — you don't need to remove the local one when you add the production one.

---

## App Verification (For Production Public Use)

While the app is in **Testing** mode, only users added to the Test Users list can authorize. For a public production app where any user can connect their calendar:

1. Complete the **OAuth consent screen** fully (add privacy policy URL, terms of service URL).
2. Submit for **Google Verification** (takes 1–4 weeks for review).
3. Once approved, the OAuth consent screen shows a standard Google permission prompt without a "This app isn't verified" warning.

For the purposes of this project (assignment/demo), Testing mode with pre-added test users is sufficient.

---

## Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| `redirect_uri_mismatch` error | URI in `.env` doesn't exactly match Google Cloud Console setting | Must be byte-for-byte identical, including trailing slash |
| `403: access_denied` | User not in Test Users list | Add their Google account to the Test Users list in the consent screen |
| Event not created | Missing or expired token | Re-authorize via `GET /api/calendar/connect/` |
| Calendar API disabled | API not enabled in project | Re-check Step 2 |
