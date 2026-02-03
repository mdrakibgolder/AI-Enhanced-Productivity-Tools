import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit2,
  Calendar,
  Tag,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function Tasks({ onMenuClick }) {
  const { tasks, refreshTasks } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'work',
    dueDate: '',
    estimatedTime: 30,
    tags: ''
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData);
        toast.success('Task updated successfully!');
      } else {
        await api.post('/tasks', taskData);
        toast.success('Task created successfully!');
      }
      
      refreshTasks();
      closeModal();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      refreshTasks();
      if (newStatus === 'completed') {
        toast.success('Task completed! 🎉');
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      refreshTasks();
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      estimatedTime: task.estimatedTime || 30,
      tags: task.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'work',
      dueDate: '',
      estimatedTime: 30,
      tags: ''
    });
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    return { total, completed, pending, inProgress, overdue };
  };

  const stats = getTaskStats();

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div>
          <button className="btn btn-ghost btn-icon lg:hidden" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className="header-title">Tasks</h1>
          <p className="header-subtitle">Manage and organize your tasks efficiently</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </header>

      <div className="page-container">
        {/* Quick Stats */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon blue"><CheckCircle2 size={24} /></div>
            <div className="stat-content">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle2 size={24} /></div>
            <div className="stat-content">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Clock size={24} /></div>
            <div className="stat-content">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{stats.inProgress}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><AlertCircle size={24} /></div>
            <div className="stat-content">
              <div className="stat-label">Overdue</div>
              <div className="stat-value">{stats.overdue}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="search-container" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filters" style={{ marginBottom: 0 }}>
                <button 
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('in-progress')}
                >
                  In Progress
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="card">
          <div className="card-body">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={64} className="empty-state-icon" />
                <div className="empty-state-title">No tasks found</div>
                <div className="empty-state-text">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Create your first task to get started'}
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={18} />
                  Add Task
                </button>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
                  >
                    <div 
                      className={`task-checkbox ${task.status === 'completed' ? 'completed' : ''}`}
                      onClick={() => handleToggleComplete(task)}
                    >
                      {task.status === 'completed' && <CheckCircle2 size={14} />}
                    </div>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className={`task-priority ${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className="badge badge-purple">{task.category}</span>
                        {task.dueDate && (
                          <span className={`task-due ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'overdue' : ''}`}>
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.estimatedTime && (
                          <span>
                            <Clock size={12} /> {task.estimatedTime}m
                          </span>
                        )}
                      </div>
                      {task.tags?.length > 0 && (
                        <div className="note-tags" style={{ marginTop: '0.5rem' }}>
                          {task.tags.map(tag => (
                            <span key={tag} className="note-tag">
                              <Tag size={10} /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="task-actions" style={{ opacity: 1 }}>
                      <button 
                        className="btn btn-ghost btn-icon"
                        onClick={() => openEditModal(task)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-icon"
                        onClick={() => handleDelete(task.id)}
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTask ? 'Edit Task' : 'Create New Task'}
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
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Add a description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="learning">Learning</option>
                      <option value="health">Health</option>
                      <option value="finance">Finance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Time (min)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="5"
                      max="480"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., urgent, project, meeting"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
