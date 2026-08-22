import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { User, Mail, ShieldAlert, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
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
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setSpecialization('General Medicine');
      setSlotDuration('30');
      // Refresh list
      fetchDoctorsList();
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Check if email is already taken.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, doctorName) => {
    if (!window.confirm(`Are you sure you want to delete Dr. ${doctorName}? This will permanently remove their profile.`)) return;
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
        <h1 className="text-2xl font-bold text-slate-800">Healthcare Specialists Management</h1>
        <p className="text-slate-500 text-sm mt-1">Register new clinical profiles, configure slots, and view the practitioner directory.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-sm text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-sm text-rose-800 flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Practitioner profile Form */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Plus className="h-5 w-5 text-primary-600" />
            <span>Register Doctor Profile</span>
          </h3>

          <form onSubmit={handleRegisterDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Elizabeth Blackwell"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. elizabeth@ayusetu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Password</label>
              <input
                type="password"
                required
                placeholder="Temporary login password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Specialization Department</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiology, Paediatrics..."
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Slot Duration (Minutes)</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Profile'}
            </button>
          </form>
        </div>

        {/* Specialists Directory List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <User className="h-5 w-5 text-primary-600" />
            <span>Active Practitioner Directory</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No practitioner profiles registered yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {doctors.map((doc) => (
                <div key={doc.id} className="py-4 flex justify-between items-center hover:bg-slate-50/30 px-2 rounded-xl transition-all">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">Dr. {doc.user.name}</h4>
                    <p className="text-slate-500 text-xs font-medium">
                      Email: <span className="text-slate-700 font-semibold">{doc.user.email}</span>
                    </p>
                    <div className="flex space-x-2 pt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700">
                        {doc.specialization}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{doc.slot_duration}m slot</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDoctor(doc.id, doc.user.name)}
                    className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDoctors;
