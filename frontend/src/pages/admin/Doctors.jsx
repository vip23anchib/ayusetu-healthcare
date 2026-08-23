import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Card, Badge, Button, Avatar } from '../../components/UI';
import { User, Mail, ShieldAlert, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [slotDuration, setSlotDuration] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctorsList = async () => {
    setLoading(true);
    try {
      const response = await API.get('doctors/');
      setDoctors(response.data);
    } catch (err) {
      console.error("Failed to load doctors list", err);
      setError("Failed to retrieve doctor profiles from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !specialization || !slotDuration) {
      setError("All fields are mandatory.");
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await API.post('admin/doctors/', {
        name,
        email,
        password,
        specialization,
        slot_duration: parseInt(slotDuration)
      });
      setSuccess(`Dr. ${name} registered successfully! Default working hours (Monday-Friday 9 AM - 5 PM) have been allocated.`);
      setName('');
      setEmail('');
      setPassword('');
      setSpecialization('General Physician');
      setSlotDuration('30');
      fetchDoctorsList();
    } catch (err) {
      console.error("Failed to create doctor", err);
      setError(err.response?.data?.email?.[0] || err.response?.data?.detail || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, doctorName) => {
    if (!window.confirm(`Are you sure you want to deactivate Dr. ${doctorName}?`)) return;
    try {
      await API.delete(`admin/doctors/${id}/`);
      setSuccess(`Dr. ${doctorName} profile deleted.`);
      fetchDoctorsList();
    } catch (err) {
      alert("Failed to delete doctor profile.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Specialist Medical Practitioners</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Add new doctors, configure slot durations, and review clinical availability.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border-l-4 border-emerald-500 p-4 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register Doctor Form */}
        <div className="lg:col-span-1">
          <Card title="Add New Doctor" subtitle="Provision login credentials and specialization.">
            <form onSubmit={handleRegisterDoctor} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 theme-input border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="dr.ananya.reddy@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 theme-input border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 theme-input border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology, Pediatrics, General Physician"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-2.5 theme-input border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Appointment Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-full p-2.5 theme-input border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Registering...' : 'Register Specialist'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Specialists Directory List */}
        <div className="lg:col-span-2">
          <Card title="Active Clinic Practitioner Directory" subtitle="List of all medical doctors active at AyuSetu Multispeciality Clinic.">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center font-medium">No practitioner profiles registered yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {doctors.map((doc) => (
                  <div key={doc.id} className="py-4 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-700/30 px-3 rounded-2xl transition-all">
                    <div className="flex items-center space-x-3.5">
                      <Avatar name={doc.user.name} specialization={doc.specialization} />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Dr. {doc.user.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                          Contact: <span className="text-slate-800 dark:text-slate-200 font-bold">{doc.user.email}</span>
                        </p>
                        <div className="flex space-x-2 pt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 uppercase tracking-wide">
                            {doc.specialization}
                          </span>
                          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-800">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{doc.slot_duration}m slot</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDoctor(doc.id, doc.user.name)}
                      className="p-2 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctors;
