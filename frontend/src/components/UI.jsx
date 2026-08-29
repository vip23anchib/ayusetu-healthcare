import React from 'react';
import { Sparkles, ArrowUpRight, TrendingUp, X } from 'lucide-react';

// Card Component with dark mode, elevated contrast, and optional glassmorphism
export const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  action, 
  variant = 'default', // 'default', 'glass', 'gradient'
  badge,
  icon: Icon
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return 'glass-card glass-card-hover';
      case 'gradient':
        return 'bg-gradient-to-br from-white via-primary-50/20 to-slate-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-navy-900/40 border border-primary-100/80 dark:border-slate-700 elevated-card';
      default:
        return 'bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card hover:border-slate-300 dark:hover:border-slate-600 transition-all';
    }
  };

  return (
    <div className={`rounded-2xl p-6 relative overflow-hidden ${getVariantStyles()} ${className}`}>
      {(title || subtitle || action || badge || Icon) && (
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/70 border border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 shrink-0">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {title && <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight font-display">{title}</h3>}
                {badge && <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/80 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">{badge}</span>}
              </div>
              {subtitle && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// StatCard Component for dashboards
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'teal', // 'teal', 'navy', 'amber', 'purple', 'emerald', 'rose'
  className = ''
}) => {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-800',
      icon: 'text-teal-600 dark:text-teal-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(13,148,136,0.2)]',
      valColor: 'text-teal-700 dark:text-teal-300'
    },
    navy: {
      bg: 'bg-navy-50 dark:bg-slate-800/80 border-navy-200/80 dark:border-slate-700',
      icon: 'text-navy-600 dark:text-sky-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(30,58,95,0.2)]',
      valColor: 'text-navy-800 dark:text-sky-200'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800',
      icon: 'text-emerald-600 dark:text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      valColor: 'text-emerald-700 dark:text-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      valColor: 'text-amber-700 dark:text-amber-300'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]',
      valColor: 'text-purple-700 dark:text-purple-300'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800',
      icon: 'text-rose-600 dark:text-rose-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]',
      valColor: 'text-rose-700 dark:text-rose-300'
    }
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div className={`group bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card transition-all duration-300 hover:-translate-y-1 ${scheme.glow} ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-display">{title}</span>
        {Icon && (
          <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${scheme.bg} ${scheme.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">{value}</span>
        {trend && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};

// Status Badge pill component with pulsing status indicator dots
export const Badge = ({ status, glow = false }) => {
  const getStyles = () => {
    switch (status) {
      case 'CONFIRMED':
        return {
          wrapper: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/70',
          dot: 'bg-emerald-500 ring-emerald-300 dark:ring-emerald-800'
        };
      case 'COMPLETED':
        return {
          wrapper: 'bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-700/70',
          dot: 'bg-sky-500 ring-sky-300 dark:ring-sky-800'
        };
      case 'CANCELLED':
        return {
          wrapper: 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700/70',
          dot: 'bg-rose-500 ring-rose-300 dark:ring-rose-800'
        };
      case 'HELD':
        return {
          wrapper: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700/70',
          dot: 'bg-amber-500 ring-amber-300 dark:ring-amber-800'
        };
      case 'EXPIRED':
        return {
          wrapper: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400 ring-slate-200 dark:ring-slate-700'
        };
      default:
        return {
          wrapper: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400 ring-slate-200 dark:ring-slate-700'
        };
    }
  };

  const style = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${style.wrapper} ${glow ? 'shadow-sm' : ''}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ring-2 animate-pulse`} />
      {status}
    </span>
  );
};

// Urgency badge with custom glowing animation
export const UrgencyBadge = ({ urgency }) => {
  switch (urgency) {
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Low Urgency
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 uppercase tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
          Medium Urgency
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700 uppercase tracking-wide shadow-[0_0_12px_rgba(225,29,72,0.3)] animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
          High Urgency
        </span>
      );
    default:
      return null;
  }
};

// Button components
export const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled,
  loading = false,
  icon: Icon
}) => {
  const base = "inline-flex items-center justify-center gap-2 font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const styles = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white border-transparent shadow-[0_4px_14px_rgba(13,148,136,0.3)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.4)] hover:-translate-y-0.5",
    secondary: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-sm",
    outline: "bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700 shadow-sm hover:border-primary-400",
    gradient: "bg-gradient-to-r from-primary-600 via-teal-500 to-navy-600 hover:opacity-95 text-white border-transparent shadow-[0_4px_16px_rgba(13,148,136,0.35)] hover:-translate-y-0.5",
    danger: "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border-transparent shadow-[0_4px_14px_rgba(225,29,72,0.3)]",
    dangerOutline: "bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
};

// Empty State template
export const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card min-h-[300px] relative overflow-hidden">
    <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
    {Icon && (
      <div className="relative z-10 bg-primary-50 dark:bg-primary-950/60 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/60 mb-4 text-primary-600 dark:text-primary-400 shadow-sm">
        <Icon className="h-8 w-8" />
      </div>
    )}
    <h3 className="relative z-10 text-lg font-bold text-slate-800 dark:text-slate-100 font-display">{title}</h3>
    <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{message}</p>
    {actionText && onAction && (
      <Button onClick={onAction} className="relative z-10 mt-6" variant="primary">
        {actionText}
      </Button>
    )}
  </div>
);

// Specialty colored Avatar initial circles with dark mode contrast & status ring
export const Avatar = ({ name, specialization = '', size = 'md' }) => {
  const getBgColor = () => {
    switch (specialization.toLowerCase()) {
      case 'cardiology': return 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
      case 'general physician': return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      case 'dermatology': return 'bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 shadow-[0_0_12px_rgba(168,85,247,0.15)]';
      case 'orthopedics': return 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
      case 'pediatrics': return 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 shadow-[0_0_12px_rgba(6,182,212,0.15)]';
      case 'ent specialist': return 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-[0_0_12px_rgba(99,102,241,0.15)]';
      default: return 'bg-primary-50 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 border-primary-200 dark:border-primary-800 shadow-[0_0_12px_rgba(13,148,136,0.15)]';
    }
  };
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base font-extrabold'
  };

  const initials = name
    ? name.split(' ').filter(n => n.toLowerCase() !== 'dr.').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
    : 'U';
    
  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} rounded-2xl flex items-center justify-center font-bold border ${getBgColor()} shrink-0 transition-transform hover:scale-105`}>
      {initials}
    </div>
  );
};

// Modal dialog component
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full ${maxWidth} overflow-hidden transform transition-all`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
