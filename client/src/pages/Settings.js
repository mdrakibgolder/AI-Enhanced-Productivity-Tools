import React, { useState } from 'react';
import { 
  User, 
  Clock, 
  Bell, 
  Palette, 
  Shield,
  Download,
  Trash2,
  Save,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

function Settings({ onMenuClick }) {
  const { user, updateSettings } = useApp();
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    focusDuration: user?.settings?.focusDuration || 25,
    shortBreak: user?.settings?.shortBreak || 5,
    longBreak: user?.settings?.longBreak || 15,
    dailyGoal: user?.settings?.dailyGoal || 8,
    notifications: user?.settings?.notifications ?? true,
    theme: user?.settings?.theme || 'light'
  });

  const handleSave = async () => {
    try {
      await updateSettings({
        focusDuration: settings.focusDuration,
        shortBreak: settings.shortBreak,
        longBreak: settings.longBreak,
        dailyGoal: settings.dailyGoal,
        notifications: settings.notifications,
        theme: settings.theme
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleExport = () => {
    // Export data as JSON
    const data = {
      exportedAt: new Date().toISOString(),
      settings: settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productivity-data-export.json';
    a.click();
    toast.success('Data exported successfully!');
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div>
          <button className="btn btn-ghost btn-icon lg:hidden" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className="header-title">Settings</h1>
          <p className="header-subtitle">Customize your productivity experience</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </header>

      <div className="page-container" style={{ maxWidth: '800px' }}>
        {/* Profile Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <User size={18} style={{ marginRight: '0.5rem' }} />
              Profile
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 700
                }}
              >
                {settings.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{settings.name}</div>
                <div style={{ color: 'var(--gray-500)' }}>{settings.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timer Settings */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} style={{ marginRight: '0.5rem' }} />
              Timer Settings
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Focus Duration (min)</label>
                <input
                  type="number"
                  className="form-input"
                  min="5"
                  max="90"
                  value={settings.focusDuration}
                  onChange={(e) => setSettings({ ...settings, focusDuration: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Short Break (min)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="30"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Long Break (min)</label>
                <input
                  type="number"
                  className="form-input"
                  min="5"
                  max="60"
                  value={settings.longBreak}
                  onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="form-label">Daily Focus Goal (sessions)</label>
              <input
                type="number"
                className="form-input"
                style={{ maxWidth: '200px' }}
                min="1"
                max="20"
                value={settings.dailyGoal}
                onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                = {settings.dailyGoal * settings.focusDuration} minutes of focused work per day
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Palette size={18} style={{ marginRight: '0.5rem' }} />
              Appearance
            </h3>
          </div>
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Theme</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className={`btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Sun size={18} />
                  Light
                </button>
                <button
                  className={`btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Moon size={18} />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Bell size={18} style={{ marginRight: '0.5rem' }} />
              Notifications
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Enable Notifications</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  Get reminded about tasks and breaks
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    inset: 0,
                    backgroundColor: settings.notifications ? 'var(--primary)' : 'var(--gray-300)',
                    borderRadius: '28px',
                    transition: 'all 0.3s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '22px',
                      width: '22px',
                      left: settings.notifications ? '25px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={18} style={{ marginRight: '0.5rem' }} />
              Data Management
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Export Data</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    Download all your data as JSON
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={handleExport}>
                  <Download size={18} />
                  Export
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--danger)' }}>Delete All Data</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    Permanently delete all your data
                  </div>
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure? This action cannot be undone.')) {
                      toast.success('Data deleted (demo mode)');
                    }
                  }}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          <p>AI Productivity Suite v1.0.0</p>
          <p>Made with ❤️ for productive people</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
