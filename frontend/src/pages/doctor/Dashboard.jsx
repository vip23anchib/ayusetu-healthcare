import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, Dr. {user?.name}</h1>
        <p className="text-slate-600 mt-1">Manage your appointment schedule, view pre-visit summaries, and write consultation notes.</p>
      </div>
    </div>
  );
};

export default DoctorDashboard;
