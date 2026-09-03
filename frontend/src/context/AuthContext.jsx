import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await API.get('auth/me/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return userData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await API.post('auth/register/', { name, email, password, role });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return userData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const googleAuth = async (credential, role = 'PATIENT', extraData = {}) => {
    setLoading(true);
    try {
      const payload = { credential, role };
      if (extraData?.email) payload.email = extraData.email;
      if (extraData?.name) payload.name = extraData.name;
      const response = await API.post('auth/google/', payload);
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return userData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleAuth, loginWithGoogle: googleAuth, logout, reloadProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
