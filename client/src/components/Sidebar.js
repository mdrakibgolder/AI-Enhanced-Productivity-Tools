import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Timer, 
  BarChart2, 
  Settings, 
  Zap,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

function Sidebar({ isOpen, onClose }) {
  const { user, tasks } = useApp();

  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', badge: pendingTasks },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/timer', icon: Timer, label: 'Focus Timer' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  ];

  const bottomItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">
            <Zap size={24} />
          </div>
          <span className="logo-text">ProductivityAI</span>
          <button 
            className="btn btn-ghost btn-icon lg:hidden ml-auto"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="nav-section">
          <div className="nav-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <item.icon className="nav-item-icon" size={20} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}

          <div className="nav-label">Preferences</div>
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <item.icon className="nav-item-icon" size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || 'user@email.com'}</div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
