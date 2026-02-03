const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../data/store');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all notes
router.get('/', (req, res) => {
  const userId = req.userId;
  const { category, search, tag } = req.query;
  
  let notes = dataStore.notes.filter(n => n.userId === userId);
  
  if (category) {
    notes = notes.filter(n => n.category === category);
  }
  if (tag) {
    notes = notes.filter(n => n.tags.includes(tag));
  }
  if (search) {
    notes = aiService.smartSearchNotes(notes, search);
  }
  
  // Sort: pinned first, then by updated date
  notes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
  
  res.json(notes);
});

// Get single note
router.get('/:id', (req, res) => {
  const note = dataStore.notes.find(n => n.id === req.params.id && n.userId === req.userId);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  res.json(note);
});

// Create note
router.post('/', (req, res) => {
  const { title, content, category, tags, color, isPinned } = req.body;
  
  const newNote = {
    id: uuidv4(),
    userId: req.userId,
    title: title || 'Untitled Note',
    content: content || '',
    category: category || 'general',
    tags: tags || [],
    isPinned: isPinned || false,
    color: color || '#3B82F6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  dataStore.notes.push(newNote);
  
  res.status(201).json(newNote);
});

// Update note
router.put('/:id', (req, res) => {
  const noteIndex = dataStore.notes.findIndex(n => n.id === req.params.id && n.userId === req.userId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  dataStore.notes[noteIndex] = {
    ...dataStore.notes[noteIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(dataStore.notes[noteIndex]);
});

// Delete note
router.delete('/:id', (req, res) => {
  const noteIndex = dataStore.notes.findIndex(n => n.id === req.params.id && n.userId === req.userId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  dataStore.notes.splice(noteIndex, 1);
  res.json({ message: 'Note deleted successfully' });
});

// Toggle pin
router.patch('/:id/pin', (req, res) => {
  const note = dataStore.notes.find(n => n.id === req.params.id && n.userId === req.userId);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  note.isPinned = !note.isPinned;
  note.updatedAt = new Date().toISOString();
  
  res.json(note);
});

// Get all tags
router.get('/meta/tags', (req, res) => {
  const userId = req.userId;
  const notes = dataStore.notes.filter(n => n.userId === userId);
  
  const tagCounts = {};
  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  const tags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  res.json(tags);
});

module.exports = router;
