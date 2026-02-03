const express = require('express');
const router = express.Router();
const dataStore = require('../data/store');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get dashboard analytics
router.get('/dashboard', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId);
  const sessions = dataStore.timerSessions.filter(s => s.userId === userId);
  const analytics = dataStore.analytics[userId] || {};
  
  const now = new Date();
  const today = now.toDateString();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  
  // Task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length
  };
  
  // Today's stats
  const todaySessions = sessions.filter(s => 
    s.type === 'focus' && 
    new Date(s.completedAt).toDateString() === today
  );
  
  const todayStats = {
    focusSessions: todaySessions.length,
    focusMinutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
    tasksCompleted: tasks.filter(t => 
      t.completedAt && 
      new Date(t.completedAt).toDateString() === today
    ).length
  };
  
  // Weekly data
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toDateString();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const daySessions = sessions.filter(s => 
      s.type === 'focus' && 
      new Date(s.completedAt).toDateString() === dateStr
    );
    
    const dayTasks = tasks.filter(t => 
      t.completedAt && 
      new Date(t.completedAt).toDateString() === dateStr
    );
    
    weeklyData.push({
      day: dayName,
      date: date.toISOString().split('T')[0],
      focusMinutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
      tasksCompleted: dayTasks.length
    });
  }
  
  // Calculate productivity score
  const productivityScore = aiService.calculateProductivityScore({
    totalFocusTime: todayStats.focusMinutes,
    tasksCompleted: todayStats.tasksCompleted,
    currentStreak: analytics.currentStreak || 0
  });
  
  // Category distribution
  const categoryData = {};
  tasks.forEach(t => {
    categoryData[t.category] = (categoryData[t.category] || 0) + 1;
  });
  
  res.json({
    taskStats,
    todayStats,
    weeklyData,
    productivityScore,
    categoryDistribution: Object.entries(categoryData).map(([name, value]) => ({
      name,
      value
    })),
    streak: analytics.currentStreak || 0,
    longestStreak: analytics.longestStreak || 0
  });
});

// Get productivity insights
router.get('/insights', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId);
  const analytics = dataStore.analytics[userId] || {};
  
  const insights = aiService.getProductivityInsights(analytics, tasks);
  
  res.json(insights);
});

// Get time distribution
router.get('/time-distribution', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId);
  const sessions = dataStore.timerSessions.filter(s => s.userId === userId);
  
  // By category
  const categoryTime = {};
  tasks.forEach(t => {
    if (t.actualTime > 0) {
      categoryTime[t.category] = (categoryTime[t.category] || 0) + t.actualTime;
    }
  });
  
  // By hour of day
  const hourlyDistribution = Array(24).fill(0);
  sessions.forEach(s => {
    const hour = new Date(s.completedAt).getHours();
    hourlyDistribution[hour] += s.duration;
  });
  
  // Most productive hours
  const productiveHours = hourlyDistribution
    .map((minutes, hour) => ({ hour, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3)
    .map(h => ({
      hour: h.hour,
      label: `${h.hour}:00 - ${h.hour + 1}:00`,
      minutes: h.minutes
    }));
  
  res.json({
    byCategory: Object.entries(categoryTime).map(([category, minutes]) => ({
      category,
      minutes,
      hours: Math.round(minutes / 60 * 10) / 10
    })),
    hourlyDistribution: hourlyDistribution.map((minutes, hour) => ({
      hour,
      minutes
    })),
    productiveHours
  });
});

// Get completion trends
router.get('/trends', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId);
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  
  // Daily completion for last 30 days
  const dailyData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toDateString();
    
    const completed = tasks.filter(t => 
      t.completedAt && 
      new Date(t.completedAt).toDateString() === dateStr
    ).length;
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      completed
    });
  }
  
  // Calculate averages
  const totalCompleted = dailyData.reduce((sum, d) => sum + d.completed, 0);
  const avgDaily = Math.round(totalCompleted / 30 * 10) / 10;
  
  // Best day
  const bestDay = [...dailyData].sort((a, b) => b.completed - a.completed)[0];
  
  res.json({
    dailyData,
    summary: {
      totalCompleted,
      avgDaily,
      bestDay: bestDay ? {
        date: bestDay.date,
        completed: bestDay.completed
      } : null
    }
  });
});

module.exports = router;
