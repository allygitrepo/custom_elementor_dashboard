import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, RefreshCw, KeyRound, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Parse token from hash (e.g. #/admin/reset-password?token=abc...)
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const tokenFromUrl = params.get('token') || '';
    setToken(tokenFromUrl);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Missing reset token. Please use the link sent to your email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('auth/reset-password', {
        token,
        password
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 16px'
          }}>
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Create New Password</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Enter your new secure administrator password
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

        {!token && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            padding: '12px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertTriangle size={18} />
            No token found in link. Please click the full link in your email.
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '16px',
              borderRadius: 10,
              fontSize: 14,
              marginBottom: 24
            }}>
              <CheckCircle2 size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
              Password updated successfully! You can now sign in.
            </div>
            <a href="#/admin/login" className="gradient-btn" style={{ width: '100%', padding: 14 }}>
              Go to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                New Password (min 6 characters)
              </label>
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

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="input-field"
                  style={{ paddingRight: 42 }}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="gradient-btn"
              style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 6 }}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Set New Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <a href="#/admin/login" style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                Cancel & Return to Login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
