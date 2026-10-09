import React, { useState, useEffect } from 'react';
import { 
  Download, Key, CheckCircle2, Copy, Check, Zap, Globe, 
  Laptop, ShieldCheck, ArrowRight, RefreshCw, FileText
} from 'lucide-react';
import WebCraftLogo from '../components/WebCraftLogo';
import { getApiBaseUrl, api } from '../services/api';

export default function DownloadPortal() {
  const [licenseKey, setLicenseKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [zipInfo, setZipInfo] = useState({ filename: 'WebCraft_Studio_v2.zip', size_formatted: '1.27 MB' });

  useEffect(() => {
    // Parse key from hash (e.g. #/download?key=VT4N5P) or search
    const hashPart = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const params = new URLSearchParams(hashPart || window.location.search);
    const key = params.get('key') || params.get('license_key') || '';
    setLicenseKey(key.trim().toUpperCase());

    // Fetch zip info
    api.get('zip/info').then(res => {
      if (res && res.success && res.filename) {
        setZipInfo(res);
      }
    }).catch(err => console.error(err));
  }, []);

  const copyKey = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDirectDownloadUrl = () => {
    const base = getApiBaseUrl();
    const keyParam = licenseKey ? `&key=${encodeURIComponent(licenseKey)}` : '';
    return `${base}?route=zip/download${keyParam}`;
  };

  const handleDownloadClick = () => {
    setDownloading(true);
    const downloadUrl = getDirectDownloadUrl();
    
    // Trigger download via anchor to prevent mixed-content block
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', zipInfo.filename || 'WebCraft_Studio_Package.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
    }, 2500);
  };

  return (
    <div className="public-site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050814', color: '#f8fafc' }}>
      
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(5, 8, 20, 0.92)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#/" style={{ textDecoration: 'none' }}>
            <WebCraftLogo size={36} textSize={17} subtitle="STUDIO" />
          </a>

          <a
            href="#/"
            style={{
              fontSize: 13,
              color: '#94a3b8',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            ← Back to Store
          </a>
        </div>
      </header>

      {/* Main Download & Portal Body */}
      <main style={{ flex: 1, padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 680, width: '100%' }}>
          
          <div className="glow-card" style={{
            padding: '40px 32px',
            background: 'radial-gradient(circle at top, rgba(6, 182, 212, 0.12), rgba(11, 15, 25, 0.95))',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
          }}>
            
            {/* Top Success Badge */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <ShieldCheck size={32} />
              </div>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, marginBottom: 6 }}>
                Customer License & Download Portal
              </h1>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>
                Your WebCraft Studio software package is verified and ready for deployment.
              </p>
            </div>

            {/* License Key Display Box */}
            <div style={{
              background: '#070a12',
              border: '1px dashed rgba(6, 182, 212, 0.4)',
              borderRadius: 14,
              padding: '24px 20px',
              textAlign: 'center',
              marginBottom: 28
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                YOUR 6-DIGIT ACTIVATION KEY
              </div>
              
              <div style={{
                fontSize: 'clamp(28px, 6vw, 42px)',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '6px',
                marginBottom: 14
              }}>
                {licenseKey || 'VT4N5P'}
              </div>

              <button
                onClick={copyKey}
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: copied ? '#38bdf8' : '#e0f2fe',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'License Key Copied!' : 'Copy 6-Digit Key'}</span>
              </button>
            </div>

            {/* Primary Download Button */}
            <div style={{ marginBottom: 32 }}>
              <button
                onClick={handleDownloadClick}
                disabled={downloading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 50%, #9333ea 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '18px 24px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 17,
                  cursor: downloading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  boxShadow: '0 10px 30px rgba(6, 182, 212, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {downloading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Preparing & Starting Download...</span>
                  </>
                ) : (
                  <>
                    <Download size={22} />
                    <span>Download WebCraft Studio ZIP ({zipInfo.size_formatted || '1.27 MB'})</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#64748b' }}>
                Direct file download • Compatible with Windows, Mac, Linux, and Mobile
              </div>
            </div>

            {/* 3-Step Setup Instructions */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px 22px'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} color="#38bdf8" />
                <span>Quick Deployment Steps:</span>
              </div>
              
              <ol style={{ margin: 0, paddingLeft: 18, color: '#94a3b8', fontSize: 13, lineHeight: 1.8 }}>
                <li>
                  <strong style={{ color: '#e2e8f0' }}>Extract:</strong> Unzip the downloaded package into your web server folder (e.g. <code style={{ color: '#38bdf8' }}>htdocs/my-site</code>, cPanel, or VPS).
                </li>
                <li>
                  <strong style={{ color: '#e2e8f0' }}>Open in Browser:</strong> Navigate to your site URL (e.g. <code style={{ color: '#38bdf8' }}>http://localhost/my-site/</code>).
                </li>
                <li>
                  <strong style={{ color: '#e2e8f0' }}>Activate:</strong> Enter your 6-digit key: <code style={{ color: '#38bdf8', fontWeight: 700 }}>{licenseKey || 'VT4N5P'}</code> to bind your domain and launch WebCraft Studio!
                </li>
              </ol>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: 12,
        color: '#64748b'
      }}>
        <div>© {new Date().getFullYear()} WebCraft Studio. All rights reserved.</div>
        <div style={{ marginTop: 6 }}>
          Developed by <strong style={{ color: '#38bdf8' }}>AllySoft Solutions</strong>
        </div>
      </footer>

    </div>
  );
}
