import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Calendar, 
  UserSquare2, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert,
  ClipboardList,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

/* Two-tone AyuSetu wordmark */
const AyuSetuWordmark = ({ size = 'md' }) => {
  const textClass = size === 'sm' ? 'text-lg' : 'text-xl';
  return (
    <span className={`brand-wordmark ${textClass} leading-none`}>
      <span className="brand-ayu">Ayu</span><span className="brand-setu">Setu</span>
    </span>
  );
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user.role) {
      case 'PATIENT':
        return [
          { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Find Doctors', path: '/patient/doctors', icon: UserSquare2 },
          { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
        ];
      case 'DOCTOR':
        return [
          { label: 'Doctor Suite', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: 'Appointments Queue', path: '/doctor/appointments', icon: Calendar },
        ];
      case 'ADMIN':
        return [
          { label: 'Admin Command', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Doctor Roster', path: '/admin/doctors', icon: UserSquare2 },
          { label: 'Leave Approvals', path: '/admin/leaves', icon: ShieldAlert },
          { label: 'Audit & Oversight', path: '/admin/appointments', icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  const getRoleTheme = () => {
    switch (user.role) {
      case 'DOCTOR':
        return { label: 'Doctor Suite', color: 'text-sky-600 dark:text-sky-400', badge: 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' };
      case 'ADMIN':
        return { label: 'Administrator', color: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      default:
        return { label: 'Patient Portal', color: 'text-teal-600 dark:text-teal-400', badge: 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800' };
    }
  };

  const roleMeta = getRoleTheme();
  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080e1a] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200 selection:bg-teal-500 selection:text-white">
      {/* Sidebar for Desktop */}
      <aside className="w-68 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/90 dark:border-slate-800/80 hidden md:flex flex-col z-20">
        {/* Logo/Brand */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/70">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src="/logo.png" alt="AyuSetu Logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="flex flex-col">
              <AyuSetuWordmark size="md" />
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  AI Healthcare
                </span>
                <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                  v2.4
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <div className="px-3 py-2">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
            Menu Navigation
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/10 via-primary-500/10 to-transparent dark:from-primary-950/60 dark:via-primary-900/30 text-primary-700 dark:text-primary-300 border-l-3 border-primary-600 dark:border-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Live status badge */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-800/40">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Gemini AI Active</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-tight">
            Atomic slot locks & triage sync ready.
          </p>
        </div>

        {/* Bottom: User info + Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-400 border border-primary-300 dark:border-primary-700 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${roleMeta.badge} uppercase tracking-wider`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center space-x-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-bold cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-600" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all text-xs font-bold cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="AyuSetu" className="h-8 w-8 object-contain" />
          <AyuSetuWordmark size="sm" />
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 bg-white dark:bg-slate-900 h-full flex flex-col p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <img src="/logo.png" alt="AyuSetu" className="h-8 w-8 object-contain" />
                <AyuSetuWordmark size="sm" />
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 px-4 py-3 w-full rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header for Desktop */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 px-8 py-3.5 hidden md:flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display">
              Portal Overview
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-display">
              {roleMeta.label}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
            >
              Public Home
            </Link>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.2 rounded-full border ${roleMeta.badge} uppercase tracking-wider`}>
                  {user.role}
                </span>
              </div>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-600 to-navy-700 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-mesh-light dark:bg-mesh-dark">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
