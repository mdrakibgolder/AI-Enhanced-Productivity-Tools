import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit2, 
  Menu,
  X,
  FileText,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const noteColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16'
];

function Notes({ onMenuClick }) {
  const { notes, refreshNotes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    color: '#3B82F6'
  });

  const categories = ['all', 'general', 'work', 'personal', 'learning', 'ideas'];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const noteData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, noteData);
        toast.success('Note updated successfully!');
      } else {
        await api.post('/notes', noteData);
        toast.success('Note created successfully!');
      }
      
      refreshNotes();
      closeModal();
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleTogglePin = async (note, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notes/${note.id}/pin`);
      refreshNotes();
      toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      refreshNotes();
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const openEditModal = (note, e) => {
    e.stopPropagation();
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || '',
      category: note.category,
      tags: note.tags?.join(', ') || '',
      color: note.color || '#3B82F6'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: '',
      color: '#3B82F6'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div>
          <button className="btn btn-ghost btn-icon lg:hidden" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className="header-title">Notes</h1>
          <p className="header-subtitle">Capture your thoughts and ideas</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            New Note
          </button>
        </div>
      </header>

      <div className="page-container">
        {/* Search and Filters */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FileText size={64} className="empty-state-icon" />
              <div className="empty-state-title">No notes found</div>
              <div className="empty-state-text">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Create your first note to get started'}
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={18} />
                Create Note
              </button>
            </div>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className="note-card"
                onClick={() => setViewingNote(note)}
              >
                <div 
                  className="note-card-accent" 
                  style={{ backgroundColor: note.color || '#3B82F6' }}
                />
                <div className="note-card-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div className="note-card-title">{note.title}</div>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={(e) => handleTogglePin(note, e)}
                      style={{ color: note.isPinned ? '#F59E0B' : 'var(--gray-400)' }}
                    >
                      <Pin size={16} fill={note.isPinned ? '#F59E0B' : 'none'} />
                    </button>
                  </div>
                  <div className="note-card-preview">
                    {note.content.replace(/[#*`]/g, '').substring(0, 150)}...
                  </div>
                </div>
                <div className="note-card-footer">
                  <div className="note-tags">
                    {note.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="note-tag">{tag}</span>
                    ))}
                    {note.tags?.length > 2 && (
                      <span className="note-tag">+{note.tags.length - 2}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{formatDate(note.updatedAt)}</span>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={(e) => openEditModal(note, e)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={(e) => handleDelete(note.id, e)}
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Note Modal */}
      {viewingNote && (
        <div className="modal-overlay" onClick={() => setViewingNote(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: `3px solid ${viewingNote.color}` }}>
              <h3 className="modal-title">{viewingNote.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-ghost btn-icon" 
                  onClick={(e) => {
                    setViewingNote(null);
                    openEditModal(viewingNote, e);
                  }}
                >
                  <Edit2 size={18} />
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewingNote(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'inherit',
                lineHeight: 1.7,
                color: 'var(--gray-700)'
              }}>
                {viewingNote.content}
              </div>
              {viewingNote.tags?.length > 0 && (
                <div className="note-tags" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                  <Tag size={14} style={{ color: 'var(--gray-400)' }} />
                  {viewingNote.tags.map(tag => (
                    <span key={tag} className="note-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Last updated: {new Date(viewingNote.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter note title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-input form-textarea"
                    style={{ minHeight: '200px' }}
                    placeholder="Write your note here... (Markdown supported)"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="general">General</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="learning">Learning</option>
                      <option value="ideas">Ideas</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., meeting, project"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {noteColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: formData.color === color ? '3px solid var(--gray-900)' : '2px solid transparent',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
