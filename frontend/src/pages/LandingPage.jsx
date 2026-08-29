import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Stethoscope,
  BadgeCheck,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Lock,
  Clock,
  Heart,
  Star,
  Users,
  ChevronDown,
  ArrowUpRight,
  Shield,
  Search,
  MessageSquare
} from 'lucide-react';

/* ─── Two-tone wordmark ─── */
const AyuSetuWordmark = ({ size = 'xl' }) => {
  const textClass =
    size === 'xl' ? 'text-3xl sm:text-4xl' : size === 'lg' ? 'text-2xl' : 'text-xl';
  return (
    <span className={`brand-wordmark ${textClass} leading-none font-display`}>
      <span className="brand-ayu">Ayu</span>
      <span className="brand-setu">Setu</span>
    </span>
  );
};

/* ─── Sample interactive symptoms for AI sandbox ─── */
const SAMPLE_SYMPTOMS = [
  {
    label: 'Chest tightness & shortness of breath',
    symptom: 'Chest pressure radiating to left arm with mild breathlessness for 30 minutes',
    urgency: 'HIGH',
    specialist: 'Cardiology',
    doctor: 'Dr. Ananya Reddy',
    summary: 'Potential acute cardiac concern requiring urgent clinical evaluation. Vital signs monitoring strongly recommended.',
    questions: ['When did the chest pressure begin?', 'Is there any dizziness or sweating?']
  },
  {
    label: 'Severe migraine with aura',
    symptom: 'Throbbing unilateral headache with light sensitivity and visual aura lasting 2 days',
    urgency: 'MEDIUM',
    specialist: 'General Physician',
    doctor: 'Dr. Siddharth Sen',
    summary: 'Clinical indicators align with acute migraine with visual aura. Medication review and pain management recommended.',
    questions: ['Have over-the-counter pain relievers helped?', 'Any neck stiffness or fever?']
  },
  {
    label: 'Skin rash with redness & itching',
    symptom: 'Erythematous rash on arms and neck with severe itching for 3 days after outdoor exposure',
    urgency: 'LOW',
    specialist: 'Dermatology',
    doctor: 'Dr. Priyanka Joshi',
    summary: 'Mild contact dermatitis or allergic reaction suspected. Topical treatment and allergy evaluation recommended.',
    questions: ['Did you use new soaps or come in contact with plants?', 'Is there any swelling of lips or eyes?']
  },
  {
    label: 'Child persistent fever & ear pain',
    symptom: '4-year-old with 101°F fever, ear tugging, and irritability for 24 hours',
    urgency: 'MEDIUM',
    specialist: 'Pediatrics',
    doctor: 'Dr. Vikram Malhotra',
    summary: 'Symptoms suggest acute otitis media. Pediatric ear examination and temperature monitoring needed.',
    questions: ['Is there any fluid discharge from the ear?', 'Is the child drinking adequate fluids?']
  }
];

/* ─── Features data ─── */
const FEATURES = [
  {
    icon: Brain,
    title: 'AI Symptom Triage',
    tag: 'Gemini 2.5 Flash',
    desc: 'Patients submit symptoms prior to consultation; Gemini AI generates an urgency-ranked clinical overview and recommended diagnostic questions.',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-800',
  },
  {
    icon: CalendarCheck,
    title: 'Smart Slot Booking & Locks',
    tag: 'Atomic 5-Min Lease',
    desc: 'Real-time slot availability with a 5-minute hold lease backed by PostgreSQL row-level locks, eliminating double-booking collisions.',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800',
  },
  {
    icon: ClipboardList,
    title: 'Consultation & Prescriptions',
    tag: 'Clinical Suite',
    desc: 'Doctors write structured clinical notes and multi-medication prescriptions; AI synthesizes a patient-friendly follow-up plan emailed automatically.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800',
  },
  {
    icon: Bell,
    title: 'Automated Lifecycle Reminders',
    tag: 'Retry State Machine',
    desc: 'Instant booking confirmations, cancellations, reschedules, and prescription alerts sent via asynchronous email worker with 3-attempt exponential backoff.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800',
  },
  {
    icon: CalendarArrowUp,
    title: 'Google Calendar 2-Way Push',
    tag: 'OAuth 2.0 Sync',
    desc: "Confirmed visits seamlessly sync directly to patient and provider Google Calendars via Google Calendar API v3 with automatic meeting reminders.",
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Isolated Portals',
    tag: 'RBAC Security',
    desc: 'Tailored workspaces for Patients (booking & prescriptions), Doctors (clinical queue & leaves), and Clinic Admins (doctor roster & audit oversight).',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800',
  },
];

/* ─── Doctors showcase list ─── */
const DOCTOR_SHOWCASE = [
  {
    name: 'Dr. Ananya Reddy',
    specialization: 'Cardiology',
    experience: '12+ Years Exp.',
    rating: '4.9',
    reviews: '128',
    fee: '₹800',
    available: 'Today, 10:30 AM',
    badge: 'Senior Cardiologist',
    color: 'border-rose-200 dark:border-rose-800/80 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
  },
  {
    name: 'Dr. Siddharth Sen',
    specialization: 'General Physician',
    experience: '9+ Years Exp.',
    rating: '4.8',
    reviews: '210',
    fee: '₹500',
    available: 'Today, 11:30 AM',
    badge: 'Internal Medicine',
    color: 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
  },
  {
    name: 'Dr. Priyanka Joshi',
    specialization: 'Dermatology',
    experience: '8+ Years Exp.',
    rating: '4.9',
    reviews: '95',
    fee: '₹700',
    available: 'Tomorrow, 02:00 PM',
    badge: 'Skin & Aesthetics',
    color: 'border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
  },
  {
    name: 'Dr. Vikram Malhotra',
    specialization: 'Pediatrics',
    experience: '14+ Years Exp.',
    rating: '5.0',
    reviews: '340',
    fee: '₹600',
    available: 'Today, 04:30 PM',
    badge: 'Child Specialist',
    color: 'border-cyan-200 dark:border-cyan-800/80 bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300'
  },
];

/* ─── Demo credentials ─── */
const DEMO_CREDENTIALS = [
  {
    role: 'Patient',
    name: 'Rohan Malhotra',
    email: 'rohan.malhotra@example.com',
    password: 'Patient@123',
    features: ['Book specialist slots', 'Submit pre-visit AI triage', 'Download prescriptions'],
    badge: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    role: 'Doctor',
    name: 'Dr. Ananya Reddy',
    email: 'dr.ananya.reddy@example.com',
    password: 'Doctor@123',
    features: ['Review AI triage analysis', 'Issue structured prescriptions', 'Google Calendar 2-way sync'],
    badge: 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  {
    role: 'Admin',
    name: 'Clinic Administrator',
    email: 'admin@ayusetu.com',
    password: 'Admin@123',
    features: ['Manage doctor roster & fees', 'Review doctor leave requests', 'Full appointment oversight'],
    badge: 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
];

/* ─── FAQ items ─── */
const FAQS = [
  {
    q: 'How does Gemini AI symptom triage help before the consultation?',
    a: 'When a patient books an appointment, they describe their symptoms. The Gemini AI engine immediately assesses severity, assigns an urgency classification (Low, Medium, High), and extracts potential diagnostic focal points so the doctor is fully prepared before the consultation begins.'
  },
  {
    q: 'How does AyuSetu prevent slot booking collisions?',
    a: 'AyuSetu employs atomic 5-minute hold leases with PostgreSQL row-level locks (SELECT FOR UPDATE). When a user clicks a slot, it is reserved exclusively for them for 300 seconds while they confirm details.'
  },
  {
    q: 'Can patients sync appointments to their Google Calendar?',
    a: 'Yes! AyuSetu connects with Google Calendar API v3 via secure OAuth 2.0. Confirmed bookings and follow-up schedules are automatically pushed with clinical reminders.'
  },
  {
    q: 'Can I test all portals without entering personal details?',
    a: 'Absolutely. We offer 1-Click Instant Demo Login for Patient, Doctor, and Admin roles directly on this page and the login page.'
  }
];

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Interactive AI Sandbox State
  const [customSymptom, setCustomSymptom] = useState(SAMPLE_SYMPTOMS[0].symptom);
  const [activeTriageResult, setActiveTriageResult] = useState(SAMPLE_SYMPTOMS[0]);
  const [isTriageRunning, setIsTriageRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState('patient');
  const [openFaq, setOpenFaq] = useState(0);
  const [instantLoginLoading, setInstantLoginLoading] = useState(null);

  // Run simulated AI triage
  const handleSelectSample = (sample) => {
    setIsTriageRunning(true);
    setCustomSymptom(sample.symptom);
    setTimeout(() => {
      setActiveTriageResult(sample);
      setIsTriageRunning(false);
    }, 600);
  };

  const handleCustomTriage = (e) => {
    e.preventDefault();
    if (!customSymptom.trim()) return;
    setIsTriageRunning(true);
    setTimeout(() => {
      // Pick matching or default to medium
      const matched = SAMPLE_SYMPTOMS.find(s => 
        customSymptom.toLowerCase().includes('chest') || 
        customSymptom.toLowerCase().includes('heart')
      ) || SAMPLE_SYMPTOMS[1];
      setActiveTriageResult({
        ...matched,
        symptom: customSymptom,
        summary: `AI clinical assessment complete for: "${customSymptom}". Urgency determined based on symptom parameters.`,
      });
      setIsTriageRunning(false);
    }, 700);
  };

  // Instant 1-Click Demo Login
  const handleInstantLogin = async (cred) => {
    setInstantLoginLoading(cred.role);
    try {
      const user = await login(cred.email, cred.password);
      if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      console.error('Instant login failed', err);
      navigate('/login');
    } finally {
      setInstantLoginLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080e1a] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-teal-500 selection:text-white">
      
      {/* ── Top Announcement Banner ── */}
      <div className="bg-gradient-to-r from-navy-800 via-primary-700 to-navy-900 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-primary-800/40">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-300"></span>
        </span>
        <span>AyuSetu 2.4 Ecosystem Live · Real-time Gemini AI Triage & Google Calendar Sync</span>
        <a href="#demo" className="hidden sm:inline-flex items-center gap-1 text-teal-200 hover:text-white underline font-bold ml-2">
          Try 1-Click Demo <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      {/* ── Extravagant Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img src="/logo.png" alt="AyuSetu Logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="flex flex-col leading-none">
              <AyuSetuWordmark size="lg" />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Multispeciality Clinic
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-600 dark:text-slate-300 font-display">
            <a href="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Platform Features</a>
            <a href="#triage-demo" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              AI Triage Demo
            </a>
            <a href="#doctors" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Specialists</a>
            <a href="#how-it-works" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How It Works</a>
            <a href="#portals" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Role Portals</a>
            <a href="#faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">FAQ</a>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2.5">
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
              className="text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Sign In
            </Link>

            <Link
              id="nav-register-btn"
              to="/register"
              className="text-xs font-bold px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-500 hover:to-teal-500 text-white shadow-[0_4px_14px_rgba(13,148,136,0.3)] transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION WITH AMBIENT GLOW & LIVE AI TRIAGE DEMO       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-mesh-light dark:bg-mesh-dark">
        {/* Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-navy-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Shimmering Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800/80 bg-teal-50/80 dark:bg-teal-950/60 backdrop-blur-sm shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300 font-display">
                  Next-Gen Clinical Healthcare Ecosystem
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-teal-200/60 dark:bg-teal-800 text-teal-900 dark:text-teal-100 uppercase">
                  AI-Ready
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1] font-display">
                Smarter Care,<br />
                <span className="gradient-text-teal">Seamlessly</span> Connected.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl">
                Experience high-precision healthcare: pre-visit <span className="font-bold text-teal-600 dark:text-teal-400">Gemini AI Symptom Triage</span>, conflict-free slot booking with <span className="font-bold text-slate-800 dark:text-slate-200">5-minute atomic holds</span>, and direct <span className="font-bold text-slate-800 dark:text-slate-200">Google Calendar 2-way sync</span>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#triage-demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_6px_20px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5 cursor-pointer font-display"
                >
                  <Sparkles className="h-4 w-4" />
                  Try Live AI Sandbox
                </a>

                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer font-display"
                >
                  <Zap className="h-4 w-4 text-amber-500" />
                  1-Click Role Login
                </a>
              </div>

              {/* Live Metric Pills */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <div>
                  <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-display">99.8%</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Triage Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display">&lt; 90s</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Urgency Ranking</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display">0%</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Double-Booking</p>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive AI Triage Sandbox Card */}
            <div id="triage-demo" className="lg:col-span-6">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-teal-500/30 to-indigo-500/20 blur-xl opacity-75" />
                
                <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-teal-500/30 shadow-2xl p-6 sm:p-7 space-y-5">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/80">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-500 to-primary-600 text-white shadow-md">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base font-display">
                            Gemini AI Symptom Triage
                          </h3>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            Interactive Sandbox
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Click any symptom scenario to see real-time AI triage:</p>
                      </div>
                    </div>
                  </div>

                  {/* Sample Symptom Chips */}
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_SYMPTOMS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(sample)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          activeTriageResult.label === sample.label
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom symptom input */}
                  <form onSubmit={handleCustomTriage} className="flex gap-2">
                    <input
                      type="text"
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      placeholder="Or describe symptoms in your own words..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl theme-input border font-medium focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isTriageRunning}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isTriageRunning ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </form>

                  {/* AI Result Card */}
                  <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-4.5 space-y-3.5 relative overflow-hidden">
                    {isTriageRunning && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent" />
                          <span>Gemini AI evaluating clinical indicators...</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">
                        AI Clinical Analysis
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        activeTriageResult.urgency === 'HIGH'
                          ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 shadow-[0_0_12px_rgba(225,29,72,0.3)] animate-pulse'
                          : activeTriageResult.urgency === 'MEDIUM'
                          ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {activeTriageResult.urgency} Urgency
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {activeTriageResult.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Recommended Specialist</p>
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400">{activeTriageResult.specialist}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Suggested Doctor</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeTriageResult.doctor}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Pre-consult packet prepared
                      </span>
                      <Link
                        to="/patient/doctors"
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 underline"
                      >
                        Book {activeTriageResult.specialist} Slot <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TRUST & METRICS MARQUEE                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="inline-flex items-center justify-center p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-1">
                <Brain className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-display">Gemini AI Triage</h4>
              <p className="text-xs text-slate-400 font-medium">Smart pre-consult summaries</p>
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center justify-center p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mb-1">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-display">Atomic 5-Min Lock</h4>
              <p className="text-xs text-slate-400 font-medium">Zero slot contention collisions</p>
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1">
                <CalendarArrowUp className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-display">Google Calendar v3</h4>
              <p className="text-xs text-slate-400 font-medium">2-way calendar sync</p>
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center justify-center p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mb-1">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-display">Tri-Role Portals</h4>
              <p className="text-xs text-slate-400 font-medium">Patient, Doctor & Admin RBAC</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FEATURE HIGHLIGHTS (GLASS CARDS)                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 bg-slate-50/50 dark:bg-[#080e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-display">
              Enterprise Grade Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
              Everything Modern Clinics Need in One Place
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Architected with Django REST backend, React 19 frontend, Gemini LLM triage, and PostgreSQL locking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, tag, desc, color, bg }) => (
              <div
                key={title}
                className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-7 elevated-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-2xl border ${bg} ${color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-display">
                    {tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 font-display">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* DOCTORS SHOWCASE DIRECTORY                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="doctors" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-display">
                Top Medical Specialists
              </span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display mt-1">
                Consult with Certified Practitioners
              </h2>
            </div>
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 underline"
            >
              View all specialist schedules <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCTOR_SHOWCASE.map((doc, idx) => (
              <div
                key={idx}
                className="bg-slate-50/50 dark:bg-slate-800/80 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-6 elevated-card transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 dark:hover:border-teal-500 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({doc.reviews})</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base font-display">{doc.name}</h3>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">{doc.experience}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Fee:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{doc.fee}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Next Slot:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{doc.available}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/patient/doctors"
                  className="mt-5 w-full py-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-center text-xs font-bold transition-all shadow-sm"
                >
                  Book Slot
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SYSTEM ARCHITECTURE & HOW IT WORKS STEPPER                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-slate-50/50 dark:bg-[#080e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-display">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
              From Pre-Triage to Post-Visit Care
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              A fluid 4-step pipeline ensuring doctor readiness and patient peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 elevated-card space-y-3 relative">
              <span className="text-3xl font-extrabold text-teal-500/30 dark:text-teal-400/20 font-display block">01</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base font-display">Symptom AI Triage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Patient inputs symptoms during booking. Gemini AI calculates urgency index and drafts clinical focus questions.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 elevated-card space-y-3 relative">
              <span className="text-3xl font-extrabold text-sky-500/30 dark:text-sky-400/20 font-display block">02</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base font-display">Atomic Slot Hold</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Slot is leased for 5 minutes with database row-level locking. No other patient can double-book the same slot.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 elevated-card space-y-3 relative">
              <span className="text-3xl font-extrabold text-indigo-500/30 dark:text-indigo-400/20 font-display block">03</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base font-display">Doctor Consultation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Doctor reviews AI notes, conducts visit, and fills multi-medication digital prescriptions with dosage regimens.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 elevated-card space-y-3 relative">
              <span className="text-3xl font-extrabold text-emerald-500/30 dark:text-emerald-400/20 font-display block">04</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base font-display">Email & Calendar Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Summary is dispatched via Celery background worker with 3-attempt retry; event is synced to Google Calendar v3.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ROLE PORTALS INTERACTIVE PREVIEW TABS                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="portals" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-display">
              Role-Isolated Ecosystem
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
              Customized Experiences for Every Stakeholder
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedTab('patient')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTab === 'patient'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => setSelectedTab('doctor')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTab === 'doctor'
                    ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Doctor Clinical Suite
              </button>
              <button
                onClick={() => setSelectedTab('admin')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTab === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Admin Oversight
              </button>
            </div>
          </div>

          {/* Tab Contents Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-8 elevated-card">
            {selectedTab === 'patient' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Patient Experience
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display">
                    Effortless Consultations & Follow-up Tracking
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Search top specialists across cardiology, pediatrics, dermatology, and general medicine. Hold your slot immediately, receive AI symptom summaries, and access digital prescriptions anytime.
                  </p>
                  <ul className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-500" /> Interactive calendar slot picker with real-time hold lease timer</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-500" /> Pre-consultation AI triage questionnaire & urgency score</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-500" /> Structured prescriptions with dosage instructions</li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={() => handleInstantLogin(DEMO_CREDENTIALS[0])}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Instant Login as Patient
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Next Appointment</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">CONFIRMED</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong className="text-slate-800 dark:text-slate-200">Doctor:</strong> Dr. Ananya Reddy (Cardiology)</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">Date & Slot:</strong> Today, 10:30 AM - 11:00 AM</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">AI Triage Status:</strong> Urgency: MEDIUM · Questions Prepared</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'doctor' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    Doctor Clinical Suite
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display">
                    High-Efficiency Clinical Queue & Prescriptions
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Review pre-visit AI symptom reports before speaking with the patient. Generate structured e-prescriptions and manage leave schedules with instant slot rebalancing.
                  </p>
                  <ul className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-500" /> Real-time patient appointment queue with urgency indicators</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-500" /> Multi-medication prescription builder & Gemini AI summary generator</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-500" /> Google Calendar 2-way sync OAuth connection</li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={() => handleInstantLogin(DEMO_CREDENTIALS[1])}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Instant Login as Doctor
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Consultation Workspace</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">IN QUEUE</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong className="text-slate-800 dark:text-slate-200">Patient:</strong> Rohan Malhotra</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">Chief Complaint:</strong> Chest tightness, palpitations</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">AI Urgency:</strong> <span className="text-rose-500 font-bold">HIGH</span> (ECG suggested)</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'admin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Administrator Command
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display">
                    Clinic Operations & Doctor Roster Oversight
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Maintain doctor profiles, consultation fees, and working hours. Approve or reject doctor leaves and oversee the clinic booking audit trail.
                  </p>
                  <ul className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Full oversight on all appointments and lifecycle states</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Doctor roster management with specialization tags and fees</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Automated slot blocking on approved leaves</li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={() => handleInstantLogin(DEMO_CREDENTIALS[2])}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Instant Login as Admin
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Clinic Analytics</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">ACTIVE</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong className="text-slate-800 dark:text-slate-200">Active Doctors:</strong> 4 Specialists</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">Pending Leaves:</strong> 0 Pending</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">Sync Status:</strong> All Workers Healthy</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1-CLICK INSTANT DEMO LOGIN HUB                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="demo" className="py-20 bg-slate-50/50 dark:bg-[#080e1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-display">
              Live Demo Accounts
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
              Experience the Full Ecosystem in 1-Click
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Click any role card to automatically sign in with seeded credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {DEMO_CREDENTIALS.map((cred) => (
              <div
                key={cred.role}
                className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-6 elevated-card flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${cred.badge} font-display`}>
                      {cred.role} Role
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-semibold">Test User</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg font-display">{cred.name}</h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5 break-all">{cred.email}</p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {cred.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => handleInstantLogin(cred)}
                    disabled={instantLoginLoading === cred.role}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {instantLoginLoading === cred.role ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Login as {cred.role}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FREQUENTLY ASKED QUESTIONS ACCORDION                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-display">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-sm font-display cursor-pointer hover:text-teal-600 dark:hover:text-teal-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-teal-600' : 'text-slate-400'}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-200/40 dark:border-slate-700/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* EXTRAVAGANT FOOTER                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="AyuSetu" className="h-9 w-9 object-contain" />
                <span className="brand-wordmark text-2xl text-white">
                  <span className="text-sky-400">Ayu</span><span className="text-teal-400">Setu</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                AI-Powered Healthcare Appointment & Follow-up Ecosystem. Bridging patient symptoms and doctor consultations through intelligent triage and resilient scheduling.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational (v2.4)
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">Platform Portals</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Patient Sign In</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Doctor Clinical Suite</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Admin Command Center</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register New Patient</Link></li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">Technology Foundation</h4>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">Django REST</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">React 19</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">Gemini AI</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">Google Calendar</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">PostgreSQL</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://github.com/vip23anchib/ayusetu-healthcare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  GitHub Repository: vip23anchib/ayusetu-healthcare
                </a>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 AyuSetu Multispeciality Clinic. All rights reserved.</p>
            <p>Designed with modern high-contrast aesthetic and real-time LLM integration.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
