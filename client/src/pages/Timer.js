import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward,
  Coffee,
  Target,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function Timer({ onMenuClick }) {
  const { user, tasks } = useApp();
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [stats, setStats] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const durations = {
    focus: (user?.settings?.focusDuration || 25) * 60,
    shortBreak: (user?.settings?.shortBreak || 5) * 60,
    longBreak: (user?.settings?.longBreak || 15) * 60
  };

  const modeLabels = {
    focus: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };

  const modeColors = {
    focus: 'var(--primary)',
    shortBreak: 'var(--success)',
    longBreak: 'var(--secondary)'
  };

  useEffect(() => {
    loadStats();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    setTimeLeft(durations[mode]);
    setIsRunning(false);
  }, [mode]);

  const loadStats = async () => {
    try {
      const response = await api.get('/timer/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleComplete = useCallback(async () => {
    playSound();
    setIsRunning(false);
    
    if (mode === 'focus') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Log session
      try {
        await api.post('/timer/sessions', {
          type: 'focus',
          duration: durations.focus / 60,
          taskId: selectedTask?.id || null,
          notes: selectedTask ? `Worked on: ${selectedTask.title}` : ''
        });
        loadStats();
        toast.success('Focus session completed! Great work! 🎉');
      } catch (error) {
        console.error('Failed to log session:', error);
      }
      
      // Suggest break
      if (newSessionsCompleted % 4 === 0) {
        setMode('longBreak');
        toast('Time for a long break! You\'ve earned it! ☕', { icon: '🎊' });
      } else {
        setMode('shortBreak');
        toast('Time for a short break! 🧘', { icon: '☕' });
      }
    } else {
      setMode('focus');
      toast('Break over! Ready to focus? 💪', { icon: '🚀' });
    }
    
    setTimeLeft(durations[mode === 'focus' ? 'shortBreak' : 'focus']);
  }, [mode, sessionsCompleted, selectedTask, durations, soundEnabled]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning && mode === 'focus') {
      toast('Focus mode started! You got this! 🎯');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const skipSession = () => {
    if (mode === 'focus') {
      setMode('shortBreak');
    } else {
      setMode('focus');
    }
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoAQbPv9LJUAAA/1P//2mkAAB7J+//gjwAAC5/v//ewAAAAdNn//+GVAAABLH3//+m5AAAAHlT//+3SAAAABzP///LnAAAAABb///j5AAAAAAX///z/AAAAAAAB////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==" type="audio/wav" />
      </audio>

      {/* Header */}
      <header className="header">
        <div>
          <button className="btn btn-ghost btn-icon lg:hidden" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className="header-title">Focus Timer</h1>
          <p className="header-subtitle">Stay focused with the Pomodoro technique</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      <div className="page-container">
        <div className="two-column-layout">
          {/* Timer Section */}
          <div>
            <div className="card">
              <div className="timer-container">
                {/* Mode Selector */}
                <div className="timer-modes">
                  <button 
                    className={`timer-mode-btn ${mode === 'focus' ? 'active' : ''}`}
                    onClick={() => setMode('focus')}
                  >
                    <Target size={16} style={{ marginRight: '0.25rem' }} />
                    Focus
                  </button>
                  <button 
                    className={`timer-mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
                    onClick={() => setMode('shortBreak')}
                  >
                    <Coffee size={16} style={{ marginRight: '0.25rem' }} />
                    Short Break
                  </button>
                  <button 
                    className={`timer-mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
                    onClick={() => setMode('longBreak')}
                  >
                    <Coffee size={16} style={{ marginRight: '0.25rem' }} />
                    Long Break
                  </button>
                </div>

                {/* Timer Display */}
                <div className="timer-label">{modeLabels[mode]}</div>
                <div 
                  className="timer-display"
                  style={{ color: modeColors[mode] }}
                >
                  {formatTime(timeLeft)}
                </div>

                {/* Progress Bar */}
                <div className="timer-progress">
                  <div 
                    className="timer-progress-bar"
                    style={{ 
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${modeColors[mode]}, var(--secondary))`
                    }}
                  />
                </div>

                {/* Controls */}
                <div className="timer-controls">
                  <button 
                    className="btn btn-ghost btn-icon"
                    onClick={resetTimer}
                  >
                    <RotateCcw size={24} />
                  </button>
                  <button 
                    className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'} btn-lg`}
                    onClick={toggleTimer}
                    style={{ minWidth: '140px' }}
                  >
                    {isRunning ? <Pause size={24} /> : <Play size={24} />}
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    className="btn btn-ghost btn-icon"
                    onClick={skipSession}
                  >
                    <SkipForward size={24} />
                  </button>
                </div>

                {/* Session Counter */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  {[1, 2, 3, 4].map(num => (
                    <div
                      key={num}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: num <= (sessionsCompleted % 4 || (sessionsCompleted > 0 ? 4 : 0)) 
                          ? 'var(--primary)' 
                          : 'var(--gray-200)',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                  {sessionsCompleted} sessions completed today
                </div>
              </div>
            </div>

            {/* Task Selection */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">
                  <Target size={18} style={{ marginRight: '0.5rem' }} />
                  Focus on Task
                </h3>
              </div>
              <div className="card-body">
                {pendingTasks.length === 0 ? (
                  <p style={{ color: 'var(--gray-500)', textAlign: 'center' }}>
                    No pending tasks
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {pendingTasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius)',
                          border: `2px solid ${selectedTask?.id === task.id ? 'var(--primary)' : 'var(--gray-200)'}`,
                          background: selectedTask?.id === task.id ? 'rgba(59, 130, 246, 0.05)' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span className={`task-priority ${task.priority}`} style={{ fontSize: '0.7rem' }}>
                            {task.priority}
                          </span>
                          {task.estimatedTime && <span>{task.estimatedTime}m estimated</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div>
            {/* Today's Stats */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">Today's Progress</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {stats?.today?.sessions || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Sessions</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>
                      {stats?.today?.minutes || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Minutes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Week Stats */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">This Week</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="stat-icon blue">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {Math.round((stats?.week?.minutes || 0) / 60 * 10) / 10}h
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                      Focus time
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="stat-icon orange">
                    <Flame size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {stats?.streak || 0} days
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                      Current streak
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Focus Tips</h3>
              </div>
              <div className="card-body">
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <span>🎯</span>
                    <span>Focus on one task at a time</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <span>📱</span>
                    <span>Put your phone on silent</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <span>💧</span>
                    <span>Stay hydrated during breaks</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <span>🧘</span>
                    <span>Stretch during long breaks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer;
