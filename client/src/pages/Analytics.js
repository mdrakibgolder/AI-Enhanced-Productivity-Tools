import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Flame,
  Target,
  Menu,
  BarChart2,
  PieChart,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Analytics({ onMenuClick }) {
  const { analytics, tasks } = useApp();
  const [timeDistribution, setTimeDistribution] = useState(null);
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [timeRes, trendsRes, insightsRes] = await Promise.all([
        api.get('/analytics/time-distribution'),
        api.get('/analytics/trends'),
        api.get('/analytics/insights')
      ]);
      setTimeDistribution(timeRes.data);
      setTrends(trendsRes.data);
      setInsights(insightsRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Weekly activity chart
  const weeklyChartData = {
    labels: analytics?.weeklyData?.map(d => d.day) || [],
    datasets: [
      {
        label: 'Focus Minutes',
        data: analytics?.weeklyData?.map(d => d.focusMinutes) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      }
    ]
  };

  // Category distribution chart
  const categoryData = {
    labels: analytics?.categoryDistribution?.map(c => c.name) || [],
    datasets: [{
      data: analytics?.categoryDistribution?.map(c => c.value) || [],
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
      ],
      borderWidth: 0,
    }]
  };

  // 30-day trend chart
  const trendChartData = {
    labels: trends?.dailyData?.map(d => {
      const date = new Date(d.date);
      return date.getDate();
    }) || [],
    datasets: [{
      label: 'Tasks Completed',
      data: trends?.dailyData?.map(d => d.completed) || [],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        borderRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      }
    },
    cutout: '70%'
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
          <h1 className="header-title">Analytics</h1>
          <p className="header-subtitle">Track your productivity and progress</p>
        </div>
      </header>

      <div className="page-container">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Tasks Completed</div>
              <div className="stat-value">{analytics?.taskStats?.completed || 0}</div>
              <div className="stat-change positive">
                <TrendingUp size={14} />
                of {analytics?.taskStats?.total || 0} total
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Focus Time</div>
              <div className="stat-value">
                {Math.round((analytics?.todayStats?.focusMinutes || 0) / 60 * 10) / 10}h
              </div>
              <div className="stat-change positive">
                <TrendingUp size={14} />
                This week
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Productivity Score</div>
              <div className="stat-value">{analytics?.productivityScore || 0}</div>
              <div className="stat-change positive">
                <TrendingUp size={14} />
                {analytics?.productivityScore >= 80 ? 'Excellent!' : 
                 analytics?.productivityScore >= 60 ? 'Good!' : 'Keep going!'}
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

        {/* Insights */}
        {insights.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title">
                <TrendingUp size={18} style={{ marginRight: '0.5rem' }} />
                Insights & Achievements
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`suggestion-card ${insight.type}`}
                  >
                    <span className="suggestion-icon">{insight.icon}</span>
                    <div className="suggestion-content">
                      <div className="suggestion-title">{insight.title}</div>
                      <div className="suggestion-text">{insight.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Weekly Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <BarChart2 size={18} style={{ marginRight: '0.5rem' }} />
                Weekly Focus Time
              </h3>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <Bar data={weeklyChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <PieChart size={18} style={{ marginRight: '0.5rem' }} />
                Tasks by Category
              </h3>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <Doughnut data={categoryData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Trend */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} style={{ marginRight: '0.5rem' }} />
              30-Day Completion Trend
            </h3>
            {trends?.summary && (
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                <span>
                  <strong>{trends.summary.totalCompleted}</strong> tasks completed
                </span>
                <span>
                  <strong>{trends.summary.avgDaily}</strong> avg/day
                </span>
              </div>
            )}
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '250px' }}>
              <Line data={trendChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Productive Hours */}
        {timeDistribution?.productiveHours && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} style={{ marginRight: '0.5rem' }} />
                Most Productive Hours
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {timeDistribution.productiveHours.map((hour, index) => (
                  <div 
                    key={hour.hour}
                    style={{
                      padding: '1.25rem',
                      background: index === 0 ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--gray-50)',
                      borderRadius: 'var(--radius-lg)',
                      color: index === 0 ? 'white' : 'inherit',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', opacity: index === 0 ? 0.9 : 0.7, marginBottom: '0.25rem' }}>
                      #{index + 1} Peak Hour
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {hour.label}
                    </div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {hour.minutes} minutes focused
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
