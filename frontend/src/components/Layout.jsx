import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  UserSquare2, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Clock, 
  ShieldAlert,
  ClipboardList
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine navigation items by user role
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center space-x-2">
          <div className="bg-primary-600 text-white p-2 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">AyuSetu</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-primary-600 text-white p-2 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">AyuSetu</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 focus:outline-none hover:bg-slate-50 p-2 rounded-lg border border-slate-200"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-white h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">AyuSetu Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-600 p-2">
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
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Desktop */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 hidden md:flex items-center justify-end">
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-primary-700 font-bold">
              {user.name.charAt(0).toUpperCase()}
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
