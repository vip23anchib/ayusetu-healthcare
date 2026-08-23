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
      setError(err.response?.data?.detail || "Registration failed. Check if email is already taken.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, doctorName) => {
    if (!window.confirm(`Permanently remove profile for Dr. ${doctorName}?`)) return;
    try {
      await API.delete(`admin/doctors/${id}/`);
      setSuccess(`Dr. ${doctorName} deleted successfully.`);
      fetchDoctorsList();
    } catch (err) {
      alert("Failed to delete doctor profile.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Healthcare Specialists Directory</h1>
        <p className="text-slate-500 text-sm mt-1">Register new clinical profiles, configure slots duration, and audit weekly schedules.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800 flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register Specialist Form */}
        <div className="lg:col-span-1">
          <Card title="Register Specialist Doctor" subtitle="Enrolls doctor and generates Mon-Fri hours automatically.">
            <form onSubmit={handleRegisterDoctor} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sana Sheikh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. sana.sheikh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="Temporary login password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Specialization Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology, Pediatrics, General Physician"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Appointment Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 font-bold bg-white"
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
              <p className="text-xs text-slate-400 py-6 text-center">No practitioner profiles registered yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <div key={doc.id} className="py-4 flex justify-between items-center hover:bg-slate-50/30 px-3 rounded-2xl transition-all">
                    <div className="flex items-center space-x-3.5">
                      <Avatar name={doc.user.name} specialization={doc.specialization} />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 text-sm">Dr. {doc.user.name}</h4>
                        <p className="text-slate-400 text-xs font-semibold">
                          Contact: <span className="text-slate-600 font-bold">{doc.user.email}</span>
                        </p>
                        <div className="flex space-x-2 pt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wide">
                            {doc.specialization}
                          </span>
                          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{doc.slot_duration}m slot</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDoctor(doc.id, doc.user.name)}
                      className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
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
