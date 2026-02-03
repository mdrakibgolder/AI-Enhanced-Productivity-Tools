const { v4: uuidv4 } = require('uuid');

// In-memory data store (replace with database in production)
const dataStore = {
  users: [
    {
      id: 'user-1',
      email: 'demo@productivity.ai',
      password: '$2a$10$XQxBtVbKzMnP4xZoQfNZXeFJQzYFKPvQjRcqWGAQ5VqZnB5JvvJKe', // "demo123"
      name: 'Demo User',
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
    }
  ],
  
  tasks: [
    {
      id: uuidv4(),
      userId: 'user-1',
      title: 'Complete project proposal',
      description: 'Write and submit the Q1 project proposal document',
      priority: 'high',
      status: 'in-progress',
      category: 'work',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 120,
      actualTime: 45,
      tags: ['proposal', 'Q1', 'important'],
      subtasks: [
        { id: uuidv4(), title: 'Research market data', completed: true },
        { id: uuidv4(), title: 'Draft outline', completed: true },
        { id: uuidv4(), title: 'Write content', completed: false },
        { id: uuidv4(), title: 'Review and edit', completed: false }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      title: 'Review team performance',
      description: 'Analyze and document team KPIs for monthly review',
      priority: 'medium',
      status: 'pending',
      category: 'work',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 60,
      actualTime: 0,
      tags: ['team', 'review', 'monthly'],
      subtasks: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      title: 'Learn React hooks',
      description: 'Complete tutorial on advanced React hooks patterns',
      priority: 'low',
      status: 'pending',
      category: 'learning',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 180,
      actualTime: 0,
      tags: ['react', 'learning', 'development'],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      title: 'Schedule dentist appointment',
      description: 'Call and book annual dental checkup',
      priority: 'medium',
      status: 'completed',
      category: 'personal',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 15,
      actualTime: 10,
      tags: ['health', 'personal'],
      subtasks: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  notes: [
    {
      id: uuidv4(),
      userId: 'user-1',
      title: 'Meeting Notes - Project Kickoff',
      content: '# Project Kickoff Meeting\n\n## Attendees\n- John Smith (PM)\n- Sarah Johnson (Dev Lead)\n- Mike Brown (Designer)\n\n## Key Points\n1. Project deadline: March 15th\n2. Weekly standups on Mondays\n3. Use Slack for communication\n\n## Action Items\n- [ ] Set up development environment\n- [ ] Create initial wireframes\n- [ ] Define API specifications',
      category: 'work',
      tags: ['meeting', 'project', 'kickoff'],
      isPinned: true,
      color: '#3B82F6',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      title: 'Book Recommendations',
      content: '# Books to Read\n\n## Currently Reading\n- Atomic Habits by James Clear\n\n## Up Next\n- Deep Work by Cal Newport\n- The Pragmatic Programmer\n- Clean Code by Robert Martin\n\n## Completed\n- ✅ The Lean Startup\n- ✅ Zero to One',
      category: 'personal',
      tags: ['books', 'reading', 'self-improvement'],
      isPinned: false,
      color: '#10B981',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      title: 'API Design Best Practices',
      content: '# REST API Best Practices\n\n## Naming Conventions\n- Use nouns for resources\n- Use plural names\n- Use kebab-case\n\n## HTTP Methods\n- GET: Retrieve\n- POST: Create\n- PUT: Update (full)\n- PATCH: Update (partial)\n- DELETE: Remove\n\n## Status Codes\n- 200: Success\n- 201: Created\n- 400: Bad Request\n- 401: Unauthorized\n- 404: Not Found\n- 500: Server Error',
      category: 'learning',
      tags: ['api', 'development', 'best-practices'],
      isPinned: false,
      color: '#8B5CF6',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  timerSessions: [
    {
      id: uuidv4(),
      userId: 'user-1',
      type: 'focus',
      duration: 25,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      taskId: null,
      notes: 'Worked on project proposal'
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      type: 'focus',
      duration: 25,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      taskId: null,
      notes: 'Code review'
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      type: 'focus',
      duration: 25,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      taskId: null,
      notes: 'Documentation'
    },
    {
      id: uuidv4(),
      userId: 'user-1',
      type: 'focus',
      duration: 25,
      completedAt: new Date().toISOString(),
      taskId: null,
      notes: 'Morning focus session'
    }
  ],
  
  analytics: {
    'user-1': {
      totalFocusTime: 450,
      tasksCompleted: 12,
      currentStreak: 5,
      longestStreak: 14,
      productivityScore: 78,
      weeklyData: [
        { day: 'Mon', focusMinutes: 120, tasksCompleted: 3 },
        { day: 'Tue', focusMinutes: 90, tasksCompleted: 2 },
        { day: 'Wed', focusMinutes: 150, tasksCompleted: 4 },
        { day: 'Thu', focusMinutes: 60, tasksCompleted: 1 },
        { day: 'Fri', focusMinutes: 30, tasksCompleted: 2 },
        { day: 'Sat', focusMinutes: 0, tasksCompleted: 0 },
        { day: 'Sun', focusMinutes: 0, tasksCompleted: 0 }
      ]
    }
  }
};

module.exports = dataStore;
