import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, User, Stethoscope, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GoogleAuthButton = ({
  onSuccess,
  onError,
  text = 'Continue with Google',
  disabled = false,
  role = 'PATIENT',
}) => {
  const [loading, setLoading] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState(role);

  const hiddenBtnRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Synchronize customRole when the parent role prop changes
  useEffect(() => {
    setCustomRole(role);
  }, [role]);

  const defaultProfiles = [
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      role: 'PATIENT',
      tag: 'Patient Account',
      avatarBg: 'bg-emerald-500',
    },
    {
      name: 'Dr. Sunita Patel',
      email: 'dr.sunita.patel@gmail.com',
      role: 'DOCTOR',
      tag: 'Doctor Account',
      avatarBg: 'bg-sky-500',
    },
    {
      name: 'Rohan Malhotra',
      email: 'rohan.google@gmail.com',
      role: 'PATIENT',
      tag: 'Patient Account',
      avatarBg: 'bg-teal-500',
    },
  ];

  const handleCredentialResponse = async (response) => {
    if (response?.credential) {
      setLoading(true);
      try {
        await onSuccess(response.credential, role);
      } catch (err) {
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    } else {
      if (onError) onError(new Error('Google sign-in did not return valid credentials.'));
    }
  };

  const initializeGoogleGSI = () => {
    if (!window.google?.accounts?.id || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (hiddenBtnRef.current) {
      window.google.accounts.id.renderButton(hiddenBtnRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
      });
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleGSI();
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initializeGoogleGSI();
    }
  }, [clientId]);

  const handleClick = () => {
    if (disabled || loading) return;

    // If live Google Client ID is configured and script is ready, use official Google Identity Services
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMomentum()) {
            const hiddenButton = hiddenBtnRef.current?.querySelector('div[role="button"]');
            if (hiddenButton) {
              hiddenButton.click();
            }
          }
        });
      } catch (_err) {
        const hiddenButton = hiddenBtnRef.current?.querySelector('div[role="button"]');
        if (hiddenButton) {
          hiddenButton.click();
        }
      }
      return;
    }

    // Otherwise, open the interactive Google Sandbox Simulator
    setShowSandboxModal(true);
  };

  const handleSandboxSignIn = async (profile) => {
    setShowSandboxModal(false);
    setLoading(true);

    const targetEmail = profile.isCustom
      ? customEmail.trim() || 'developer.user@gmail.com'
      : profile.email;

    const targetName = profile.isCustom
      ? customName.trim() || 'Google Sandbox User'
      : profile.name;

    const targetRole = profile.isCustom ? customRole : profile.role || role;

    try {
      const mockToken = `mock_google_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await onSuccess(mockToken, targetRole, {
        email: targetEmail,
        name: targetName,
      });
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden container for Google Identity Services native button bridge */}
      <div ref={hiddenBtnRef} className="hidden" aria-hidden="true" />

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-bold text-xs transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed font-display"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-teal-600" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>{text}</span>
            {!clientId && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                Sandbox
              </span>
            )}
          </>
        )}
      </button>

      {/* Google Sign-In Sandbox Modal */}
      {showSandboxModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSandboxModal(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <GoogleIcon />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                    Google Sign-In Simulator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Zero-config development & demo testing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSandboxModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/80 p-3.5 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 font-display">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Live OAuth Client ID Not Detected
                </div>
                <p className="text-teal-700 dark:text-teal-400 text-[11px] leading-relaxed">
                  <code className="bg-white/60 dark:bg-teal-900/60 px-1 py-0.5 rounded font-mono font-bold">VITE_GOOGLE_CLIENT_ID</code> is not configured.
                  Use this sandbox simulator to test instant Google authentication, profile creation, and role redirection without needing Google Cloud credentials.
                </p>
              </div>

              {/* Account Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-display">
                  Choose a Google Profile
                </label>
                <div className="space-y-2">
                  {defaultProfiles.map((p, idx) => (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => setSelectedProfileIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedProfileIndex === idx
                          ? 'bg-teal-50/70 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                          : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl ${p.avatarBg} text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0`}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-display">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {p.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                            p.role === 'DOCTOR'
                              ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {p.tag}
                        </span>
                        {selectedProfileIndex === idx && (
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Custom Account Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedProfileIndex(99)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedProfileIndex === 99
                        ? 'bg-teal-50/70 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                        +
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">
                          Use Custom Email
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Sign in or register with any test email
                        </p>
                      </div>
                    </div>
                    {selectedProfileIndex === 99 && (
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Custom Input Fields (when custom is selected) */}
              {selectedProfileIndex === 99 && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Maya Deshmukh"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Google Email
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. maya@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomRole('PATIENT')}
                        className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                          customRole === 'PATIENT'
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomRole('DOCTOR')}
                        className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                          customRole === 'DOCTOR'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Doctor
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedProfileIndex === 99) {
                    handleSandboxSignIn({ isCustom: true });
                  } else {
                    handleSandboxSignIn(defaultProfiles[selectedProfileIndex]);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2 font-display"
              >
                <GoogleIcon />
                <span>
                  {selectedProfileIndex === 99
                    ? `Continue with Custom Account`
                    : `Continue as ${defaultProfiles[selectedProfileIndex].name}`}
                </span>
              </button>

              {/* Live OAuth Setup Guide Accordion */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" />
                    How to enable live Google OAuth?
                  </span>
                  {showSetupGuide ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showSetupGuide && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] space-y-2 text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      To connect your live Google Cloud Console credentials:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 font-mono text-[10px]">
                      <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
                      <li>Create OAuth 2.0 Web Client ID with authorized JS origin: <code className="text-teal-600 dark:text-teal-400">http://localhost:5173</code></li>
                      <li>In <code className="text-teal-600 dark:text-teal-400">frontend/.env</code>: set <code className="text-teal-600 dark:text-teal-400">VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</code></li>
                      <li>In <code className="text-teal-600 dark:text-teal-400">backend/.env</code>: set <code className="text-teal-600 dark:text-teal-400">GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</code></li>
                      <li>Restart the Vite dev server to reload env variables.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
