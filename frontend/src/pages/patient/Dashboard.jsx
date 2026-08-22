import React from 'react';
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Hello, {user?.name}!</h1>
        <p className="text-slate-600 mt-1">Welcome to your AyuSetu health dashboard. Book new appointments or view prescriptions below.</p>
      </div>
    </div>
  );
};

export default PatientDashboard;
