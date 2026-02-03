const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../data/store');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get timer settings
router.get('/settings', (req, res) => {
  const user = dataStore.users.find(u => u.id === req.userId);
  
  res.json({
    focusDuration: user?.settings?.focusDuration || 25,
    shortBreak: user?.settings?.shortBreak || 5,
    longBreak: user?.settings?.longBreak || 15,
    sessionsBeforeLongBreak: 4
  });
});

// Update timer settings
router.put('/settings', (req, res) => {
  const user = dataStore.users.find(u => u.id === req.userId);
  
  if (user) {
    user.settings = {
      ...user.settings,
      ...req.body
    };
  }
  
  res.json({
    focusDuration: user?.settings?.focusDuration || 25,
    shortBreak: user?.settings?.shortBreak || 5,
    longBreak: user?.settings?.longBreak || 15
  });
});

// Get timer sessions
router.get('/sessions', (req, res) => {
  const sessions = dataStore.timerSessions.filter(s => s.userId === req.userId);
  
  // Sort by completed date, most recent first
  sessions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  
  res.json(sessions);
});

// Get today's sessions
router.get('/sessions/today', (req, res) => {
  const today = new Date().toDateString();
  const sessions = dataStore.timerSessions.filter(s => 
    s.userId === req.userId && 
    new Date(s.completedAt).toDateString() === today
  );
  
  const totalFocusMinutes = sessions
    .filter(s => s.type === 'focus')
    .reduce((sum, s) => sum + s.duration, 0);
  
  res.json({
    sessions,
    totalSessions: sessions.filter(s => s.type === 'focus').length,
    totalFocusMinutes
  });
});

// Complete a session
router.post('/sessions', (req, res) => {
  const { type, duration, taskId, notes } = req.body;
  
  const session = {
    id: uuidv4(),
    userId: req.userId,
    type: type || 'focus',
    duration: duration || 25,
    completedAt: new Date().toISOString(),
    taskId: taskId || null,
    notes: notes || ''
  };
  
  dataStore.timerSessions.push(session);
  
  // Update analytics
  if (type === 'focus' && dataStore.analytics[req.userId]) {
    dataStore.analytics[req.userId].totalFocusTime += duration;
  }
  
  // Update task actual time if linked
  if (taskId) {
    const task = dataStore.tasks.find(t => t.id === taskId);
    if (task) {
      task.actualTime = (task.actualTime || 0) + duration;
    }
  }
  
  res.status(201).json(session);
});

// Get session statistics
router.get('/stats', (req, res) => {
  const sessions = dataStore.timerSessions.filter(s => s.userId === req.userId);
  const focusSessions = sessions.filter(s => s.type === 'focus');
  
  // Today's stats
  const today = new Date().toDateString();
  const todaySessions = focusSessions.filter(s => 
    new Date(s.completedAt).toDateString() === today
  );
  
  // This week's stats
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = focusSessions.filter(s => 
    new Date(s.completedAt) >= weekAgo
  );
  
  // Calculate streak
  let streak = 0;
  const dates = [...new Set(focusSessions.map(s => 
    new Date(s.completedAt).toDateString()
  ))].sort((a, b) => new Date(b) - new Date(a));
  
  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
    if (dates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }
  
  res.json({
    today: {
      sessions: todaySessions.length,
      minutes: todaySessions.reduce((sum, s) => sum + s.duration, 0)
    },
    week: {
      sessions: weekSessions.length,
      minutes: weekSessions.reduce((sum, s) => sum + s.duration, 0)
    },
    total: {
      sessions: focusSessions.length,
      minutes: focusSessions.reduce((sum, s) => sum + s.duration, 0)
    },
    streak
  });
});

module.exports = router;
