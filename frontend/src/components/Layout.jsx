import React from 'react';
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
  Moon
} from 'lucide-react';

/* Two-tone AyuSetu wordmark using Baloo 2 */
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
          { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: 'All Appointments', path: '/doctor/appointments', icon: Calendar },
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Doctors List', path: '/admin/doctors', icon: UserSquare2 },
          { label: 'Doctor Leaves', path: '/admin/leaves', icon: ShieldAlert },
          { label: 'Appointments Oversight', path: '/admin/appointments', icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 hidden md:flex flex-col">
        {/* Logo/Brand */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="AyuSetu Logo" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <AyuSetuWordmark size="md" />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Multispeciality Clinic
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold border border-primary-100 dark:border-primary-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User info + Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 px-2">
            <div className="h-8 w-8 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{user.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="AyuSetu" className="h-8 w-8 object-contain" />
          <AyuSetuWordmark size="sm" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-600 dark:text-slate-300 focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-white dark:bg-slate-900 h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img src="/logo.png" alt="AyuSetu" className="h-8 w-8 object-contain" />
                <AyuSetuWordmark size="sm" />
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold border border-primary-100 dark:border-primary-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Desktop */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-8 py-3.5 hidden md:flex items-center justify-end">
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-bold cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 uppercase tracking-wider border border-primary-100 dark:border-primary-800">
                  {user.role}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-navy-50 dark:bg-slate-800 border-2 border-navy-100 dark:border-slate-700 flex items-center justify-center text-navy-700 dark:text-sky-300 font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
