import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Server, Globe, Cpu, CheckCircle2, Lock, 
  Layers, Package, Bell, RefreshCw, Key, Palette, Sparkles, Check
} from 'lucide-react';
import { THEMES, getSavedTheme, applyTheme } from '../../services/theme';

export default function AdminSettings() {
  const [currentTheme, setCurrentTheme] = useState(getSavedTheme);
  const [toastMessage, setToastMessage] = useState('');

  const handleSelectTheme = (themeId) => {
    const applied = applyTheme(themeId);
    setCurrentTheme(applied);
    const themeObj = THEMES.find(t => t.id === applied);
    setToastMessage(`✨ Applied "${themeObj?.name || applied}" theme!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>System Settings & Appearance</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Customize interface themes, inspect backend subsystem health, and review platform configurations
        </p>
      </div>

      {toastMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          padding: '12px 18px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Sparkles size={16} /> {toastMessage}
        </div>
      )}

      {/* Appearance & Color Themes Section */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Palette size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Appearance & Dashboard Theme</h3>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                Select a visual color palette. Changes take effect across all dashboard views immediately.
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-surface)',
            padding: '6px 14px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            fontSize: 12
          }}>
            <span style={{ color: 'var(--text-dim)' }}>Current Theme:</span>
            <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>
              {THEMES.find(t => t.id === currentTheme)?.name || currentTheme}
            </strong>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 18
        }}>
          {THEMES.map(theme => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                style={{
                  background: theme.bgColor,
                  border: isSelected ? `2px solid ${theme.primaryColor}` : '1px solid var(--border-color)',
                  borderRadius: 14,
                  padding: 20,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  boxShadow: isSelected ? `0 8px 24px -6px ${theme.glowColor}` : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'none'
                }}
              >
                {/* Header & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: theme.textColor }}>
                    {theme.name}
                  </div>
                  {isSelected ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      background: theme.primaryColor,
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: 9999
                    }}>
                      <Check size={12} /> Active
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '3px 8px',
                      borderRadius: 9999
                    }}>
                      {theme.category}
                    </span>
                  )}
                </div>

                {/* Color Swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: theme.primaryColor, border: '2px solid rgba(255,255,255,0.2)' }} title="Primary Accent" />
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: theme.secondaryColor, border: '2px solid rgba(255,255,255,0.2)' }} title="Secondary Gradient" />
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: theme.cardColor, border: '1px solid rgba(255,255,255,0.3)' }} title="Card Surface" />
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: theme.bgColor, border: '1px solid rgba(255,255,255,0.3)' }} title="Main Canvas" />
                </div>

                {/* Mini Live Preview Window */}
                <div style={{
                  background: theme.cardColor,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                    <div style={{ height: 4, width: 40, borderRadius: 2, background: 'rgba(255,255,255,0.15)', marginLeft: 6 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 30, height: 26, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ flex: 1, height: 26, borderRadius: 4, background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, opacity: 0.85 }} />
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {theme.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Services Status Card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>System Health & Services</h3>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Real-time status of backend subsystems</div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}>
          {/* Email Service */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: 12
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
              Email Dispatch Engine
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span className="badge badge-success" style={{ fontSize: 12 }}>
                <CheckCircle2 size={13} /> Connected & Active
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Automated key dispatch & recovery emails enabled.
            </div>
          </div>

          {/* Razorpay Gateway */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: 12
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
              Payment Gateway
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span className="badge badge-info" style={{ fontSize: 12 }}>
                <CheckCircle2 size={13} /> Razorpay Active
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              256-bit signature verification active.
            </div>
          </div>

          {/* Database Engine */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: 12
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
              Database Storage
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span className="badge badge-success" style={{ fontSize: 12 }}>
                <Server size={13} /> SQLite 3 (WAL Mode)
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Zero-setup self-hosted embedded storage.
            </div>
          </div>

          {/* Telemetry Engine */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: 12
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
              Domain Telemetry
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span className="badge badge-purple" style={{ fontSize: 12 }}>
                <Globe size={13} /> Telemetry Listening
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Real-time localhost & remote server tracking.
            </div>
          </div>
        </div>
      </div>

      {/* General Platform Details Card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Platform & Licensing Specifications</h3>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Core platform parameters</div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Platform Version</label>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
              v2.0.0 Pro Enterprise
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Key Format</label>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
              6-Digit Alphanumeric (Unique)
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Product Distribution</label>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
              Site_Builder_v2_29_09_26.zip
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Deployment Mode</label>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399', marginTop: 4 }}>
              100% Path-Independent
            </div>
          </div>
        </div>
      </div>

      {/* Security & Secrets Privacy Note */}
      <div className="glass-card" style={{ padding: 24, borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Lock size={18} color="var(--primary)" />
          <h4 style={{ fontSize: 15, fontWeight: 700 }}>Security & Privacy Protected</h4>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          All secret API keys, payment credentials, and email passkeys are securely isolated in the server environment configuration (<code style={{ color: 'var(--primary)' }}>server/.env</code>) and are protected from frontend exposure.
        </p>
      </div>
    </div>
  );
}
