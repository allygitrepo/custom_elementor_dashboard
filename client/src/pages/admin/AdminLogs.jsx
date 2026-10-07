import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Globe, Terminal, Shield, Laptop, CreditCard } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`admin/logs?page=${page}&limit=30`);
      if (res.success) {
        setLogs(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  // Format date to DD-MM-YYYY and real local time to HH:MM am/pm
  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '—', time: '' };
    try {
      // Append Z if no timezone specified so browser converts UTC to local time (IST)
      let iso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      if (!iso.endsWith('Z') && !iso.includes('+')) {
        iso += 'Z';
      }
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        const parts = dateStr.split(' ');
        return { date: parts[0] || dateStr, time: parts[1] || '' };
      }

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12 || 12;
      const strHours = String(hours).padStart(2, '0');

      return {
        date: `${day}-${month}-${year}`,
        time: `${strHours}:${minutes} ${ampm}`
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Telemetry & Audit Trail</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Real-time security events, activation attempts, domain binding logs, and heartbeats
          </p>
        </div>

        <button 
          onClick={fetchLogs} 
          className="btn-secondary" 
          style={{ padding: '8px 14px', fontSize: 13 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Stream
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>License Key</th>
                <th>Client Domain</th>
                <th>Client IP</th>
                <th>Payment ID</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                    {loading ? 'Loading logs...' : 'No telemetry activity logs found.'}
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const isLocal = log.domain?.includes('localhost') || log.domain?.includes('127.0.0.1');
                  const dt = formatDateTime(log.created_at);

                  return (
                    <tr key={log.id}>
                      <td>
                        <span className={`badge badge-${
                          log.event_type.includes('success') || log.event_type === 'purchase' || log.event_type === 'domain_bound'
                            ? 'success'
                            : log.event_type === 'ping'
                            ? 'info'
                            : log.event_type.includes('failed')
                            ? 'danger'
                            : 'purple'
                        }`}>
                          {log.event_type.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {log.license_key ? (
                          <span className="key-pill">{log.license_key}</span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {log.domain ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isLocal ? <Laptop size={13} color="#fbbf24" /> : <Globe size={13} color="#34d399" />}
                            <span style={{ fontWeight: 600, color: isLocal ? '#fbbf24' : '#34d399' }}>{log.domain}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.ip || '—'}</code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, color: '#f1f5f9', fontFamily: log.details?.includes('pay_') ? 'var(--font-mono)' : 'inherit' }}>
                            {log.details || '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{dt.date}</div>
                        {dt.time && <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{dt.time}</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing Page {page} of {pagination.pages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                Previous
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
