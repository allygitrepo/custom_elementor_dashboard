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
import { getSavedTheme, applyAdminTheme, applyPublicTheme } from './services/theme';

function getRouteState() {
  const hash = (window.location.hash || '').toLowerCase();
  const path = (window.location.pathname || '').toLowerCase();

  if (hash.includes('admin/forgot-password') || path.includes('admin/forgot-password')) {
    return 'admin-forgot';
  }
  if (hash.includes('admin/reset-password') || path.includes('admin/reset-password')) {
    return 'admin-reset';
  }
  if (hash.startsWith('#/admin') || path.endsWith('/admin') || path.endsWith('/admin/') || path.includes('/admin/')) {
    return 'admin';
  }
  return 'landing';
}

export default function App() {
  const [routeType, setRouteType] = useState(getRouteState);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('elem_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminTab, setAdminTab] = useState('dashboard');

  // Ensure theme only applies to admin portal, preserving public branding on landing
  useEffect(() => {
    if (routeType === 'landing') {
      applyPublicTheme();
    } else {
      applyAdminTheme();
    }
  }, [routeType]);

  useEffect(() => {
    const handleRouteChange = () => {
      setRouteType(getRouteState());
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Validate admin token if accessing admin route
  useEffect(() => {
    const token = localStorage.getItem('elem_admin_token');
    if (token && routeType === 'admin') {
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
  }, [routeType]);

  const handleLogout = () => {
    localStorage.removeItem('elem_admin_token');
    localStorage.removeItem('elem_admin_user');
    setAdminUser(null);
    window.location.hash = '#/admin/login';
    setRouteType('admin');
  };

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    window.location.hash = '#/admin/dashboard';
    setRouteType('admin');
  };

  // Route Handling
  if (routeType === 'admin-forgot') {
    return <AdminForgotPassword />;
  }

  if (routeType === 'admin-reset') {
    return <AdminResetPassword />;
  }

  if (routeType === 'admin') {
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
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Default: Public Marketing Landing Page
  return <LandingPage />;
}
