import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Shield, Sun, Moon, ArrowLeft, Mail } from 'lucide-react';

/* ─── Two-tone wordmark (local, no shared component needed) ─── */
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

const PrivacyPolicy = () => {
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
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-navy-900 text-white py-14 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-bold mb-5 tracking-wider uppercase">
          <Shield className="h-3.5 w-3.5" />
          Legal &amp; Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 font-display tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-primary-100 text-sm max-w-xl mx-auto">
          How AyuSetu HealthCare collects, uses, and protects your personal information.
        </p>
        <p className="text-primary-200 text-xs mt-4 font-medium">Last updated: September 2026</p>
      </div>

      {/* ── Content ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        {/* Disclaimer callout */}
        <div className="mb-10 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
            ⚠️ Important Disclaimer
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            AyuSetu HealthCare is a clinic appointment and follow-up platform. It is <strong>not</strong> a substitute for professional medical advice, diagnosis, or treatment. In case of a medical emergency, call your local emergency services immediately.
          </p>
        </div>

        <Section title="1. Who We Are">
          <p>
            AyuSetu HealthCare (&ldquo;AyuSetu&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a multispeciality clinic web platform that facilitates appointment booking, AI-assisted symptom triage, and follow-up management between patients and healthcare providers.
          </p>
          <p>
            This Privacy Policy explains what information we collect when you use our website at{' '}
            <a href="https://ayusetu-healthcare.vercel.app" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              https://ayusetu-healthcare.vercel.app
            </a>
            , how we use it, and your rights regarding that information.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect information in the following ways:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Account Registration:</strong> Name, email address, password (hashed), and role (Patient / Doctor).
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Google Sign-In:</strong> When you sign in with Google, we receive your Google account name, email address, and profile identifier (Google sub). We do not receive or store your Google password.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Appointment Information:</strong> Date, time, specialty, and consultation notes you submit when booking or attending an appointment.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Symptom Information:</strong> Symptom descriptions you voluntarily submit for AI-assisted triage prior to a consultation.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Technical Data:</strong> IP addresses, browser type, device information, and usage logs collected automatically when you access our platform.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Create and manage your AyuSetu account.</li>
            <li>Enable appointment booking, slot management, and consultation tracking.</li>
            <li>Generate AI-assisted symptom triage summaries for your consulting doctor.</li>
            <li>Send appointment confirmation and follow-up emails.</li>
            <li>Maintain platform security, prevent fraud, and debug technical issues.</li>
            <li>Improve platform features and user experience based on usage patterns.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell or rent your personal information to third parties.
          </p>
        </Section>

        <Section title="4. AI-Assisted Triage">
          <p>
            AyuSetu uses Google Gemini AI to generate symptom triage summaries. When you submit symptoms, your input is sent to Google&rsquo;s Gemini API to generate a clinical overview for your doctor. Google&rsquo;s use of this data is governed by{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Google&rsquo;s Privacy Policy
            </a>
            .
          </p>
          <p>
            AI triage outputs are informational summaries only. They do not constitute a medical diagnosis and should be reviewed by a qualified healthcare professional.
          </p>
        </Section>

        <Section title="5. Google Sign-In">
          <p>
            AyuSetu offers Google Sign-In via Google Identity Services (OAuth 2.0). When you use this feature, Google shares limited account information (name, email, Google account identifier) with AyuSetu solely for the purpose of creating and authenticating your account. Your Google password is never shared with or stored by AyuSetu.
          </p>
          <p>
            Our use of Google Sign-In is governed by{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Google&rsquo;s Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Google API Services User Data Policy
            </a>
            .
          </p>
        </Section>

        <Section title="6. Data Storage and Security">
          <p>
            Your data is stored in a managed PostgreSQL database hosted on Neon (cloud). We use industry-standard security practices including encrypted connections (HTTPS/TLS), hashed passwords, and JWT-based authentication. However, no system is completely secure, and we cannot guarantee absolute security of your data.
          </p>
          <p>
            You are responsible for keeping your login credentials confidential and for providing accurate, truthful information when using the platform.
          </p>
        </Section>

        <Section title="7. Data Sharing">
          <p>We may share your information in the following limited circumstances:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Healthcare Providers:</strong> Appointment and symptom information is shared with the doctor assigned to your consultation.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Service Providers:</strong> We use third-party services including Google Gemini AI, Google Calendar API, Neon (database), Vercel (frontend hosting), and Render (backend hosting). Each operates under its own privacy policy.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Legal Requirements:</strong> We may disclose information if required by law, court order, or government authority.
            </li>
          </ul>
        </Section>

        <Section title="8. Cookies and Tracking">
          <p>
            AyuSetu uses browser local storage to store authentication tokens and user preferences (such as light/dark mode). We do not use advertising cookies or third-party tracking pixels.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Withdraw consent for Google Sign-In by revoking AyuSetu&rsquo;s access via your Google Account settings.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:barman23vipanchi@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              barman23vipanchi@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            AyuSetu is not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided personal information, we will delete it promptly.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we make material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of AyuSetu after such changes constitutes your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:
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
            <Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              Terms of Service
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

export default PrivacyPolicy;
