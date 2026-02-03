import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@productivity.ai',
    settings: {
      theme: 'light',
      focusDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      dailyGoal: 8,
      notifications: true
    }
  });
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tasksRes, notesRes, analyticsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/notes'),
        api.get('/analytics/dashboard')
      ]);
      setTasks(tasksRes.data);
      setNotes(notesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    }
  };

  const refreshNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to refresh notes:', error);
    }
  };

  const refreshAnalytics = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await api.put('/auth/settings', newSettings);
      setUser(prev => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings }
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const value = {
    user,
    setUser,
    tasks,
    setTasks,
    notes,
    setNotes,
    analytics,
    loading,
    refreshTasks,
    refreshNotes,
    refreshAnalytics,
    updateSettings,
    loadInitialData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
