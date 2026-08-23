import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientDoctors from './pages/patient/Doctors';
import PatientBook from './pages/patient/Book';
import PatientAppointments from './pages/patient/Appointments';
import PatientAppointmentDetail from './pages/patient/AppointmentDetail';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorConsult from './pages/doctor/Consult';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminLeaves from './pages/admin/Leaves';
import AdminAppointments from './pages/admin/Appointments';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Gated Routes */}
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<PatientDashboard />} />
                      <Route path="doctors" element={<PatientDoctors />} />
                      <Route path="book/:doctorId" element={<PatientBook />} />
                      <Route path="appointments" element={<PatientAppointments />} />
                      <Route path="appointments/:id" element={<PatientAppointmentDetail />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Doctor Gated Routes */}
            <Route
              path="/doctor/*"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<DoctorDashboard />} />
                      <Route path="appointments" element={<DoctorAppointments />} />
                      <Route path="appointments/:id" element={<PatientAppointmentDetail />} />
                      <Route path="appointments/:id/consult" element={<DoctorConsult />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Gated Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="doctors" element={<AdminDoctors />} />
                      <Route path="doctors/:id" element={<AdminDoctors />} />
                      <Route path="leaves" element={<AdminLeaves />} />
                      <Route path="appointments" element={<AdminAppointments />} />
                      <Route path="appointments/:id" element={<PatientAppointmentDetail />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback routing */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
