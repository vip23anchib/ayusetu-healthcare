import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FileText, Sun, Moon, ArrowLeft, Mail } from 'lucide-react';

/* ─── Two-tone wordmark ─── */
const AyuSetuWordmark = () => (
  <span className="brand-wordmark text-xl leading-none">
    <span className="brand-ayu">Ayu</span>
    <span className="brand-setu">Setu</span>
  </span>
);

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700/60 font-display tracking-tight">
      {title}
    </h2>
    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
      {children}
    </div>
  </section>
);

const Terms = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'light';
  const toggleTheme = themeContext?.toggleTheme;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080e1a] text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* ── Top navigation bar ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="AyuSetu Logo" className="h-8 w-8 object-contain transition-transform group-hover:scale-105" />
          <AyuSetuWordmark />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          )}
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-navy-700 to-navy-900 dark:from-navy-900 dark:to-[#040810] text-white py-14 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-bold mb-5 tracking-wider uppercase">
          <FileText className="h-3.5 w-3.5" />
          Legal &amp; Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 font-display tracking-tight">
          Terms of Service
        </h1>
        <p className="text-navy-200 text-sm max-w-xl mx-auto">
          Please read these terms carefully before using the AyuSetu HealthCare platform.
        </p>
        <p className="text-navy-300 text-xs mt-4 font-medium">Last updated: September 2026</p>
      </div>

      {/* ── Content ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        {/* Disclaimer callout */}
        <div className="mb-10 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
            ⚠️ Not a Substitute for Emergency Care
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            AyuSetu HealthCare is a clinic appointment and management platform. It is <strong>not</strong> intended to replace emergency medical services. If you are experiencing a medical emergency, call your local emergency number immediately and do not rely on this platform for urgent care.
          </p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using AyuSetu HealthCare (&ldquo;AyuSetu&rdquo;, &ldquo;the Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the platform.
          </p>
          <p>
            These Terms apply to all users of the platform, including patients, doctors, and administrators.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            AyuSetu HealthCare is a multispeciality clinic web platform that provides:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Online appointment booking and slot management between patients and healthcare providers.</li>
            <li>AI-assisted symptom triage summaries (powered by Google Gemini AI) to assist doctors during consultations.</li>
            <li>Secure consultation note and prescription management for healthcare providers.</li>
            <li>Email follow-up notifications and calendar integration for appointments.</li>
          </ul>
          <p>
            AyuSetu does <strong>not</strong> provide medical diagnoses, treatment, or emergency care. It is a scheduling and communication support platform for clinics.
          </p>
        </Section>

        <Section title="3. User Accounts">
          <p>
            To use the core features of AyuSetu, you must create an account by registering with your email and password, or by signing in with Google. By creating an account, you agree that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>All information you provide is accurate, complete, and current.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You will notify us immediately if you suspect unauthorized access to your account.</li>
            <li>You will not share your account with others or use another person's account without permission.</li>
            <li>Each individual must create their own account. Shared accounts are not permitted.</li>
          </ul>
        </Section>

        <Section title="4. Patient Responsibilities">
          <p>As a patient user of AyuSetu, you acknowledge and agree that:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>You are responsible for providing accurate symptom information and personal details.</li>
            <li>AI triage summaries are informational tools for your assigned doctor, not medical diagnoses.</li>
            <li>You must arrive for scheduled appointments or cancel in a timely manner.</li>
            <li>AyuSetu is not a substitute for professional medical care. You should consult a licensed healthcare professional for medical concerns.</li>
            <li>In a medical emergency, you must seek emergency care immediately rather than using this platform.</li>
          </ul>
        </Section>

        <Section title="5. Doctor and Healthcare Provider Responsibilities">
          <p>As a doctor or healthcare provider using AyuSetu, you acknowledge and agree that:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>You are solely responsible for the medical advice, diagnoses, and prescriptions you provide to patients.</li>
            <li>AI triage summaries are decision-support tools only and do not replace your clinical judgment.</li>
            <li>You must only use the platform in accordance with applicable medical laws and professional standards in your jurisdiction.</li>
            <li>You are responsible for maintaining patient confidentiality in accordance with applicable regulations.</li>
          </ul>
        </Section>

        <Section title="6. AI-Assisted Features">
          <p>
            AyuSetu uses Google Gemini AI to generate symptom triage summaries. These AI-generated outputs:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Are for informational and clinical support purposes only.</li>
            <li>Do not constitute medical diagnosis or treatment recommendations.</li>
            <li>May contain inaccuracies and must be reviewed critically by a qualified healthcare professional.</li>
            <li>Are not a substitute for in-person clinical examination.</li>
          </ul>
          <p>
            AyuSetu makes no warranty, express or implied, regarding the accuracy or completeness of AI-generated triage outputs.
          </p>
        </Section>

        <Section title="7. Google Sign-In">
          <p>
            AyuSetu offers Google Sign-In via Google Identity Services (OAuth 2.0). By using Google Sign-In, you agree to{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Google&rsquo;s Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Google&rsquo;s Privacy Policy
            </a>
            . New users who register via Google Sign-In are assigned the Patient role by default. AyuSetu does not store your Google password.
          </p>
        </Section>

        <Section title="8. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Use AyuSetu for any unlawful purpose or in violation of applicable laws or regulations.</li>
            <li>Submit false, misleading, or fraudulent information including fake symptoms, identities, or medical credentials.</li>
            <li>Attempt to bypass, disable, or interfere with security features of the platform.</li>
            <li>Attempt to access accounts, data, or systems that you are not authorized to access.</li>
            <li>Use automated scripts, bots, or scrapers to interact with the platform.</li>
            <li>Harass, abuse, or harm other users of the platform.</li>
          </ul>
        </Section>

        <Section title="9. Disclaimers">
          <p>
            AyuSetu HealthCare is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. We do not warrant that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>The platform will be uninterrupted, error-free, or secure at all times.</li>
            <li>AI triage outputs will be medically accurate or appropriate for your specific condition.</li>
            <li>Any particular doctor's availability or response will be guaranteed through the platform.</li>
          </ul>
          <p>
            AyuSetu does not hold any medical certification or HIPAA certification. We are not responsible for the medical advice or decisions made by healthcare providers using the platform.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, AyuSetu HealthCare and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use or inability to use the platform, including but not limited to any medical outcomes related to information obtained through the platform.
          </p>
        </Section>

        <Section title="11. Third-Party Services">
          <p>
            AyuSetu integrates with third-party services including Google Gemini AI, Google Calendar, Google Sign-In, Neon Database, Vercel, and Render. Each of these services operates under its own terms and privacy policies. AyuSetu is not responsible for the availability, content, or practices of these third-party services.
          </p>
        </Section>

        <Section title="12. Account Termination">
          <p>
            AyuSetu reserves the right to suspend or terminate your account at any time if you violate these Terms, engage in fraudulent activity, or if required by applicable law. You may request deletion of your account by contacting us at the email address below.
          </p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>
            We may revise these Terms from time to time. Material changes will be indicated by an updated &ldquo;Last updated&rdquo; date at the top of this page. Your continued use of AyuSetu after such changes constitutes your acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="14. Governing Law">
          <p>
            These Terms are governed by applicable laws. Any disputes arising from these Terms or your use of AyuSetu shall be resolved in accordance with applicable legal processes. AyuSetu does not make representations that the platform is appropriate or available in all locations.
          </p>
        </Section>

        <Section title="15. Contact Us">
          <p>
            If you have questions about these Terms of Service, please contact us:
          </p>
          <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Mail className="h-4 w-4 text-primary-500 shrink-0" />
            <a
              href="mailto:barman23vipanchi@gmail.com"
              className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              barman23vipanchi@gmail.com
            </a>
          </div>
        </Section>

        {/* Bottom links */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AyuSetu Multispeciality Clinic. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
