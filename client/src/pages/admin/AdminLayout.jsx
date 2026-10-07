import React from 'react';
import { 
  LayoutDashboard, Key, Package, Activity, Settings, LogOut, 
  ExternalLink, Zap, Shield
} from 'lucide-react';

export default function AdminLayout({ activeTab, onTabChange, children, onLogout, user }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Telemetry', icon: LayoutDashboard },
    { id: 'licenses', label: 'License Keys & Clients', icon: Key },
    { id: 'zips', label: 'Zip Package Manager', icon: Package },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: '#0c111d',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>
              Elementor<span className="gradient-text">Admin</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>TELEMETRY V2.0</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)' : 'transparent',
                  color: isActive ? '#818cf8' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} style={{ color: isActive ? '#818cf8' : 'var(--text-dim)' }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom User info & actions */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: '#090d16' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: 13
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'vatsalparmar1742002@gmail.com'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href="#/"
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-muted)'
              }}
            >
              <ExternalLink size={13} /> View Store
            </a>
            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8,
                color: '#f87171',
                fontSize: 12,
                cursor: 'pointer'
              }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <header style={{
          height: 70,
          background: 'rgba(12, 17, 29, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>
              {activeTab === 'zips' ? 'Zip Package Manager' : activeTab}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="badge badge-success">
              <Shield size={12} /> Live Telemetry Online
            </span>
          </div>
        </header>

        <div style={{ padding: '32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
