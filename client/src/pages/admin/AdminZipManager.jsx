import React, { useState, useEffect } from 'react';
import { 
  Package, Upload, Download, CheckCircle2, AlertTriangle, 
  RefreshCw, FileArchive, IndianRupee, Zap, Save, Check, Sparkles
} from 'lucide-react';
import { api, getApiBaseUrl } from '../../services/api';

export default function AdminZipManager() {
  const [zipInfo, setZipInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Real-time Pricing State
  const [price, setPrice] = useState(499);
  const [currentActivePrice, setCurrentActivePrice] = useState(499);
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMessage, setPriceMessage] = useState('');

  const formatDateTime = (rawDate) => {
    if (!rawDate || rawDate === 'N/A') return { date: 'N/A', time: '' };
    const str = String(rawDate).trim();
    const parts = str.split(' ');
    if (parts.length >= 2) {
      const dParts = parts[0].split('-');
      const tParts = parts[1].split(':');
      if (dParts.length === 3 && tParts.length >= 2) {
        const year = dParts[0];
        const month = dParts[1];
        const day = dParts[2];
        let hours = parseInt(tParts[0], 10);
        const minutes = tParts[1];
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = String(hours).padStart(2, '0');
        return {
          date: `${day}-${month}-${year}`,
          time: `${hoursStr}:${minutes} ${ampm}`
        };
      }
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, '0');
      return {
        date: `${day}-${month}-${year}`,
        time: `${hoursStr}:${minutes} ${ampm}`
      };
    }

    return { date: str, time: '' };
  };

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

  const fetchPrice = async () => {
    try {
      const res = await api.get('product/price');
      if (res.success && res.price) {
        setPrice(Number(res.price));
        setCurrentActivePrice(Number(res.price));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchZipInfo();
    fetchPrice();
  }, []);

  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      setPriceMessage('❌ Please enter a valid price greater than 0');
      return;
    }

    setSavingPrice(true);
    setPriceMessage('');

    try {
      const res = await api.post('admin/settings/price', { price: numPrice });
      if (res.success) {
        setCurrentActivePrice(numPrice);
        setPriceMessage(`✅ Live Razorpay price updated to ₹${numPrice.toLocaleString('en-IN')}!`);
        setTimeout(() => setPriceMessage(''), 4000);
      } else {
        setPriceMessage('❌ ' + (res.error || 'Failed to update price'));
      }
    } catch (err) {
      setPriceMessage('❌ Network error updating price');
    } finally {
      setSavingPrice(false);
    }
  };

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

  const formattedUpdate = formatDateTime(zipInfo?.updated_at);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Top Header */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Site Builder Package Distribution</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Manage the deployable zip archive, configure real-time Razorpay pricing, and upload updated distribution releases
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

      {/* 2-Column Responsive Grid for Core Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 24,
        width: '100%'
      }}>
        {/* Card 1: Current Zip Package Status */}
        <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileArchive size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                    {zipInfo?.filename || 'site_builder.zip'}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                    Default Distribution Package
                  </div>
                </div>
              </div>

              <span className={`badge badge-${zipInfo?.exists ? 'success' : 'warning'}`}>
                {zipInfo?.exists ? 'Available for Download' : 'Missing on Server'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              background: '#090d16',
              padding: 18,
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
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                  {formattedUpdate.date}
                </div>
                {formattedUpdate.time && (
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                    {formattedUpdate.time}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <a
              href={getDirectDownloadUrl()}
              className="gradient-btn"
              style={{ flex: 1, padding: '11px 18px', fontSize: 13, textDecoration: 'none' }}
              download
            >
              <Download size={15} /> Test Direct Download
            </a>
            <button
              onClick={fetchZipInfo}
              className="btn-secondary"
              style={{ padding: '11px 16px', fontSize: 13 }}
              title="Refresh package info"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Card 2: Real-time Pricing & Razorpay Adjustment */}
        <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IndianRupee size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>Package Pricing & Razorpay</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                    Live price applied on store checkout
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#090d16', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Active:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#34d399' }}>₹{currentActivePrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {priceMessage && (
              <div style={{
                background: priceMessage.startsWith('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${priceMessage.startsWith('✅') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: priceMessage.startsWith('✅') ? '#34d399' : '#f87171',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 12
              }}>
                {priceMessage}
              </div>
            )}

            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Adjust the price for client purchases. Changes update the public landing page and Razorpay order values instantly.
            </div>

            <form onSubmit={handlePriceUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#818cf8', fontWeight: 800, fontSize: 16 }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: 34, fontSize: 15, fontWeight: 700 }}
                    placeholder="499"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPrice}
                  className="gradient-btn"
                  style={{ padding: '12px 20px', fontSize: 13, whiteSpace: 'nowrap' }}
                >
                  {savingPrice ? <RefreshCw size={14} className="animate-spin" /> : <><Save size={14} /> Update Price</>}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>Presets:</span>
                {[299, 499, 799, 999].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPrice(preset)}
                    className="btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderColor: Number(price) === preset ? '#818cf8' : 'var(--border-color)',
                      background: Number(price) === preset ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: Number(price) === preset ? '#818cf8' : 'var(--text-muted)'
                    }}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Full-Width Upload New Release Card */}
      <div className="glass-card" style={{ padding: 28, width: '100%' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Upload size={18} color="#818cf8" /> Upload Updated Release Package
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Select an updated <code style={{ color: '#818cf8' }}>.zip</code> archive to replace the active distribution bundle. All new downloads will automatically serve this package.
        </p>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 12,
            padding: 36,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.01)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => document.getElementById('zip_upload_input').click()}>
            <Upload size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {selectedFile ? selectedFile.name : 'Click or Drag .zip file to upload'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
              {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ready for deployment` : 'Accepts standard .zip build archives up to 200MB'}
            </div>
            <input
              id="zip_upload_input"
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              onChange={e => setSelectedFile(e.target.files[0])}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="gradient-btn"
              style={{ padding: '12px 28px', fontSize: 14, minWidth: 200 }}
            >
              {uploading ? <RefreshCw size={16} className="animate-spin" /> : 'Deploy New Zip Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
