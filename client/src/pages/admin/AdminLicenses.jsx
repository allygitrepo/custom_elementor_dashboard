import React, { useState, useEffect } from 'react';
import { 
  Key, Plus, Search, Filter, RefreshCw, Copy, Check, Mail, 
  Trash2, ShieldCheck, ShieldAlert, Laptop, Globe, CheckCircle2,
  ExternalLink, UserPlus, Send, AlertTriangle, X, Edit2, Save, Calendar,
  CreditCard
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);

  // In-Dashboard Toast Notification State
  const [toast, setToast] = useState(null);
  
  // Modal states for Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_id: '',
    notes: '',
    send_email: true
  });
  const [creating, setCreating] = useState(false);

  // Real-time Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    customer_name: '',
    customer_email: '',
    payment_id: '',
    activation_date: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Resend Email Confirmation Modal State
  const [resendTarget, setResendTarget] = useState(null);
  const [resending, setResending] = useState(false);

  // Delete License Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      let query = `admin/licenses?page=${page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await api.get(query);
      if (res.success) {
        setLicenses(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLicenses();
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast('success', `Copied license key ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyPaymentId = (pid) => {
    if (!pid) return;
    navigator.clipboard.writeText(pid);
    setCopiedPaymentId(pid);
    showToast('success', `Copied Payment ID ${pid} to clipboard!`);
    setTimeout(() => setCopiedPaymentId(null), 2000);
  };

  // Convert raw date string to YYYY-MM-DD for <input type="date" />
  const toDateInputValue = (dateStr) => {
    if (!dateStr || dateStr === '—') return '';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) {
        const parts = dateStr.split(' ')[0].split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) return parts.join('-');
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return '';
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // Format date to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    try {
      let iso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      if (!iso.endsWith('Z') && !iso.includes('+')) {
        iso += 'Z';
      }
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        const parts = dateStr.split(' ')[0].split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return dateStr;
        }
        return dateStr;
      }

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Start Inline Editing for a Row
  const startEditing = (lic) => {
    setEditingId(lic.id);
    setEditForm({
      customer_name: lic.customer_name || '',
      customer_email: lic.customer_email || '',
      payment_id: lic.payment_id || '',
      activation_date: toDateInputValue(lic.activation_date)
    });
  };

  // Cancel Inline Editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ customer_name: '', customer_email: '', payment_id: '', activation_date: '' });
  };

  // Save Inline Edit in Real-time
  const saveInlineEdit = async (lic) => {
    if (!editForm.customer_name.trim() || !editForm.customer_email.trim()) {
      showToast('error', '❌ Client name and email cannot be empty');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await api.post('admin/licenses/update', {
        id: lic.id,
        customer_name: editForm.customer_name.trim(),
        customer_email: editForm.customer_email.trim(),
        payment_id: editForm.payment_id.trim() || null,
        activation_date: editForm.activation_date || null
      });

      if (res.success) {
        // Update local state in real-time
        setLicenses(prev => prev.map(item => {
          if (item.id === lic.id) {
            return {
              ...item,
              customer_name: editForm.customer_name.trim(),
              customer_email: editForm.customer_email.trim(),
              payment_id: editForm.payment_id.trim() || null,
              activation_date: editForm.activation_date ? `${editForm.activation_date} 00:00:00` : item.activation_date
            };
          }
          return item;
        }));

        showToast('success', `✅ Updated license details for key ${lic.license_key} in real-time!`);
        cancelEditing();
      } else {
        showToast('error', '❌ ' + (res.error || 'Failed to update license'));
      }
    } catch (err) {
      showToast('error', '❌ Network error updating license details');
    } finally {
      setSavingEdit(false);
    }
  };

  // Execute Confirmed Resend Email
  const executeResendEmail = async () => {
    if (!resendTarget) return;
    setResending(true);
    try {
      const res = await api.post('admin/licenses/resend-email', { id: resendTarget.id });
      if (res.success) {
        showToast('success', `✅ License & download link resent to ${resendTarget.customer_email}!`);
        setResendTarget(null);
      } else {
        showToast('error', '❌ ' + (res.message || res.error || 'Failed to send email'));
      }
    } catch (err) {
      showToast('error', '❌ Network error during email dispatch');
    } finally {
      setResending(false);
    }
  };

  // Execute Confirmed Delete License
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.post('admin/licenses/delete', { id: deleteTarget.id });
      if (res.success) {
        showToast('success', `🗑️ License key ${deleteTarget.license_key} deleted successfully!`);
        setDeleteTarget(null);
        fetchLicenses();
      } else {
        showToast('error', '❌ ' + (res.error || 'Failed to delete license'));
      }
    } catch (err) {
      showToast('error', '❌ Network error deleting license');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.customer_name || !createForm.customer_email) {
      showToast('error', '❌ Name and email are required');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('admin/licenses/create', createForm);
      if (res.success) {
        showToast('success', `✅ 6-Digit Key ${res.license_key} generated!` + (res.email_sent ? ' Email dispatched to client.' : ''));
        setShowCreateModal(false);
        setCreateForm({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          payment_id: '',
          notes: '',
          send_email: true
        });
        fetchLicenses();
      } else {
        showToast('error', '❌ ' + (res.error || 'Failed to create license'));
      }
    } catch (err) {
      showToast('error', '❌ Error creating license key');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Top Header & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>License Key Management</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage client 6-digit keys, Razorpay payment tracking, and live telemetry bindings
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="gradient-btn"
          style={{ padding: '10px 18px', fontSize: 14 }}
        >
          <UserPlus size={16} /> Generate Manual Key
        </button>
      </div>

      {/* Dashboard Toast / Notification Banner */}
      {toast && (
        <div style={{
          background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          padding: '12px 18px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by Key, Customer Name, Email, Payment ID, or Bound Domain..."
              className="input-field"
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '10px 16px', fontSize: 13 }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={fetchLicenses} 
            className="btn-secondary" 
            style={{ padding: '10px 14px' }}
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* License Data Table with Real-Time In-Line Editing */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '11%' }}>6-Digit Key</th>
                <th style={{ width: '16%' }}>Client Name</th>
                <th style={{ width: '18%' }}>Client Email</th>
                <th style={{ width: '16%' }}>Razorpay Payment ID</th>
                <th style={{ width: '13%' }}>Bound Domain</th>
                <th style={{ width: '10%' }}>IP Address</th>
                <th style={{ width: '10%' }}>Activation Date</th>
                <th style={{ width: '6%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                    {loading ? 'Loading licenses...' : 'No licenses found matching your filter.'}
                  </td>
                </tr>
              ) : (
                licenses.map(lic => {
                  const isLocal = lic.deployed_domain?.includes('localhost') || lic.deployed_domain?.includes('127.0.0.1');
                  const isCopied = copiedKey === lic.license_key;
                  const isCopiedPid = copiedPaymentId === lic.payment_id;
                  const isEditing = editingId === lic.id;

                  return (
                    <tr key={lic.id} style={{ background: isEditing ? 'rgba(99, 102, 241, 0.05)' : undefined }}>
                      {/* 6-Digit Key */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="key-pill">{lic.license_key}</span>
                          <button
                            onClick={() => copyKey(lic.license_key)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                            title="Copy Key"
                          >
                            {isCopied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Client Name (Editable) */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            className="input-field"
                            style={{ padding: '6px 10px', fontSize: 13, height: 34 }}
                            value={editForm.customer_name}
                            onChange={e => setEditForm({ ...editForm, customer_name: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveInlineEdit(lic);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            placeholder="Client Name"
                            autoFocus
                          />
                        ) : (
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {lic.customer_name}
                          </div>
                        )}
                      </td>

                      {/* Client Email (Editable) */}
                      <td>
                        {isEditing ? (
                          <input
                            type="email"
                            required
                            className="input-field"
                            style={{ padding: '6px 10px', fontSize: 13, height: 34, color: '#38bdf8' }}
                            value={editForm.customer_email}
                            onChange={e => setEditForm({ ...editForm, customer_email: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveInlineEdit(lic);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            placeholder="client@email.com"
                          />
                        ) : (
                          <div style={{ fontSize: 13, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                            {lic.customer_email}
                          </div>
                        )}
                      </td>

                      {/* Razorpay Payment ID (Editable) */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="input-field"
                            style={{ padding: '6px 10px', fontSize: 12, height: 34, fontFamily: 'var(--font-mono)', color: '#34d399' }}
                            value={editForm.payment_id}
                            onChange={e => setEditForm({ ...editForm, payment_id: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveInlineEdit(lic);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            placeholder="pay_XXXXX or MANUAL"
                          />
                        ) : (
                          lic.payment_id ? (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 12,
                              color: '#34d399',
                              background: 'rgba(16, 185, 129, 0.1)',
                              padding: '3px 8px',
                              borderRadius: 6,
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              display: 'inline-block'
                            }}>
                              {lic.payment_id}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                              Manual / Free
                            </span>
                          )
                        )}
                      </td>

                      {/* Bound Domain */}
                      <td>
                        {lic.deployed_domain ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isLocal ? <Laptop size={14} color="#fbbf24" /> : <Globe size={14} color="#34d399" />}
                            <span style={{ fontWeight: 600, color: isLocal ? '#fbbf24' : '#34d399' }}>
                              {lic.deployed_domain}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            ⏳ Pending Activation
                          </span>
                        )}
                      </td>

                      {/* IP Address (No Pings) */}
                      <td>
                        <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                          {lic.deployed_ip || '—'}
                        </code>
                      </td>

                      {/* Activation Date (Editable) */}
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <input
                              type="date"
                              className="input-field"
                              style={{ padding: '4px 8px', fontSize: 12, height: 32 }}
                              value={editForm.activation_date}
                              onChange={e => setEditForm({ ...editForm, activation_date: e.target.value })}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveInlineEdit(lic);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                            />
                            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Created: {formatDate(lic.created_at)}</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                              {lic.activation_date ? formatDate(lic.activation_date) : '—'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                              Created: {formatDate(lic.created_at)}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        {isEditing ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              disabled={savingEdit}
                              onClick={() => saveInlineEdit(lic)}
                              className="gradient-btn"
                              style={{ padding: '6px 12px', fontSize: 12 }}
                              title="Save changes"
                            >
                              {savingEdit ? <RefreshCw size={13} className="animate-spin" /> : <><Check size={13} /> Save</>}
                            </button>
                            <button
                              disabled={savingEdit}
                              onClick={cancelEditing}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              title="Cancel editing"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              onClick={() => startEditing(lic)}
                              className="btn-secondary"
                              style={{ padding: '6px 8px', fontSize: 12 }}
                              title="Edit License Details"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setResendTarget(lic)}
                              className="btn-secondary"
                              style={{ padding: '6px 8px', fontSize: 12 }}
                              title="Resend Key & Zip Email"
                            >
                              <Mail size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(lic)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#f87171',
                                padding: '6px 8px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete License"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: 13, opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: page === p ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: page === p ? 'var(--gradient-primary)' : 'var(--bg-subtle)',
                  color: page === p ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: page === p ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {p}
              </button>
            ))}

            <button 
              disabled={page >= (pagination.pages || 1)} 
              onClick={() => setPage(p => Math.min(pagination.pages || 1, p + 1))} 
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: 13, opacity: page >= (pagination.pages || 1) ? 0.4 : 1, cursor: page >= (pagination.pages || 1) ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Resend Email */}
      {resendTarget && (
        <div className="modal-backdrop" onClick={() => !resending && setResendTarget(null)}>
          <div className="glass-card" style={{ maxWidth: 440, width: '100%', padding: 32, background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Resend License Email</h3>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Automated package & key delivery</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Are you sure you want to resend the delivery email with 6-digit key <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{resendTarget.license_key}</strong> and zip package link to <strong style={{ color: '#38bdf8' }}>{resendTarget.customer_email}</strong> ({resendTarget.customer_name})?
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                disabled={resending}
                onClick={() => setResendTarget(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: 12 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resending}
                onClick={executeResendEmail}
                className="gradient-btn"
                style={{ flex: 1, padding: 12 }}
              >
                {resending ? <RefreshCw size={16} className="animate-spin" /> : <><Send size={15} /> Send Email Now</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete License */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="glass-card" style={{ maxWidth: 440, width: '100%', padding: 32, background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f87171' }}>Delete License Key</h3>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Permanent deletion warning</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Are you sure you want to permanently delete the 6-digit license <strong style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>{deleteTarget.license_key}</strong> belonging to <strong style={{ color: 'var(--text-main)' }}>{deleteTarget.customer_name}</strong> ({deleteTarget.customer_email})?
              <br />
              <span style={{ color: '#fbbf24', fontSize: 12, display: 'inline-block', marginTop: 8 }}>
                ⚠️ This will immediately revoke activation and disconnect telemetry pings.
              </span>
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: 12 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={executeDelete}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {deleting ? <RefreshCw size={16} className="animate-spin" /> : <><Trash2 size={15} /> Permanently Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Generate License Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: 32, background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>Issue New 6-Digit License</h3>
              <button 
                onClick={() => !creating && setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Client / Agency"
                  className="input-field"
                  value={createForm.customer_name}
                  onChange={e => setCreateForm({ ...createForm, customer_name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Client Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. client@agency.com"
                  className="input-field"
                  value={createForm.customer_email}
                  onChange={e => setCreateForm({ ...createForm, customer_email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Razorpay Payment ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. pay_XXXXX (Defaults to MANUAL)"
                  className="input-field"
                  value={createForm.payment_id}
                  onChange={e => setCreateForm({ ...createForm, payment_id: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className="input-field"
                  value={createForm.customer_phone}
                  onChange={e => setCreateForm({ ...createForm, customer_phone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Direct agency contract, manual wire transfer"
                  className="input-field"
                  value={createForm.notes}
                  onChange={e => setCreateForm({ ...createForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="send_email_chk"
                  checked={createForm.send_email}
                  onChange={e => setCreateForm({ ...createForm, send_email: e.target.checked })}
                />
                <label htmlFor="send_email_chk" style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Send automated delivery email with 6-digit key & download link
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="gradient-btn"
                  style={{ flex: 1, padding: 12 }}
                >
                  {creating ? <RefreshCw size={16} className="animate-spin" /> : <><Plus size={16} /> Generate Key</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
