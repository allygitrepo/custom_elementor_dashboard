import React, { useState, useEffect } from 'react';
import { Package, Upload, Download, CheckCircle2, AlertTriangle, RefreshCw, FileArchive, Server } from 'lucide-react';
import { api, getApiBaseUrl } from '../../services/api';

export default function AdminZipManager() {
  const [zipInfo, setZipInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchZipInfo = async () => {
    setLoading(true);
    try {
      const res = await api.get('zip/info');
      if (res.success) {
        setZipInfo(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZipInfo();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a .zip file to upload');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('zip_file', selectedFile);

    try {
      const res = await api.upload('admin/zip/upload', formData);
      if (res.success) {
        setMessage('✅ New builder package uploaded successfully!');
        setSelectedFile(null);
        fetchZipInfo();
      } else {
        setMessage('❌ ' + (res.error || 'Upload failed'));
      }
    } catch (err) {
      setMessage('❌ Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  const getDirectDownloadUrl = () => {
    return `${getApiBaseUrl()}?route=zip/download`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Site Builder Package Distribution</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Manage the deployable zip archive distributed to buyers upon license key verification
        </p>
      </div>

      {message && (
        <div style={{
          background: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.startsWith('✅') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.startsWith('✅') ? '#34d399' : '#f87171',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 14
        }}>
          {message}
        </div>
      )}

      {/* Current Zip Status Card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileArchive size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                {zipInfo?.filename || 'Site_Builder_v2_29_09_26.zip'}
              </h3>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                Default Distribution Package
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge badge-${zipInfo?.exists ? 'success' : 'warning'}`}>
              {zipInfo?.exists ? 'Available for Download' : 'Missing on Server'}
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          background: '#090d16',
          padding: 20,
          borderRadius: 10,
          border: '1px solid var(--border-color)',
          marginBottom: 20
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>File Size</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
              {zipInfo?.size_formatted || '0 MB'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Last Updated</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
              {zipInfo?.updated_at || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Storage Engine</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#34d399', marginTop: 4 }}>
              Local /server/storage/zips
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href={getDirectDownloadUrl()}
            className="gradient-btn"
            style={{ padding: '10px 18px', fontSize: 13 }}
            download
          >
            <Download size={15} /> Test Direct Download
          </a>
          <button
            onClick={fetchZipInfo}
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: 13 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Info
          </button>
        </div>
      </div>

      {/* Upload New Release Card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Upload size={18} color="#818cf8" /> Upload Updated Release Package
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Select an updated <code style={{ color: '#818cf8' }}>.zip</code> archive to replace the active distribution bundle.
        </p>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 12,
            padding: 30,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.01)',
            cursor: 'pointer'
          }} onClick={() => document.getElementById('zip_upload_input').click()}>
            <Upload size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {selectedFile ? selectedFile.name : 'Click or Drag .zip file to upload'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
              {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Accepts .zip files up to 200MB'}
            </div>
            <input
              id="zip_upload_input"
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              onChange={e => setSelectedFile(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="gradient-btn"
            style={{ padding: 14, fontSize: 14 }}
          >
            {uploading ? <RefreshCw size={16} className="animate-spin" /> : 'Deploy New Zip Version'}
          </button>
        </form>
      </div>
    </div>
  );
}
