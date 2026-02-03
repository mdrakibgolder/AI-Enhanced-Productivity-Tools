import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AIChat from './components/AIChat';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Timer from './pages/Timer';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/tasks" element={<Tasks onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/notes" element={<Notes onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/timer" element={<Timer onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/analytics" element={<Analytics onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/settings" element={<Settings onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AIChat />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1F2937',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
