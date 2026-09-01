import React, { useEffect, useRef, useState } from 'react';

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
  const hiddenBtnRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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

    if (window.google?.accounts?.id && clientId) {
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
    } else {
      if (onError) {
        onError(
          new Error(
            'Google OAuth Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable live Google Sign-In.'
          )
        );
      }
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
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleAuthButton;
