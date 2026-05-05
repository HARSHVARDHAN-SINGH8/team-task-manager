import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';
import MyTasks from './pages/MyTasks';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import Reporting from './pages/Reporting';
import ForgotPassword from './pages/ForgotPassword';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    // If we have a saved preference, use it. Otherwise, open by default only on desktop.
    if (saved !== null) return JSON.parse(saved);
    return window.innerWidth >= 1024;
  });
  const { user } = React.useContext(AuthContext);

  if (!user) return <>{children}</>;

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1e1f21] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 overflow-hidden">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main 
        className="mt-[60px] h-[calc(100vh-60px)] overflow-y-auto"
        data-rbd-scroll-container
      >
        <div className="p-4 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SearchProvider>
          <ThemeProvider>
            <Router>
              <Routes>
                {/* Public routes - NO navbar/sidebar */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected routes - WITH navbar/sidebar via Layout */}
                <Route path="/*" element={
                  <Layout>
                    <Routes>
                      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                      <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                      <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                      <Route path="/reporting" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
                      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                      <Route path="/projects/:id/tasks/:taskId" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
                      <Route path="/" element={<Navigate to="/home" />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
            </Router>
          </ThemeProvider>
        </SearchProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
