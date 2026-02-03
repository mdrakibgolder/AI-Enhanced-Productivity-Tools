// AI Service - Smart productivity algorithms
class AIService {
  constructor() {
    this.motivationalQuotes = [
      "The secret of getting ahead is getting started. - Mark Twain",
      "Focus on being productive instead of busy. - Tim Ferriss",
      "The way to get started is to quit talking and begin doing. - Walt Disney",
      "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Success is not final, failure is not fatal: it is the courage to continue. - Winston Churchill",
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "It does not matter how slowly you go as long as you do not stop. - Confucius"
    ];

    this.productivityTips = [
      "Try the 2-minute rule: If a task takes less than 2 minutes, do it now!",
      "Break large tasks into smaller, manageable chunks",
      "Use time-blocking to dedicate specific hours to deep work",
      "Take regular breaks - your brain needs rest to stay productive",
      "Start with your most challenging task when your energy is highest",
      "Minimize distractions by turning off notifications during focus time",
      "Review your goals at the start of each day",
      "Celebrate small wins to maintain motivation",
      "Use the Pomodoro Technique: 25 minutes focus, 5 minutes break",
      "Keep your workspace clean and organized"
    ];
  }

  // Calculate task priority score
  calculatePriorityScore(task) {
    let score = 0;
    
    // Priority weight
    const priorityWeights = { high: 30, medium: 20, low: 10 };
    score += priorityWeights[task.priority] || 15;
    
    // Deadline urgency
    if (task.dueDate) {
      const daysUntilDue = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 0) score += 40; // Overdue
      else if (daysUntilDue < 1) score += 35;
      else if (daysUntilDue < 3) score += 25;
      else if (daysUntilDue < 7) score += 15;
      else score += 5;
    }
    
    // Estimated time consideration
    if (task.estimatedTime) {
      if (task.estimatedTime <= 30) score += 10; // Quick wins
      else if (task.estimatedTime >= 120) score += 5; // Important but time-consuming
    }
    
    // Category boost for work tasks
    if (task.category === 'work') score += 5;
    
    return Math.min(100, score);
  }

  // Get smart task suggestions
  getTaskSuggestions(tasks) {
    const suggestions = [];
    const now = new Date();
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    
    // Check for overdue tasks
    const overdueTasks = pendingTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now
    );
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Overdue Tasks Alert',
        message: `You have ${overdueTasks.length} overdue task(s). Consider rescheduling or prioritizing them.`,
        action: 'View overdue tasks',
        tasks: overdueTasks.map(t => t.id)
      });
    }
    
    // Find quick wins (tasks under 30 min)
    const quickWins = pendingTasks.filter(t => 
      t.estimatedTime && t.estimatedTime <= 30 && t.status === 'pending'
    );
    if (quickWins.length > 0) {
      suggestions.push({
        type: 'tip',
        icon: '⚡',
        title: 'Quick Wins Available',
        message: `${quickWins.length} task(s) can be completed in 30 minutes or less. Great for building momentum!`,
        action: 'Start a quick task',
        tasks: quickWins.map(t => t.id)
      });
    }
    
    // High priority tasks not started
    const urgentNotStarted = pendingTasks.filter(t => 
      t.priority === 'high' && t.status === 'pending'
    );
    if (urgentNotStarted.length > 0) {
      suggestions.push({
        type: 'priority',
        icon: '🔥',
        title: 'High Priority Tasks Waiting',
        message: `${urgentNotStarted.length} high-priority task(s) haven't been started yet.`,
        action: 'Focus on priorities',
        tasks: urgentNotStarted.map(t => t.id)
      });
    }
    
    // Tasks due today
    const dueToday = pendingTasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due.toDateString() === now.toDateString();
    });
    if (dueToday.length > 0) {
      suggestions.push({
        type: 'info',
        icon: '📅',
        title: 'Due Today',
        message: `${dueToday.length} task(s) are due today. Stay focused!`,
        action: 'View today\'s tasks',
        tasks: dueToday.map(t => t.id)
      });
    }
    
    // Suggest taking a break if many tasks completed
    const recentlyCompleted = tasks.filter(t => {
      if (!t.completedAt) return false;
      const completed = new Date(t.completedAt);
      const hourAgo = new Date(now - 60 * 60 * 1000);
      return completed > hourAgo;
    });
    if (recentlyCompleted.length >= 3) {
      suggestions.push({
        type: 'success',
        icon: '🎉',
        title: 'Great Progress!',
        message: `You've completed ${recentlyCompleted.length} tasks recently. Consider taking a short break!`,
        action: 'Start break timer'
      });
    }
    
    return suggestions;
  }

  // Generate daily plan
  generateDailyPlan(tasks, focusSessions) {
    const now = new Date();
    const pendingTasks = tasks
      .filter(t => t.status !== 'completed')
      .map(t => ({ ...t, priorityScore: this.calculatePriorityScore(t) }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
    
    const plan = {
      greeting: this.getTimeBasedGreeting(),
      quote: this.getRandomQuote(),
      summary: {
        totalPending: pendingTasks.length,
        highPriority: pendingTasks.filter(t => t.priority === 'high').length,
        dueToday: pendingTasks.filter(t => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate).toDateString() === now.toDateString();
        }).length
      },
      recommendedOrder: pendingTasks.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedTime: t.estimatedTime,
        reason: this.getPriorityReason(t)
      })),
      focusBlocks: this.suggestFocusBlocks(pendingTasks),
      tip: this.getRandomTip()
    };
    
    return plan;
  }

  // Get time-based greeting
  getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready to be productive? ☀️";
    if (hour < 17) return "Good afternoon! Keep up the great work! 💪";
    if (hour < 21) return "Good evening! Time to wrap up strong! 🌅";
    return "Working late? Remember to rest well! 🌙";
  }

  // Get random motivational quote
  getRandomQuote() {
    return this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
  }

  // Get random productivity tip
  getRandomTip() {
    return this.productivityTips[Math.floor(Math.random() * this.productivityTips.length)];
  }

  // Get reason for task priority
  getPriorityReason(task) {
    if (task.dueDate) {
      const daysUntil = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) return 'Overdue - needs immediate attention';
      if (daysUntil === 0) return 'Due today';
      if (daysUntil === 1) return 'Due tomorrow';
      if (daysUntil <= 3) return `Due in ${daysUntil} days`;
    }
    if (task.priority === 'high') return 'High priority task';
    if (task.estimatedTime && task.estimatedTime <= 30) return 'Quick win - build momentum';
    return 'Scheduled task';
  }

  // Suggest focus blocks for the day
  suggestFocusBlocks(tasks) {
    const blocks = [];
    let remainingMinutes = 480; // 8 hours
    
    const highPriority = tasks.filter(t => t.priority === 'high').slice(0, 2);
    const mediumPriority = tasks.filter(t => t.priority === 'medium').slice(0, 2);
    
    // Morning block - tackle hard tasks
    if (highPriority.length > 0) {
      blocks.push({
        time: '9:00 AM - 11:00 AM',
        type: 'Deep Work',
        tasks: highPriority.map(t => t.title),
        description: 'Best time for challenging tasks - your energy is highest'
      });
    }
    
    // Mid-day block
    if (mediumPriority.length > 0) {
      blocks.push({
        time: '2:00 PM - 4:00 PM',
        type: 'Focused Work',
        tasks: mediumPriority.map(t => t.title),
        description: 'Good time for important but less demanding tasks'
      });
    }
    
    // Quick tasks block
    blocks.push({
      time: '4:00 PM - 5:00 PM',
      type: 'Quick Tasks',
      tasks: ['Clear inbox', 'Quick responses', 'Small tasks'],
      description: 'End the day with easy wins'
    });
    
    return blocks;
  }

  // Calculate productivity score
  calculateProductivityScore(analytics) {
    let score = 50; // Base score
    
    // Focus time bonus (max 20 points)
    const focusBonus = Math.min(20, (analytics.totalFocusTime / 60) * 2);
    score += focusBonus;
    
    // Task completion bonus (max 20 points)
    const taskBonus = Math.min(20, analytics.tasksCompleted * 2);
    score += taskBonus;
    
    // Streak bonus (max 10 points)
    const streakBonus = Math.min(10, analytics.currentStreak);
    score += streakBonus;
    
    return Math.round(Math.min(100, score));
  }

  // Get productivity insights
  getProductivityInsights(analytics, tasks) {
    const insights = [];
    
    // Streak insight
    if (analytics.currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        icon: '🔥',
        title: 'Amazing Streak!',
        message: `You're on a ${analytics.currentStreak}-day streak! Keep it going!`
      });
    } else if (analytics.currentStreak >= 3) {
      insights.push({
        type: 'progress',
        icon: '📈',
        title: 'Building Momentum',
        message: `${analytics.currentStreak} days in a row! You're building great habits.`
      });
    }
    
    // Focus time insight
    if (analytics.totalFocusTime >= 120) {
      insights.push({
        type: 'success',
        icon: '🎯',
        title: 'Deep Focus Achieved',
        message: `${Math.round(analytics.totalFocusTime / 60)} hours of focused work this week!`
      });
    }
    
    // Task completion rate
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    if (completionRate >= 80) {
      insights.push({
        type: 'success',
        icon: '⭐',
        title: 'High Achiever!',
        message: `${Math.round(completionRate)}% task completion rate. Outstanding!`
      });
    } else if (completionRate >= 50) {
      insights.push({
        type: 'info',
        icon: '💪',
        title: 'Good Progress',
        message: `${Math.round(completionRate)}% completion rate. Keep pushing!`
      });
    }
    
    return insights;
  }

  // Smart search in notes
  smartSearchNotes(notes, query) {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(k => k.length > 2);
    
    return notes
      .map(note => {
        let relevanceScore = 0;
        const titleLower = note.title.toLowerCase();
        const contentLower = note.content.toLowerCase();
        
        // Title match (higher weight)
        if (titleLower.includes(queryLower)) relevanceScore += 50;
        keywords.forEach(kw => {
          if (titleLower.includes(kw)) relevanceScore += 20;
        });
        
        // Content match
        if (contentLower.includes(queryLower)) relevanceScore += 30;
        keywords.forEach(kw => {
          if (contentLower.includes(kw)) relevanceScore += 10;
        });
        
        // Tag match
        note.tags.forEach(tag => {
          if (tag.toLowerCase().includes(queryLower)) relevanceScore += 25;
          keywords.forEach(kw => {
            if (tag.toLowerCase().includes(kw)) relevanceScore += 15;
          });
        });
        
        return { ...note, relevanceScore };
      })
      .filter(note => note.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Auto-categorize task
  suggestCategory(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();
    
    const categoryKeywords = {
      work: ['meeting', 'project', 'client', 'deadline', 'report', 'presentation', 'email', 'call', 'review', 'proposal'],
      personal: ['doctor', 'dentist', 'gym', 'shopping', 'family', 'friends', 'birthday', 'appointment', 'home'],
      learning: ['learn', 'study', 'course', 'tutorial', 'read', 'book', 'practice', 'skill', 'training'],
      health: ['exercise', 'workout', 'meditation', 'sleep', 'diet', 'health', 'fitness', 'run', 'yoga'],
      finance: ['budget', 'payment', 'bill', 'tax', 'invest', 'savings', 'expense', 'bank', 'money']
    };
    
    let bestCategory = 'other';
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(kw => text.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }

  // Suggest tags for a task
  suggestTags(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();
    const suggestedTags = [];
    
    const tagPatterns = {
      'urgent': ['urgent', 'asap', 'immediately', 'critical'],
      'meeting': ['meeting', 'call', 'discussion', 'sync'],
      'review': ['review', 'check', 'approve', 'feedback'],
      'creative': ['design', 'create', 'write', 'develop'],
      'admin': ['schedule', 'organize', 'file', 'update'],
      'research': ['research', 'analyze', 'study', 'investigate']
    };
    
    for (const [tag, patterns] of Object.entries(tagPatterns)) {
      if (patterns.some(p => text.includes(p))) {
        suggestedTags.push(tag);
      }
    }
    
    return suggestedTags.slice(0, 3);
  }

  // Estimate task duration
  estimateTaskDuration(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();
    
    // Quick tasks (15-30 min)
    const quickPatterns = ['email', 'call', 'reply', 'quick', 'check', 'review briefly'];
    if (quickPatterns.some(p => text.includes(p))) {
      return 15;
    }
    
    // Medium tasks (30-60 min)
    const mediumPatterns = ['write', 'prepare', 'organize', 'update', 'create draft'];
    if (mediumPatterns.some(p => text.includes(p))) {
      return 45;
    }
    
    // Long tasks (1-2 hours)
    const longPatterns = ['meeting', 'presentation', 'report', 'analysis', 'project'];
    if (longPatterns.some(p => text.includes(p))) {
      return 90;
    }
    
    // Very long tasks (2+ hours)
    const veryLongPatterns = ['complete', 'finish', 'develop', 'implement', 'design'];
    if (veryLongPatterns.some(p => text.includes(p))) {
      return 120;
    }
    
    return 30; // Default
  }
}

module.exports = new AIService();
