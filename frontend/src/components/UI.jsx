import React from 'react';

// Card Component with dark mode & elevated contrast
export const Card = ({ children, className = '', title, subtitle, action }) => (
  <div className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card p-6 transition-all ${className}`}>
    {(title || subtitle || action) && (
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-700/60 pb-4">
        <div>
          {title && <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

// Status Badge pill component
export const Badge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'COMPLETED':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'CANCELLED':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'HELD':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'EXPIRED':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStyles()}`}>
      {status}
    </span>
  );
};

// Button components
export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled }) => {
  const base = "inline-flex items-center justify-center font-bold text-xs py-2.5 px-4 rounded-xl transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 text-white border-transparent shadow-sm hover:-translate-y-0.5",
    secondary: "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-600 shadow-sm",
    outline: "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-700",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-sm",
    dangerOutline: "bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Empty State template
export const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card min-h-[300px]">
    {Icon && (
      <div className="bg-slate-100 dark:bg-slate-700/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-600/60 mb-4 text-slate-500 dark:text-slate-400">
        <Icon className="h-8 w-8" />
      </div>
    )}
    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{message}</p>
    {actionText && onAction && (
      <Button onClick={onAction} className="mt-5" variant="primary">
        {actionText}
      </Button>
    )}
  </div>
);

// Specialty colored Avatar initial circles with dark mode support
export const Avatar = ({ name, specialization = '' }) => {
  const getBgColor = () => {
    switch (specialization.toLowerCase()) {
      case 'cardiology': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'general physician': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'dermatology': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'orthopedics': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'pediatrics': return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'ent specialist': return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600';
    }
  };
  
  const initials = name
    ? name.split(' ').filter(n => n.toLowerCase() !== 'dr.').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
    : 'U';
    
  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border ${getBgColor()} shrink-0`}>
      {initials}
    </div>
  );
};
