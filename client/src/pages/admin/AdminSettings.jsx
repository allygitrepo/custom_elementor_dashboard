import React from 'react';
import { 
  ShieldCheck, Server, Globe, Cpu, CheckCircle2, Lock, 
  Layers, Package, Bell, RefreshCw, Key
} from 'lucide-react';

export default function AdminSettings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>General System Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          System health, environment overview, and platform configuration
        </p>
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
            background: '#090d16',
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
            background: '#090d16',
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
            background: '#090d16',
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
            background: '#090d16',
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
            color: '#818cf8',
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
      <div className="glass-card" style={{ padding: 24, borderLeft: '4px solid #6366f1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Lock size={18} color="#818cf8" />
          <h4 style={{ fontSize: 15, fontWeight: 700 }}>Security & Privacy Protected</h4>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          All secret API keys, payment credentials, and email passkeys are securely isolated in the server environment configuration (<code style={{ color: '#818cf8' }}>server/.env</code>) and are protected from frontend exposure.
        </p>
      </div>
    </div>
  );
}
