import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Button, Avatar, EmptyState } from '../../components/UI';
import { Calendar, Clock, AlertCircle, Timer } from 'lucide-react';

const PatientBook = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  
  const [heldAppointment, setHeldAppointment] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await API.get(`doctors/${doctorId}/`);
        setDoctor(response.data);
      } catch (err) {
        console.error("Failed to load doctor profile", err);
        setError("Doctor profile not found.");
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const fetchSlots = async () => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setError('');
    try {
      const response = await API.get(`doctors/${doctorId}/slots/?date=${selectedDate}`);
      setSlots(response.data);
    } catch (err) {
      console.error("Failed to fetch slots", err);
      setError("Failed to fetch slots for this date.");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    setHeldAppointment(null);
  }, [selectedDate, doctorId]);

  useEffect(() => {
    if (!heldAppointment) return;
    
    setTimeLeft(300);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHeldAppointment(null);
          setError("Your 5-minute slot hold has expired. Please select a new slot.");
          fetchSlots();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [heldAppointment]);

  const handleSelectSlot = async (slot) => {
    setError('');
    try {
      const response = await API.post('appointments/', {
        doctor_id: parseInt(doctorId),
        appointment_date: selectedDate,
        start_time: slot.start_time
      });
      setHeldAppointment(response.data);
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Could not hold slot. It may have just been booked.";
      setError(errMsg);
      fetchSlots();
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Please describe your symptoms before confirming.");
      return;
    }
    setConfirming(true);
    setError('');
    try {
      await API.post(`appointments/${heldAppointment.id}/symptoms/`, {
        symptoms_text: symptoms
      });
      navigate('/patient/appointments', { state: { successMessage: "Appointment booked and confirmed successfully!" } });
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Confirmation failed. Please try again.";
      setError(errMsg);
      setConfirming(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Profile info */}
      <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <Avatar name={doctor?.user?.name} specialization={doctor?.specialization} />
          <div>
            <span className="text-[10px] font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
              AyuSetu Multispeciality Clinic
            </span>
            <h1 className="text-xl font-bold text-slate-800 mt-1">
              {doctor ? `Dr. ${doctor.user?.name}` : 'Loading Doctor Profile...'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{doctor?.specialization}</p>
          </div>
        </div>
        <div className="text-xs bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-slate-600 font-bold">
          Consultation duration: <span className="text-primary-700">{doctor?.slot_duration} mins</span>
        </div>
      </Card>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 font-semibold">{error}</p>
        </div>
      )}

      {!heldAppointment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar Picker Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-50 pb-3">
              <Calendar className="h-4.5 w-4.5 text-primary-700" />
              <span>1. Choose Date</span>
            </h3>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 text-xs font-semibold"
            />
          </div>

          {/* Time Slots Grid Picker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-50 pb-3">
              <Clock className="h-4.5 w-4.5 text-primary-700" />
              <span>2. Select Shift Slot</span>
            </h3>

            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No available slots found on this date. Doctor might be on leave or fully booked.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slots.map((slot, index) => (
                  <button
                    key={index}
                    disabled={!slot.available}
                    onClick={() => handleSelectSlot(slot)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl text-center border transition-all cursor-pointer ${
                      slot.available
                        ? 'border-primary-100 bg-primary-50/20 text-primary-700 hover:bg-primary-700 hover:text-white hover:border-transparent hover:shadow-md'
                        : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.start_time.substring(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Symptom Submission & Hold Timer Screen */
        <Card className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <Timer className="h-5 w-5 text-amber-600 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Slot Held Safely</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Your reservation is locked. Please submit your symptoms to confirm.</p>
              </div>
            </div>
            <span className="text-base font-mono font-bold text-amber-700 bg-white border border-amber-200 px-3 py-1 rounded-xl shadow-sm">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-semibold text-slate-600 space-y-1">
            <p>Clinical Slot Details:</p>
            <p className="text-slate-800 font-bold">
              Dr. {doctor?.user?.name} — {selectedDate} @ {heldAppointment.start_time.substring(0, 5)} - {heldAppointment.end_time.substring(0, 5)} (IST)
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-5">
            <div>
              <label htmlFor="symptoms" className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Describe Symptoms & Concerns (Mandatory)
              </label>
              <textarea
                id="symptoms"
                rows={4}
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: Fever for 2 days with body ache and mild cough."
                className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 text-xs font-medium"
              />
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setHeldAppointment(null)}
              >
                Change Time
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={confirming}
                className="flex-1"
              >
                {confirming ? 'Confirming Appointment...' : 'Confirm Appointment'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default PatientBook;
