const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../data/store');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all tasks
router.get('/', (req, res) => {
  const userId = req.userId;
  const { status, priority, category, search } = req.query;
  
  let tasks = dataStore.tasks.filter(t => t.userId === userId);
  
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  if (priority) {
    tasks = tasks.filter(t => t.priority === priority);
  }
  if (category) {
    tasks = tasks.filter(t => t.category === category);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // Add AI priority scores
  tasks = tasks.map(task => ({
    ...task,
    priorityScore: aiService.calculatePriorityScore(task)
  }));
  
  // Sort by priority score
  tasks.sort((a, b) => b.priorityScore - a.priorityScore);
  
  res.json(tasks);
});

// Get single task
router.get('/:id', (req, res) => {
  const task = dataStore.tasks.find(t => t.id === req.params.id && t.userId === req.userId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json({
    ...task,
    priorityScore: aiService.calculatePriorityScore(task)
  });
});

// Create task
router.post('/', (req, res) => {
  const { title, description, priority, category, dueDate, estimatedTime, tags, subtasks } = req.body;
  
  // AI suggestions
  const suggestedCategory = category || aiService.suggestCategory(title, description);
  const suggestedTags = tags && tags.length > 0 ? tags : aiService.suggestTags(title, description);
  const suggestedTime = estimatedTime || aiService.estimateTaskDuration(title, description);
  
  const newTask = {
    id: uuidv4(),
    userId: req.userId,
    title,
    description: description || '',
    priority: priority || 'medium',
    status: 'pending',
    category: suggestedCategory,
    dueDate: dueDate || null,
    estimatedTime: suggestedTime,
    actualTime: 0,
    tags: suggestedTags,
    subtasks: (subtasks || []).map(st => ({
      id: uuidv4(),
      title: st.title || st,
      completed: false
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.tasks.push(newTask);
  
  res.status(201).json({
    ...newTask,
    priorityScore: aiService.calculatePriorityScore(newTask),
    aiSuggestions: {
      category: suggestedCategory !== category ? suggestedCategory : null,
      tags: suggestedTags,
      estimatedTime: suggestedTime
    }
  });
});

// Update task
router.put('/:id', (req, res) => {
  const taskIndex = dataStore.tasks.findIndex(t => t.id === req.params.id && t.userId === req.userId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const task = dataStore.tasks[taskIndex];
  const updates = req.body;
  
  // Handle status change to completed
  if (updates.status === 'completed' && task.status !== 'completed') {
    updates.completedAt = new Date().toISOString();
    
    // Update analytics
    if (dataStore.analytics[req.userId]) {
      dataStore.analytics[req.userId].tasksCompleted++;
    }
  }
  
  dataStore.tasks[taskIndex] = {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    ...dataStore.tasks[taskIndex],
    priorityScore: aiService.calculatePriorityScore(dataStore.tasks[taskIndex])
  });
});

// Delete task
router.delete('/:id', (req, res) => {
  const taskIndex = dataStore.tasks.findIndex(t => t.id === req.params.id && t.userId === req.userId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  dataStore.tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

// Update subtask
router.patch('/:id/subtasks/:subtaskId', (req, res) => {
  const task = dataStore.tasks.find(t => t.id === req.params.id && t.userId === req.userId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const subtask = task.subtasks.find(st => st.id === req.params.subtaskId);
  if (!subtask) {
    return res.status(404).json({ error: 'Subtask not found' });
  }
  
  Object.assign(subtask, req.body);
  task.updatedAt = new Date().toISOString();
  
  res.json(task);
});

// Add subtask
router.post('/:id/subtasks', (req, res) => {
  const task = dataStore.tasks.find(t => t.id === req.params.id && t.userId === req.userId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const newSubtask = {
    id: uuidv4(),
    title: req.body.title,
    completed: false
  };
  
  task.subtasks.push(newSubtask);
  task.updatedAt = new Date().toISOString();
  
  res.status(201).json(task);
});

module.exports = router;
