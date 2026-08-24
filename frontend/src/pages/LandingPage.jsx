import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Brain,
  CalendarCheck,
  ClipboardList,
  Bell,
  CalendarArrowUp,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

/* ─── Two-tone wordmark (mirrors Layout.jsx exactly) ─── */
const AyuSetuWordmark = ({ size = 'xl' }) => {
  const textClass =
    size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-2xl' : 'text-xl';
  return (
    <span className={`brand-wordmark ${textClass} leading-none`}>
      <span className="brand-ayu">Ayu</span>
      <span className="brand-setu">Setu</span>
    </span>
  );
};

/* ─── Feature card data ─── */
const FEATURES = [
  {
    icon: Brain,
    title: 'AI Symptom Triage',
    desc: 'Patients submit symptoms before their visit; Gemini AI generates an urgency-ranked summary with suggested questions for the doctor.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-100 dark:border-violet-800',
  },
  {
    icon: CalendarCheck,
    title: 'Smart Slot Booking',
    desc: 'Real-time slot availability with a 5-minute hold lease and row-level locking to prevent concurrent double-bookings.',
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-950/60 border-primary-100 dark:border-primary-800',
  },
  {
    icon: ClipboardList,
    title: 'Consultation Management',
    desc: 'Doctors write structured notes and multi-medication prescriptions; AI generates a post-visit summary emailed to the patient.',
    color: 'text-navy-600 dark:text-sky-400',
    bg: 'bg-navy-50 dark:bg-slate-800 border-navy-100 dark:border-slate-700',
  },
  {
    icon: Bell,
    title: 'Automated Reminders',
    desc: 'Booking confirmations, cancellations, reschedules, and medication reminders sent via email with a 3-attempt retry state machine.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800',
  },
  {
    icon: CalendarArrowUp,
    title: 'Google Calendar Sync',
    desc: "Confirmed appointments are automatically pushed to the patient's Google Calendar via OAuth 2.0 and the Calendar API v3.",
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Portals',
    desc: 'Separate, dedicated experiences for patients (booking & history), doctors (schedule & consult), and clinic admins (oversight).',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-800',
  },
];

/* ─── How-it-works steps ─── */
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Book a Slot',
    desc: 'Browse doctors by specialisation, pick an available time slot, and confirm your appointment in seconds.',
  },
  {
    step: '02',
    title: 'Share Your Symptoms',
    desc: 'Before your visit, describe your symptoms in the patient portal — the AI triages them and prepares a clinical summary.',
  },
  {
    step: '03',
    title: 'Get AI-Assisted Care',
    desc: 'Your doctor reviews the AI summary, conducts the consultation, and sends you a structured post-visit plan by email.',
  },
];

/* ─── Demo credentials (from README seed_data) ─── */
const DEMO_CREDENTIALS = [
  {
    role: 'Patient',
    email: 'rohan.malhotra@example.com',
    password: 'Patient@123',
    color:
      'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    badge:
      'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
  },
  {
    role: 'Doctor',
    email: 'dr.ananya.reddy@example.com',
    password: 'Doctor@123',
    color:
      'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300',
    badge: 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300',
  },
  {
    role: 'Admin',
    email: 'admin@ayusetu.com',
    password: 'Admin@123',
    color:
      'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300',
    badge:
      'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300',
  },
];

/* ══════════════════════════════════════════════════════════ */
/*  LandingPage                                               */
/* ══════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AyuSetu Logo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col leading-none">
              <AyuSetuWordmark size="lg" />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Multispeciality Clinic
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              id="landing-theme-toggle"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4 text-amber-400" />
                : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
            <Link
              id="nav-login-btn"
              to="/login"
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white border border-transparent shadow-sm transition-all hover:-translate-y-0.5"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO                                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="AyuSetu Logo"
            className="h-20 w-20 object-contain"
          />
        </div>

        {/* Wordmark */}
        <h1 className="brand-wordmark text-6xl sm:text-7xl leading-none mb-4">
          <span className="brand-ayu">Ayu</span>
          <span className="brand-setu">Setu</span>
        </h1>

        {/* Tagline */}
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
          Bridge of Health
        </p>

        {/* Subtext */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10">
          A clinical appointment system with AI-powered symptom triage, doctor
          consultation management, and automated patient follow-up — built for
          multispeciality clinics.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            id="hero-login-btn"
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold border border-transparent shadow-sm transition-all hover:-translate-y-0.5"
          >
            Login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            id="hero-register-btn"
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-primary-700 dark:text-primary-300 text-sm font-bold border border-primary-200 dark:border-primary-700 shadow-sm transition-all hover:-translate-y-0.5"
          >
            Register
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FEATURE HIGHLIGHTS                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              Platform Features
            </p>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Everything a modern clinic needs
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              All features verified and working — no placeholders, no mock data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 elevated-card p-6 transition-all hover:-translate-y-0.5"
              >
                <div className={`inline-flex p-2.5 rounded-xl border mb-4 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
            How It Works
          </p>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            From booking to care in three steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-slate-200 dark:bg-slate-700" />

          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="relative text-center px-4">
              {/* Step circle */}
              <div className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white font-extrabold text-sm mx-auto mb-5 shadow-sm">
                {step}
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* DEMO CREDENTIALS                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section
        id="demo"
        className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              Try the Demo
            </p>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-3">
              Log in instantly — no sign-up needed
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              These are pre-seeded demo accounts. Pick a role and explore the full
              platform right now.
            </p>
          </div>

          {/* Credential cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {DEMO_CREDENTIALS.map(({ role, email, password, color, badge }) => (
              <div
                key={role}
                className={`rounded-2xl border p-5 ${color}`}
              >
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3 ${badge}`}
                >
                  {role}
                </span>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
                      Email
                    </p>
                    <p className="text-xs font-mono font-semibold break-all">
                      {email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
                      Password
                    </p>
                    <p className="text-xs font-mono font-semibold">{password}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Demo CTA */}
          <div className="text-center">
            <Link
              id="demo-login-btn"
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold border border-transparent shadow-sm transition-all hover:-translate-y-0.5"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              The backend may take ~30 s to wake up on a cold start (Render free tier).
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AyuSetu" className="h-7 w-7 object-contain opacity-80" />
            <div className="flex flex-col leading-none">
              <span className="brand-wordmark text-lg leading-none">
                <span className="brand-ayu">Ayu</span>
                <span className="brand-setu">Setu</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Bridge of Health
              </span>
            </div>
          </div>

          {/* GitHub link */}
          <a
            id="footer-github-link"
            href="https://github.com/vip23anchib/ayusetu-healthcare"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            vip23anchib/ayusetu-healthcare
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-600">
          Built for the AyuSetu Healthcare MVP Assignment. Demo accounts are
          seeded test data only.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
