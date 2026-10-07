import React, { useState } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('vatsalparmar1742002@gmail.com');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('auth/forgot-password', { email });
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset link has been dispatched to your email!');
      } else {
        setErrorMsg(res.error || 'Failed to send reset email');
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
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
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Mail size={26} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Forgot Password</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Enter your admin email to receive a password reset link
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '16px',
              borderRadius: 10,
              fontSize: 14,
              lineHeight: 1.5,
              marginBottom: 20
            }}>
              <CheckCircle2 size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
              {successMsg}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20 }}>
              Please check your inbox (and spam folder) for the recovery email sent via our Email Service API.
            </p>
            <a href="#/admin/login" className="btn-secondary" style={{ width: '100%' }}>
              Back to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Registered Admin Email
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vatsalparmar1742002@gmail.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-btn"
              style={{ width: '100%', padding: 14, fontSize: 15 }}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <a href="#/admin/login" style={{ fontSize: 13, color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={14} /> Back to Sign In
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
