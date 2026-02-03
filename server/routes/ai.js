const express = require('express');
const router = express.Router();
const dataStore = require('../data/store');
const aiService = require('../services/aiService');
const deepseekService = require('../services/deepseekService');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get AI suggestions for tasks
router.get('/suggestions', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId);
  
  const suggestions = aiService.getTaskSuggestions(tasks);
  
  res.json(suggestions);
});

// Get daily plan
router.get('/daily-plan', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId);
  const sessions = dataStore.timerSessions.filter(s => s.userId === userId);
  
  const plan = aiService.generateDailyPlan(tasks, sessions);
  
  res.json(plan);
});

// Get smart task recommendations
router.get('/task-recommendations', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId && t.status !== 'completed');
  
  // Calculate scores and sort
  const scoredTasks = tasks.map(task => ({
    ...task,
    priorityScore: aiService.calculatePriorityScore(task),
    reason: aiService.getPriorityReason(task)
  }));
  
  scoredTasks.sort((a, b) => b.priorityScore - a.priorityScore);
  
  res.json({
    nextTask: scoredTasks[0] || null,
    topTasks: scoredTasks.slice(0, 5),
    quickWins: scoredTasks.filter(t => t.estimatedTime && t.estimatedTime <= 30).slice(0, 3)
  });
});

// Analyze task and get suggestions
router.post('/analyze-task', (req, res) => {
  const { title, description } = req.body;
  
  const category = aiService.suggestCategory(title, description);
  const tags = aiService.suggestTags(title, description);
  const estimatedTime = aiService.estimateTaskDuration(title, description);
  
  res.json({
    suggestedCategory: category,
    suggestedTags: tags,
    estimatedTime,
    priority: estimatedTime > 60 ? 'high' : estimatedTime > 30 ? 'medium' : 'low'
  });
});

// Get productivity tips
router.get('/tips', (req, res) => {
  const tips = [
    aiService.getRandomTip(),
    aiService.getRandomTip(),
    aiService.getRandomTip()
  ];
  
  // Remove duplicates
  const uniqueTips = [...new Set(tips)];
  
  res.json({
    tips: uniqueTips,
    quote: aiService.getRandomQuote()
  });
});

// Get focus mode suggestions
router.get('/focus-suggestions', (req, res) => {
  const userId = req.userId;
  const tasks = dataStore.tasks.filter(t => t.userId === userId && t.status !== 'completed');
  
  const suggestions = {
    recommendedTask: null,
    sessionLength: 25,
    tips: []
  };
  
  // Find best task for focus session
  const scoredTasks = tasks.map(task => ({
    ...task,
    priorityScore: aiService.calculatePriorityScore(task)
  })).sort((a, b) => b.priorityScore - a.priorityScore);
  
  if (scoredTasks.length > 0) {
    suggestions.recommendedTask = {
      id: scoredTasks[0].id,
      title: scoredTasks[0].title,
      estimatedTime: scoredTasks[0].estimatedTime,
      reason: 'Highest priority based on deadline and importance'
    };
    
    // Suggest session length based on task
    if (scoredTasks[0].estimatedTime && scoredTasks[0].estimatedTime <= 25) {
      suggestions.sessionLength = scoredTasks[0].estimatedTime;
    } else if (scoredTasks[0].estimatedTime && scoredTasks[0].estimatedTime > 50) {
      suggestions.sessionLength = 50; // Longer focus session for big tasks
    }
  }
  
  suggestions.tips = [
    'Put your phone on silent or in another room',
    'Close unnecessary browser tabs and apps',
    'Have water nearby to stay hydrated',
    'Set a clear intention for what you\'ll accomplish'
  ];
  
  res.json(suggestions);
});

// Get motivational content
router.get('/motivation', (req, res) => {
  const userId = req.userId;
  const analytics = dataStore.analytics[userId] || {};
  const tasks = dataStore.tasks.filter(t => t.userId === userId);
  
  const completedToday = tasks.filter(t => 
    t.completedAt && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;
  
  let message = '';
  let emoji = '';
  
  if (completedToday >= 5) {
    message = "You're on fire today! Amazing productivity!";
    emoji = '🔥';
  } else if (completedToday >= 3) {
    message = "Great progress! Keep up the momentum!";
    emoji = '💪';
  } else if (completedToday >= 1) {
    message = "Good start! Every task counts!";
    emoji = '👍';
  } else {
    message = "Ready to start? Let's make today productive!";
    emoji = '🚀';
  }
  
  res.json({
    message,
    emoji,
    quote: aiService.getRandomQuote(),
    streak: analytics.currentStreak || 0,
    tasksCompletedToday: completedToday
  });
});

// ========== DEEPSEEK AI POWERED ENDPOINTS ==========

// AI Chat - Productivity Coach
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;
    const tasks = dataStore.tasks.filter(t => t.userId === userId);
    const analytics = dataStore.analytics[userId] || {};
    
    const context = {
      pendingTasks: tasks.filter(t => t.status !== 'completed').length,
      completedToday: tasks.filter(t => 
        t.completedAt && 
        new Date(t.completedAt).toDateString() === new Date().toDateString()
      ).length,
      streak: analytics.currentStreak || 0,
      productivityScore: analytics.productivityScore || 50
    };
    
    const response = await deepseekService.productivityChat(message, context);
    
    res.json({ 
      message: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// AI Smart Suggestions (Enhanced with DeepSeek)
router.get('/smart-suggestions', async (req, res) => {
  try {
    const userId = req.userId;
    const tasks = dataStore.tasks.filter(t => t.userId === userId);
    const analytics = dataStore.analytics[userId] || {};
    
    const today = new Date().toDateString();
    const tasksCompletedToday = tasks.filter(t => 
      t.completedAt && new Date(t.completedAt).toDateString() === today
    ).length;
    
    const enhancedAnalytics = {
      ...analytics,
      productivityScore: analytics.productivityScore || aiService.calculateProductivityScore(analytics),
      streak: analytics.currentStreak || 0,
      tasksCompletedToday
    };
    
    // Try AI-powered suggestions first
    const aiSuggestions = await deepseekService.getSmartSuggestions(tasks, enhancedAnalytics);
    
    if (aiSuggestions) {
      res.json(aiSuggestions);
    } else {
      // Fallback to rule-based suggestions
      const fallbackSuggestions = aiService.getTaskSuggestions(tasks);
      res.json({
        suggestions: fallbackSuggestions,
        nextBestAction: fallbackSuggestions[0]?.message || 'Start with your highest priority task',
        focusRecommendation: '25-minute focus session recommended'
      });
    }
  } catch (error) {
    console.error('Smart suggestions error:', error);
    const userId = req.userId;
    const tasks = dataStore.tasks.filter(t => t.userId === userId);
    res.json({
      suggestions: aiService.getTaskSuggestions(tasks),
      nextBestAction: 'Start with your highest priority task',
      focusRecommendation: '25-minute focus session recommended'
    });
  }
});

// AI Daily Plan (Enhanced with DeepSeek)
router.get('/smart-daily-plan', async (req, res) => {
  try {
    const userId = req.userId;
    const tasks = dataStore.tasks.filter(t => t.userId === userId && t.status !== 'completed');
    const allTasks = dataStore.tasks.filter(t => t.userId === userId);
    
    const today = new Date().toDateString();
    const completedToday = allTasks.filter(t => 
      t.completedAt && new Date(t.completedAt).toDateString() === today
    ).length;
    
    const sessions = dataStore.timerSessions.filter(s => 
      s.userId === userId && 
      s.type === 'focus' &&
      new Date(s.completedAt).toDateString() === today
    );
    const focusMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Try AI-powered daily plan
    const aiPlan = await deepseekService.generateDailyPlan(tasks, completedToday, focusMinutes);
    
    if (aiPlan) {
      res.json({
        ...aiPlan,
        isAIPowered: true,
        stats: {
          pendingTasks: tasks.length,
          completedToday,
          focusMinutes
        }
      });
    } else {
      // Fallback to rule-based plan
      const fallbackPlan = aiService.generateDailyPlan(tasks, []);
      res.json({
        ...fallbackPlan,
        isAIPowered: false
      });
    }
  } catch (error) {
    console.error('Smart daily plan error:', error);
    const userId = req.userId;
    const tasks = dataStore.tasks.filter(t => t.userId === userId);
    res.json(aiService.generateDailyPlan(tasks, []));
  }
});

// AI Task Analysis
router.post('/analyze-task-ai', async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    
    const task = { title, description, priority, dueDate };
    const aiAnalysis = await deepseekService.analyzeTask(task);
    
    if (aiAnalysis) {
      res.json({
        ...aiAnalysis,
        isAIPowered: true
      });
    } else {
      // Fallback to rule-based analysis
      res.json({
        suggestedCategory: aiService.suggestCategory(title, description),
        suggestedTags: aiService.suggestTags(title, description),
        estimatedMinutes: aiService.estimateTaskDuration(title, description),
        priorityScore: 50,
        tips: 'Break this task into smaller steps for easier completion.',
        breakdownSteps: ['Plan the approach', 'Execute the main work', 'Review and finalize'],
        isAIPowered: false
      });
    }
  } catch (error) {
    console.error('AI task analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze task' });
  }
});

// Parse Natural Language Task
router.post('/parse-task', async (req, res) => {
  try {
    const { input } = req.body;
    
    if (!input || input.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a task description' });
    }
    
    const parsedTask = await deepseekService.parseNaturalLanguageTask(input);
    
    if (parsedTask) {
      res.json({
        ...parsedTask,
        isAIPowered: true,
        originalInput: input
      });
    } else {
      // Fallback - just use the input as title
      res.json({
        title: input,
        description: '',
        priority: 'medium',
        category: aiService.suggestCategory(input, ''),
        dueDate: null,
        estimatedTime: 30,
        tags: aiService.suggestTags(input, ''),
        isAIPowered: false,
        originalInput: input
      });
    }
  } catch (error) {
    console.error('Parse task error:', error);
    res.status(500).json({ error: 'Failed to parse task' });
  }
});

// AI Note Summary
router.post('/summarize-note', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: 'Note content too short to summarize' });
    }
    
    const summary = await deepseekService.summarizeNote(content);
    
    if (summary) {
      res.json({
        ...summary,
        isAIPowered: true
      });
    } else {
      res.json({
        summary: content.substring(0, 200) + '...',
        keyPoints: ['Note content available'],
        suggestedTags: [],
        isAIPowered: false
      });
    }
  } catch (error) {
    console.error('Summarize note error:', error);
    res.status(500).json({ error: 'Failed to summarize note' });
  }
});

// AI Productivity Insights
router.get('/ai-insights', async (req, res) => {
  try {
    const userId = req.userId;
    const tasks = dataStore.tasks.filter(t => t.userId === userId);
    const analytics = dataStore.analytics[userId] || {};
    const sessions = dataStore.timerSessions.filter(s => s.userId === userId);
    
    // Calculate weekly data
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toDateString();
      
      const daySessions = sessions.filter(s => 
        s.type === 'focus' && new Date(s.completedAt).toDateString() === dateStr
      );
      const dayTasks = tasks.filter(t => 
        t.completedAt && new Date(t.completedAt).toDateString() === dateStr
      );
      
      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        focusMinutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        tasksCompleted: dayTasks.length
      });
    }
    
    const totalFocusMinutes = sessions
      .filter(s => new Date(s.completedAt) >= weekAgo)
      .reduce((sum, s) => sum + s.duration, 0);
    
    const enhancedAnalytics = {
      weeklyData,
      tasksCompleted: tasks.filter(t => t.status === 'completed').length,
      productivityScore: analytics.productivityScore || 50,
      streak: analytics.currentStreak || 0,
      totalFocusMinutes,
      categoryDistribution: analytics.categoryDistribution || []
    };
    
    const aiInsights = await deepseekService.generateInsights(enhancedAnalytics, tasks);
    
    if (aiInsights) {
      res.json({
        ...aiInsights,
        isAIPowered: true
      });
    } else {
      res.json({
        insights: aiService.getProductivityInsights(analytics, tasks),
        overallAssessment: 'Keep up the good work!',
        weeklyGoal: 'Try to complete at least 5 tasks this week',
        isAIPowered: false
      });
    }
  } catch (error) {
    console.error('AI insights error:', error);
    const userId = req.userId;
    const analytics = dataStore.analytics[userId] || {};
    const tasks = dataStore.tasks.filter(t => t.userId === userId);
    res.json({
      insights: aiService.getProductivityInsights(analytics, tasks),
      overallAssessment: 'Keep working on your goals!',
      weeklyGoal: 'Stay consistent with your productivity habits',
      isAIPowered: false
    });
  }
});

module.exports = router;
