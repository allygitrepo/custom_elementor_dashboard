import React, { useState, useEffect } from 'react';
import { 
  Key, Plus, Search, Filter, RefreshCw, Copy, Check, Mail, 
  Trash2, ShieldCheck, ShieldAlert, Laptop, Globe, CheckCircle2,
  ExternalLink, UserPlus, Send
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
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
    send_email: true
  });
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      let query = `admin/licenses?page=${page}&limit=25`;
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
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Format date to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      let iso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      if (!iso.endsWith('Z') && !iso.includes('+')) {
        iso += 'Z';
      }
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        const parts = dateStr.split(' ')[0].split('-');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
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

  const handleResendEmail = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.post('admin/licenses/resend-email', { id });
      if (res.success) {
        alert('✅ Email resent successfully to client!');
      } else {
        alert('❌ ' + (res.message || res.error || 'Failed to send email'));
      }
    } catch (err) {
      alert('Error sending email');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this license key?')) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await api.post('admin/licenses/delete', { id });
      if (res.success) {
        fetchLicenses();
      } else {
        alert(res.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting license');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.customer_name || !createForm.customer_email) {
      alert('Name and Email are required');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('admin/licenses/create', createForm);
      if (res.success) {
        alert(`✅ License Key ${res.license_key} generated successfully!` + (res.email_sent ? ' Email was sent.' : ''));
        setShowCreateModal(false);
        setCreateForm({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          notes: '',
          send_email: true
        });
        fetchLicenses();
      } else {
        alert(res.error || 'Failed to create license');
      }
    } catch (err) {
      alert('Error creating license');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>License Key Management</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage client 6-digit keys, bound domain bindings, and telemetry status
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

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by Key, Customer Name, Email, or Bound Domain..."
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

      {/* License Data Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>6-Digit Key</th>
                <th>Client Name</th>
                <th>Client Email</th>
                <th>Bound Domain</th>
                <th>IP & Telemetry</th>
                <th>Activation Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                    {loading ? 'Loading licenses...' : 'No licenses found matching your filter.'}
                  </td>
                </tr>
              ) : (
                licenses.map(lic => {
                  const isLocal = lic.deployed_domain?.includes('localhost') || lic.deployed_domain?.includes('127.0.0.1');
                  const isCopied = copiedKey === lic.license_key;
                  const isActing = actionLoadingId === lic.id;

                  return (
                    <tr key={lic.id}>
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
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{lic.customer_name}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{lic.customer_email}</div>
                      </td>
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
                      <td>
                        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{lic.deployed_ip || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Pings: {lic.ping_count || 0}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                          {lic.activation_date ? formatDate(lic.activation_date) : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                          Created: {formatDate(lic.created_at)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            disabled={isActing}
                            onClick={() => handleResendEmail(lic.id)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: 12 }}
                            title="Resend Key & Zip Email"
                          >
                            <Mail size={13} /> Resend
                          </button>
                          <button
                            disabled={isActing}
                            onClick={() => handleDelete(lic.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171',
                              padding: '6px 8px',
                              borderRadius: 6,
                              cursor: 'pointer'
                            }}
                            title="Delete License"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing Page {page} of {pagination.pages} ({pagination.total} total licenses)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)} 
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Previous
              </button>
              <button 
                disabled={page >= pagination.pages} 
                onClick={() => setPage(page + 1)} 
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Generate License Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: 32, background: '#111726' }} onClick={e => e.stopPropagation()}>
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
