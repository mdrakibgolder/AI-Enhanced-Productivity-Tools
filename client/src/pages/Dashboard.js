import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  Flame, 
  TrendingUp, 
  ChevronRight,
  Lightbulb,
  Zap,
  Menu,
  Plus,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard({ onMenuClick }) {
  const { tasks, analytics, loading, refreshTasks, refreshAnalytics } = useApp();
  const [dailyPlan, setDailyPlan] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [planRes, suggestionsRes] = await Promise.all([
        api.get('/ai/daily-plan'),
        api.get('/ai/suggestions')
      ]);
      setDailyPlan(planRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedToday = tasks.filter(t => {
    if (!t.completedAt) return false;
    return new Date(t.completedAt).toDateString() === new Date().toDateString();
  });

  const chartData = {
    labels: analytics?.weeklyData?.map(d => d.day) || [],
    datasets: [
      {
        label: 'Focus Minutes',
        data: analytics?.weeklyData?.map(d => d.focusMinutes) || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
      },
      {
        label: 'Tasks Completed',
        data: analytics?.weeklyData?.map(d => d.tasksCompleted * 20) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        borderRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div>
          <button className="btn btn-ghost btn-icon lg:hidden" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className="header-title">Dashboard</h1>
          <p className="header-subtitle">Welcome back! Here's your productivity overview</p>
        </div>
        <div className="header-actions">
          <Link to="/tasks" className="btn btn-primary">
            <Plus size={18} />
            New Task
          </Link>
        </div>
      </header>

      <div className="page-container">
        {/* Greeting */}
        {dailyPlan && (
          <div className="greeting-section">
            <h2 className="greeting-text">{dailyPlan.greeting}</h2>
            <p className="greeting-subtext">
              You have {pendingTasks.length} pending tasks and completed {completedToday.length} today.
            </p>
            {dailyPlan.quote && (
              <div className="greeting-quote">
                "{dailyPlan.quote}"
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Tasks Pending</div>
              <div className="stat-value">{analytics?.taskStats?.pending || 0}</div>
              <div className="stat-change positive">
                <TrendingUp size={14} />
                {analytics?.taskStats?.inProgress || 0} in progress
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Completed Today</div>
              <div className="stat-value">{analytics?.todayStats?.tasksCompleted || 0}</div>
              <div className="stat-change positive">
                <TrendingUp size={14} />
                Great progress!
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Focus Time Today</div>
              <div className="stat-value">{analytics?.todayStats?.focusMinutes || 0}m</div>
              <div className="stat-change positive">
                <TrendingUp size={14} />
                {analytics?.todayStats?.focusSessions || 0} sessions
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Flame size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Current Streak</div>
              <div className="stat-value">{analytics?.streak || 0} days</div>
              <div className="stat-change positive">
                <TrendingUp size={14} />
                Best: {analytics?.longestStreak || 0} days
              </div>
            </div>
          </div>
        </div>

        <div className="two-column-layout">
          {/* Left Column */}
          <div>
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h3 className="card-title">
                    <Lightbulb size={18} style={{ marginRight: '0.5rem', color: '#F59E0B' }} />
                    AI Suggestions
                  </h3>
                </div>
                <div className="card-body">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={`suggestion-card ${suggestion.type}`}
                    >
                      <span className="suggestion-icon">{suggestion.icon}</span>
                      <div className="suggestion-content">
                        <div className="suggestion-title">{suggestion.title}</div>
                        <div className="suggestion-text">{suggestion.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Weekly Overview</h3>
                <Link to="/analytics" className="btn btn-ghost btn-sm">
                  View Details <ChevronRight size={16} />
                </Link>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Productivity Score */}
            <div className="score-card" style={{ marginBottom: '1.5rem' }}>
              <div className="score-title">Productivity Score</div>
              <div className="score-value">{analytics?.productivityScore || 0}</div>
              <div className="score-label">
                {analytics?.productivityScore >= 80 ? 'Excellent!' :
                 analytics?.productivityScore >= 60 ? 'Good work!' :
                 analytics?.productivityScore >= 40 ? 'Keep going!' : 'Let\'s improve!'}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Calendar size={18} style={{ marginRight: '0.5rem' }} />
                  Priority Tasks
                </h3>
                <Link to="/tasks" className="btn btn-ghost btn-sm">
                  View All <ChevronRight size={16} />
                </Link>
              </div>
              <div className="card-body">
                {pendingTasks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <CheckCircle2 size={48} className="empty-state-icon" />
                    <div className="empty-state-title">All caught up!</div>
                    <div className="empty-state-text">No pending tasks</div>
                  </div>
                ) : (
                  <div className="task-list">
                    {pendingTasks.slice(0, 5).map(task => (
                      <div key={task.id} className="task-item">
                        <div className="task-checkbox">
                          {task.status === 'completed' && <CheckCircle2 size={14} />}
                        </div>
                        <div className="task-content">
                          <div className="task-title">{task.title}</div>
                          <div className="task-meta">
                            <span className={`task-priority ${task.priority}`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className={`task-due ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                                <Clock size={12} />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tip */}
            {dailyPlan?.tip && (
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Zap size={20} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Productivity Tip</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {dailyPlan.tip}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
