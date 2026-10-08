import React, { useState } from 'react';
import { 
  LayoutDashboard, Key, Package, Settings, LogOut, 
  ExternalLink, Zap, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

export default function AdminLayout({ activeTab, onTabChange, children, onLogout, user }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Telemetry', icon: LayoutDashboard },
    { id: 'licenses', label: 'License Keys & Clients', icon: Key },
    { id: 'zips', label: 'Zip Package Manager', icon: Package },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const getPublicStoreUrl = () => {
    const origin = window.location.origin;
    const rootPath = window.location.pathname.replace(/\/admin(\/.*)?$/i, '').replace(/\/+$/, '');
    return `${origin}${rootPath}/#/`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', width: '100%' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 260,
        minWidth: collapsed ? 72 : 260,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: collapsed ? '20px 14px' : '22px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
          minHeight: 70,
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
            <div style={{
              width: 36,
              minWidth: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Zap size={20} />
            </div>
            {!collapsed && (
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>
                  Elementor<span className="gradient-text">Admin</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.5px' }}>TELEMETRY V2.0</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={toggleSidebar}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-muted)',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{
          padding: collapsed ? '18px 8px' : '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: 12,
                  padding: collapsed ? '12px 0' : '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? 'var(--bg-subtle)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: (!collapsed && isActive) ? '3px solid var(--primary)' : '3px solid transparent',
                  boxShadow: (collapsed && isActive) ? 'inset 0 0 0 1px var(--primary)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}
              >
                <Icon size={19} style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)', minWidth: 19 }} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom User info & actions */}
        <div style={{
          padding: collapsed ? '14px 8px' : '16px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface)'
        }}>
          {collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div 
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: 13,
                  border: '1px solid var(--border-color)'
                }}
                title={`${user?.name || 'Administrator'} (${user?.email || 'admin@elementor.local'})`}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <a
                href={getPublicStoreUrl()}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  border: '1px solid var(--border-color)'
                }}
                title="View Store"
              >
                <ExternalLink size={15} />
              </a>
              <button
                onClick={onLogout}
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 8,
                  color: '#f87171',
                  cursor: 'pointer'
                }}
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 34,
                  minWidth: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: 13,
                  border: '1px solid var(--border-color)'
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
                  href={getPublicStoreUrl()}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    border: '1px solid var(--border-color)'
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
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden', minWidth: 0 }}>
        <header style={{
          height: 70,
          background: 'var(--bg-header)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Sidebar toggle button in header */}
            <button
              onClick={toggleSidebar}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-muted)',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <h1 style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>
              {activeTab === 'zips' ? 'Zip Package Manager' : activeTab === 'licenses' ? 'Licenses & Clients' : activeTab}
            </h1>
          </div>
        </header>

        <div style={{
          padding: '24px 28px',
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}

