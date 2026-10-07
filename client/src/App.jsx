import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLicenses from './pages/admin/AdminLicenses';
import AdminZipManager from './pages/admin/AdminZipManager';
import AdminLogs from './pages/admin/AdminLogs';
import AdminSettings from './pages/admin/AdminSettings';
import { api } from './services/api';

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('elem_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminTab, setAdminTab] = useState('dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Validate admin token if accessing admin route
  useEffect(() => {
    const token = localStorage.getItem('elem_admin_token');
    if (token && route.startsWith('#/admin') && !route.includes('forgot') && !route.includes('reset')) {
      api.get('auth/me').then(res => {
        if (res.success && res.user) {
          setAdminUser(res.user);
        } else {
          localStorage.removeItem('elem_admin_token');
          localStorage.removeItem('elem_admin_user');
          setAdminUser(null);
        }
      });
    }
  }, [route]);

  const handleLogout = () => {
    localStorage.removeItem('elem_admin_token');
    localStorage.removeItem('elem_admin_user');
    setAdminUser(null);
    window.location.hash = '#/admin/login';
  };

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    window.location.hash = '#/admin/dashboard';
  };

  // Route Handling
  if (route.startsWith('#/admin/forgot-password')) {
    return <AdminForgotPassword />;
  }

  if (route.startsWith('#/admin/reset-password')) {
    return <AdminResetPassword />;
  }

  if (route.startsWith('#/admin')) {
    if (!adminUser && !localStorage.getItem('elem_admin_token')) {
      return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    return (
      <AdminLayout 
        activeTab={adminTab} 
        onTabChange={setAdminTab} 
        onLogout={handleLogout}
        user={adminUser}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigate={setAdminTab} />}
        {adminTab === 'licenses' && <AdminLicenses />}
        {adminTab === 'zips' && <AdminZipManager />}
        {adminTab === 'logs' && <AdminLogs />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Default: Public Marketing Landing Page
  return <LandingPage />;
}
