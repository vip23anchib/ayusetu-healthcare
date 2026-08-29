import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, AlertCircle, Sun, Moon, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Login failed. Please check your credentials.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080e1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-200 bg-mesh-light dark:bg-mesh-dark">
      {/* Background glowing orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-navy-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="absolute top-6 right-6 flex items-center space-x-3">
        <Link
          to="/"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          ← Back to Home
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src="/logo.png" alt="AyuSetu Logo" className="h-14 w-14 object-contain transition-transform group-hover:scale-105" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
          </Link>
          <h1 className="brand-wordmark text-3xl sm:text-4xl mt-3 font-display">
            <span className="brand-ayu">Ayu</span><span className="brand-setu">Setu</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Multispeciality Clinic
          </p>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-display">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Or{' '}
          <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
            register for a new patient account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-200/90 dark:border-slate-700/80 sm:rounded-3xl sm:px-10 space-y-6">
          
          {/* 1-Click Quick Demo Switcher */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-teal-500" />
                1-Click Quick Fill Demo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('rohan.malhotra@example.com', 'Patient@123')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer text-center"
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('dr.ananya.reddy@example.com', 'Doctor@123')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all cursor-pointer text-center"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@ayusetu.com', 'Admin@123')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all cursor-pointer text-center"
              >
                Admin
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 p-3.5 rounded-xl flex items-start space-x-2.5">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-rose-800 dark:text-rose-200">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide font-display">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 theme-input border rounded-xl focus:outline-none text-xs font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide font-display">
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 theme-input border rounded-xl focus:outline-none text-xs font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-[0_4px_14px_rgba(13,148,136,0.35)] text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-500 hover:to-teal-500 focus:outline-none transition-all disabled:opacity-50 cursor-pointer hover:-translate-y-0.5 font-display"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
