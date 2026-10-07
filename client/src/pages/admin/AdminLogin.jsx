import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, RefreshCw, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('elem_admin_token', res.token);
        localStorage.setItem('elem_admin_user', JSON.stringify(res.user));
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else {
          window.location.hash = '#/admin/dashboard';
        }
      } else {
        setError(res.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection failed. Please verify server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(circle at center, #111728 0%, #080b12 100%)'
    }}>
      <div className="glass-card" style={{ maxWidth: 440, width: '100%', padding: 40, background: '#111726' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px var(--primary-glow)'
          }}>
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Central</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Sign in to manage custom Elementor clients & telemetry
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Admin Email
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
              <a href="#/admin/forgot-password" style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                style={{ paddingRight: 42 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn"
            style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 8 }}
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <><ShieldCheck size={18} /> Sign In to Portal</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="#/" style={{ fontSize: 13, color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            &larr; Back to Public Store
          </a>
        </div>
      </div>
    </div>
  );
}
