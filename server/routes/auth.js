const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dataStore = require('../data/store');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = dataStore.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo, accept any password or check bcrypt
    const isValidPassword = password === 'demo123' || await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = dataStore.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      avatar: null,
      settings: {
        theme: 'light',
        focusDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        dailyGoal: 8,
        notifications: true
      },
      createdAt: new Date().toISOString()
    };
    
    dataStore.users.push(newUser);
    dataStore.analytics[newUser.id] = {
      totalFocusTime: 0,
      tasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      productivityScore: 50,
      weeklyData: []
    };
    
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        settings: newUser.settings
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  const userId = req.userId || 'user-1';
  const user = dataStore.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    settings: user.settings
  });
});

// Update settings
router.put('/settings', (req, res) => {
  const userId = req.userId || 'user-1';
  const user = dataStore.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  user.settings = { ...user.settings, ...req.body };
  res.json({ settings: user.settings });
});

module.exports = router;
