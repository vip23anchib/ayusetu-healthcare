import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Calendar, Trash2, ShieldAlert, Plus, CheckCircle, User } from 'lucide-react';

const AdminLeaves = () => {
  const [doctors, setDoctors] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Leave Form state
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch doctors
      const docRes = await API.get('doctors/');
      setDoctors(docRes.data);
      if (docRes.data.length > 0) {
        setSelectedDoctorId(docRes.data[0].id.toString());
      }

      // 2. Fetch detailed profiles of all doctors to extract leaves list
      const leavesList = [];
      for (const doc of docRes.data) {
        try {
          const detail = await API.get(`admin/doctors/${doc.id}/`);
          if (detail.data.leaves?.length > 0) {
            detail.data.leaves.forEach((l) => {
              leavesList.push({
                ...l,
                doctor: doc
              });
            });
          }
        } catch (e) {
          console.error(`Could not fetch details for doctor ${doc.id}`, e);
        }
      }
      
      // Sort leaves by date descending
      leavesList.sort((a, b) => new Date(b.leave_date) - new Date(a.leave_date));
      setAllLeaves(leavesList);
    } catch (err) {
      console.error("Failed to load doctor leaves details", err);
      setError("Failed to load global doctor leave logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !leaveDate) {
      setError("Doctor and Date are mandatory.");
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await API.post(`admin/doctors/${selectedDoctorId}/leave/`, {
        leave_date: leaveDate,
        reason: reason
      });
      const docObj = doctors.find(d => d.id === parseInt(selectedDoctorId));
      setSuccess(`Leave recorded successfully for Dr. ${docObj?.user?.name || ''} on ${leaveDate}. Conflicting appointments are cancelled and patients notified.`);
      setLeaveDate('');
      setReason('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add leave. Check if date is already marked.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (doctorId, dateStr, doctorName) => {
    if (!window.confirm(`Cancel leave for Dr. ${doctorName} on ${dateStr}?`)) return;
    try {
      await API.delete(`admin/doctors/${doctorId}/leave/`, {
        data: { leave_date: dateStr }
      });
      setSuccess(`Leave for Dr. ${doctorName} cancelled.`);
      loadData();
    } catch (err) {
      alert("Failed to cancel leave.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doctor Leave Management</h1>
        <p className="text-slate-500 text-sm mt-1">Schedule leaves for doctors, cancel conflict bookings, and notify patients automatically.</p>
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
        {/* Register Leave Form */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Plus className="h-5 w-5 text-primary-600" />
            <span>Schedule Leave</span>
          </h3>

          <form onSubmit={handleAddLeave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Select Practitioner</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.user.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Leave Date</label>
              <input
                type="date"
                required
                value={leaveDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Reason / Note</label>
              <input
                type="text"
                placeholder="e.g. Medical Conference, Personal off..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Registering Leave...' : 'Schedule Leave'}
            </button>
          </form>
        </div>

        {/* Global Leaves Listing */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <span>Active Leave Schedule Ledger</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : allLeaves.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No scheduled practitioner leaves recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {allLeaves.map((leave, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center hover:bg-slate-50/30 px-2 rounded-xl transition-all">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">Dr. {leave.doctor.user.name}</h4>
                    <div className="flex items-center space-x-2.5 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">{leave.leave_date}</span>
                      {leave.reason && (
                        <>
                          <span>•</span>
                          <span>{leave.reason}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLeave(leave.doctor.id, leave.leave_date, leave.doctor.user.name)}
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

export default AdminLeaves;
