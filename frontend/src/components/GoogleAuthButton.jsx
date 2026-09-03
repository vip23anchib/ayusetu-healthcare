import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

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
}) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonContainerRef = useRef(null);
  const hiddenBtnRef = useRef(null);
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'light';

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      if (onError) onError(new Error('Google sign-in did not return a valid credential.'));
      return;
    }

    setLoading(true);
    try {
      await onSuccess(response.credential);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Google authentication failed. Please try again.';
      if (onError) onError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const initializeGoogleGSI = () => {
    if (!window.google?.accounts?.id || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
      });

      // Render official Google button inside the container
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: text.toLowerCase().includes('sign up') ? 'signup_with' : 'continue_with',
          logo_alignment: 'left',
          width: 360,
        });
      }

      // Also render a hidden fallback trigger button for custom click handling
      if (hiddenBtnRef.current) {
        hiddenBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(hiddenBtnRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
        });
      }
    } catch (err) {
      console.error('Failed to initialize Google Identity Services:', err);
    }
  };

  // Load Google Identity Services script
  useEffect(() => {
    if (!clientId) return;

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      setScriptLoaded(true);
      if (window.google?.accounts?.id) {
        initializeGoogleGSI();
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setScriptLoaded(true);
      initializeGoogleGSI();
    };
    script.onerror = () => {
      if (onError) {
        onError(
          new Error('Failed to load Google Identity Services. Check your internet connection or adblocker.')
        );
      }
    };
    document.body.appendChild(script);
  }, [clientId, theme]);

  const handleCustomButtonClick = () => {
    if (disabled || loading) return;

    if (!clientId) {
      if (onError) {
        onError(
          new Error(
            'Google OAuth Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable live Google Sign-In.'
          )
        );
      }
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        // Attempt One Tap prompt first
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMomentum()) {
            // If One Tap was not displayed, trigger native button click
            const nativeBtn =
              buttonContainerRef.current?.querySelector('div[role="button"]') ||
              hiddenBtnRef.current?.querySelector('div[role="button"]');
            if (nativeBtn) {
              nativeBtn.click();
            }
          }
        });
      } catch (_err) {
        const nativeBtn =
          buttonContainerRef.current?.querySelector('div[role="button"]') ||
          hiddenBtnRef.current?.querySelector('div[role="button"]');
        if (nativeBtn) {
          nativeBtn.click();
        }
      }
    }
  };

  return (
    <div className="w-full relative">
      {/* Hidden container for native button bridge if needed */}
      <div ref={hiddenBtnRef} className="hidden" aria-hidden="true" />

      {/* Loading overlay during server token verification */}
      {loading && (
        <div className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-bold text-xs shadow-sm font-display animate-pulse">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent" />
          <span>Verifying Google Account...</span>
        </div>
      )}

      {/* If clientId exists and script is loaded, display official GIS button container */}
      {!loading && clientId && scriptLoaded && (
        <div className="flex justify-center w-full min-h-[44px]">
          <div ref={buttonContainerRef} className="w-full flex justify-center" />
        </div>
      )}

      {/* Fallback button when GSI is loading or if VITE_GOOGLE_CLIENT_ID is not configured */}
      {!loading && (!clientId || !scriptLoaded) && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={disabled || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-bold text-xs transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed font-display"
        >
          <GoogleIcon />
          <span>{text}</span>
        </button>
      )}
    </div>
  );
};

export default GoogleAuthButton;
