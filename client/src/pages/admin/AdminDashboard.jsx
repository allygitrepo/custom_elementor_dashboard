import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Key, Globe, Laptop, Server, Activity, ArrowUpRight, 
  RefreshCw, CheckCircle2, AlertTriangle, Shield, Clock, Plus
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('admin/stats');
      if (res.success) {
        setStats(res.stats);
        setDeployments(res.recent_deployments || []);
        setActivities(res.recent_activities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Poll telemetry every 15s
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '—', time: '' };
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Banner with Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Telemetry Overview</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Real-time client telemetry, domain bindings, and key activations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={fetchStats}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            onClick={() => onNavigate('licenses')}
            className="gradient-btn"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <Plus size={15} /> Issue New Key
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20
      }}>
        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Revenue</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>
            ₹{stats ? stats.total_revenue.toLocaleString() : '0'}
          </div>
          <div style={{ fontSize: 12, color: '#34d399', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> Razorpay Verified Payments
          </div>
        </div>

        {/* Total Licenses */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Issued Keys</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>
            {stats ? stats.total_licenses : '0'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {stats ? stats.active_licenses : '0'} Active • {stats ? stats.suspended_licenses + stats.revoked_licenses : '0'} Revoked
          </div>
        </div>

        {/* Total Deployed Domains */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Deployed Domains</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>
            {stats ? stats.total_deployed : '0'}
          </div>
          <div style={{ fontSize: 12, color: '#38bdf8', marginTop: 6 }}>
            Active Builder Instances Online
          </div>
        </div>

        {/* Localhost vs Live Server breakdown */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Environment Breakdown</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>
                {stats ? stats.localhost_count : 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Localhost</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
                {stats ? stats.live_domain_count : 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Live Production</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Deployments & Live Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Deployments Table */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>Live Deployed Client Domains</h3>
            <button 
              onClick={() => onNavigate('licenses')}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
            >
              View All Licenses &rarr;
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client & Key</th>
                  <th>Bound Domain</th>
                  <th>IP Address</th>
                  <th>Last Ping</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deployments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 32, color: 'var(--text-dim)' }}>
                      No domain deployments recorded yet. Keys will appear here once activated on localhost or live servers.
                    </td>
                  </tr>
                ) : (
                  deployments.map(item => {
                    const isLocal = item.deployed_domain?.includes('localhost') || item.deployed_domain?.includes('127.0.0.1');
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.customer_name}</div>
                          <div className="key-pill" style={{ marginTop: 4 }}>{item.license_key}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isLocal ? <Laptop size={14} color="#fbbf24" /> : <Globe size={14} color="#34d399" />}
                            <span style={{ fontWeight: 600 }}>{item.deployed_domain}</span>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.deployed_ip || 'N/A'}</code>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: 'var(--text-main)' }}>
                            {formatDateTime(item.last_ping_date || item.activation_date).date}
                          </div>
                          {formatDateTime(item.last_ping_date || item.activation_date).time && (
                            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                              {formatDateTime(item.last_ping_date || item.activation_date).time}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${item.status === 'active' ? 'success' : 'danger'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Activity Log Stream */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="#818cf8" /> Live Activity
            </h3>
            <button 
              onClick={() => onNavigate('logs')}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
            >
              Full Log &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 420 }}>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)', fontSize: 13 }}>
                No recent activity events.
              </div>
            ) : (
              activities.map(log => {
                const logDt = formatDateTime(log.created_at);
                return (
                  <div key={log.id} style={{
                    padding: 12,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    fontSize: 13
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span className={`badge badge-${
                        log.event_type.includes('success') || log.event_type === 'purchase' || log.event_type === 'domain_bound' 
                          ? 'success' 
                          : log.event_type === 'ping' 
                          ? 'info' 
                          : 'warning'
                      }`} style={{ fontSize: 11, padding: '2px 8px' }}>
                        {log.event_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {logDt.date} {logDt.time}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                      {log.details || `Key: ${log.license_key || 'N/A'}`}
                    </div>
                    {log.domain && (
                      <div style={{ fontSize: 11, color: '#38bdf8', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        🌐 {log.domain}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
