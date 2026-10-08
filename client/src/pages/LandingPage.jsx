import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, Globe, Download, CheckCircle2, Lock, ArrowRight, 
  Sparkles, Layers, RefreshCw, Copy, Check, Terminal, ExternalLink,
  Laptop, Server, Mail, Star, ShieldCheck, Play
} from 'lucide-react';
import { api, getApiBaseUrl } from '../services/api';

export default function LandingPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas');
  const [demoActive, setDemoActive] = useState(false);
  const [productPrice, setProductPrice] = useState(499);

  // Fetch real-time active price configured by admin
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get('product/price');
        if (res.success && res.price) {
          setProductPrice(Number(res.price));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrice();
  }, []);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please enter your name and email');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await api.post('payment/create-order', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        amount: productPrice
      });

      if (!res.success) {
        alert('Failed to initiate order: ' + (res.error || 'Server error'));
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const razorpayKey = res.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SgRf2CKVk35fBy';
      
      const options = {
        key: razorpayKey,
        amount: res.amount,
        currency: res.currency || 'INR',
        name: 'Custom Elementor Site Builder',
        description: 'Lifetime License & Site Builder Package',
        image: 'https://cdn-icons-png.flaticon.com/512/919/919830.png',
        order_id: res.order_id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone || ''
        },
        theme: {
          color: '#6366f1'
        },
        handler: async function (response) {
          // 3. Verify order on backend
          const verifyRes = await api.post('payment/verify-order', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone
          });

          setLoading(false);
          setShowCheckout(false);

          if (verifyRes.success) {
            setOrderSuccess(verifyRes);
          } else {
            alert('Verification failed: ' + (verifyRes.error || 'Unknown error'));
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout');
      setLoading(false);
    }
  };

  const copyLicenseKey = () => {
    if (orderSuccess?.license_key) {
      navigator.clipboard.writeText(orderSuccess.license_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadZipUrl = () => {
    const base = getApiBaseUrl();
    const keyParam = orderSuccess?.license_key ? `&key=${encodeURIComponent(orderSuccess.license_key)}` : '';
    return `${base}?route=zip/download${keyParam}`;
  };

  return (
    <div className="public-site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#090d16', color: '#f8fafc' }}>
      {/* Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        background: 'rgba(9, 13, 22, 0.85)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 20px var(--primary-glow)'
            }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
                Elementor<span className="gradient-text">ProBuilder</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>LICENSING SUITE</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#features" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Features</a>
            <a href="#demo" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Live Demo</a>
            <a href="#pricing" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Pricing</a>
            <button 
              onClick={() => setShowCheckout(true)} 
              className="gradient-btn"
              style={{ padding: '8px 18px', fontSize: 14 }}
            >
              <Download size={16} /> Buy License
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 300,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 80%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 9999,
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24
          }}>
            <Sparkles size={15} /> 6-Digit Domain Locking Engine & Automated Mailer
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: 24
          }}>
            Deploy & Protect Your <br />
            <span className="gradient-text">Custom Elementor Builder</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: 720,
            margin: '0 auto 36px'
          }}>
            Distribute our next-generation Site Builder package with automated 6-digit key generation, instant email delivery, domain telemetry, and central admin control.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowCheckout(true)} 
              className="gradient-btn"
              style={{ fontSize: 16, padding: '15px 32px' }}
            >
              <Zap size={18} /> Buy Instant License — ₹{productPrice.toLocaleString('en-IN')}
            </button>
            <a 
              href="#demo"
              className="btn-secondary"
              style={{ fontSize: 16, padding: '15px 28px' }}
            >
              <Play size={17} /> Explore Live Preview
            </a>
          </div>

          {/* Quick Metrics Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginTop: 50,
            textAlign: 'left'
          }}>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ color: '#38bdf8', marginBottom: 8 }}><ShieldCheck size={24} /></div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>100% Unique</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Guaranteed collision-free 6-digit keys</div>
            </div>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ color: '#34d399', marginBottom: 8 }}><Globe size={24} /></div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Domain Telemetry</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tracks localhost & live server bindings</div>
            </div>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ color: '#c084fc', marginBottom: 8 }}><Mail size={24} /></div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Instant Mailer</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Automated package & key delivery</div>
            </div>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ color: '#fbbf24', marginBottom: 8 }}><Server size={24} /></div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Zero Setup DB</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Portable SQLite self-hosted storage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Builder Mockup / Demo Section */}
      <section id="demo" style={{ padding: '60px 24px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1150, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="badge badge-purple" style={{ marginBottom: 12 }}>INTERACTIVE SHOWCASE</div>
            <h2 style={{ fontSize: 32, fontWeight: 800 }}>Standalone Visual Site Builder</h2>
            <p style={{ color: 'var(--text-muted)' }}>Experience how clients interact with the builder once activated with their 6-digit key.</p>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden', border: '1px solid #334155' }}>
            {/* Builder Window Header */}
            <div style={{
              background: '#0b0f19',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 13, color: 'var(--text-dim)', marginLeft: 10, fontFamily: 'var(--font-mono)' }}>
                  Site_Builder_v2_29_09_26 • Status: <span style={{ color: '#34d399' }}>Licensed & Active</span>
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="badge badge-success">Key: 749201</span>
                <span className="badge badge-info">Domain: localhost</span>
              </div>
            </div>

            {/* Builder Workplace Simulation */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', minHeight: 440 }}>
              {/* Left Widget Sidebar */}
              <div style={{ background: '#0d121f', borderRight: '1px solid var(--border-color)', padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 14 }}>
                  Widgets & Components
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {['Heading', 'Hero Section', 'Image Grid', 'Buttons', 'Contact Form', 'Slider'].map((item, idx) => (
                    <div key={idx} style={{
                      background: '#131a2c',
                      border: '1px solid var(--border-color)',
                      padding: '12px 8px',
                      borderRadius: 8,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <Layers size={16} style={{ margin: '0 auto 6px', color: '#818cf8' }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <div style={{ background: '#090d16', padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '100%',
                  maxWidth: 480,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
                  border: '2px dashed #6366f1',
                  borderRadius: 16,
                  padding: 30,
                  textAlign: 'center'
                }}>
                  <Sparkles size={32} style={{ color: '#a855f7', marginBottom: 12 }} />
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Live Visual Canvas</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Drag & drop elements, edit typography, customize colors, and export clean static HTML or WordPress pages.
                  </p>
                  <button 
                    onClick={() => setDemoActive(!demoActive)}
                    className="gradient-btn"
                    style={{ fontSize: 13, padding: '8px 18px' }}
                  >
                    {demoActive ? '✨ Animations Active' : '▶️ Trigger Live Preview'}
                  </button>
                </div>
              </div>

              {/* Right Settings Panel */}
              <div style={{ background: '#0d121f', borderLeft: '1px solid var(--border-color)', padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 14 }}>
                  Style & Properties
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Accent Gradient</label>
                    <div style={{ height: 32, borderRadius: 6, background: 'linear-gradient(90deg, #6366f1, #ec4899)', marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Layout Spacing</label>
                    <input type="range" className="input-field" style={{ padding: 0, height: 8, marginTop: 8 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>License Heartbeat</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399', marginTop: 6 }}>
                      <CheckCircle2 size={14} /> Telemetry Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div className="badge badge-info" style={{ marginBottom: 12 }}>SYSTEM CAPABILITIES</div>
            <h2 style={{ fontSize: 32, fontWeight: 800 }}>Complete Licensing & Distribution Architecture</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
              Engineered for agencies, developers, and theme sellers looking to securely distribute standalone Elementor builders.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div className="glass-card" style={{ padding: 30 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>6-Digit Domain Locking Engine</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Every customer receives a cryptographically generated 6-digit key. When deployed on localhost or live servers, the activation gate binds the domain and unlocks the editor.
              </p>
            </div>

            <div className="glass-card" style={{ padding: 30 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Globe size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Domain Telemetry & Live Map</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                The centralized admin dashboard tracks client IPs, domains, heartbeat pings, and deployment dates in real time. Remote suspend or revoke keys with one click.
              </p>
            </div>

            <div className="glass-card" style={{ padding: 30 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(236,72,153,0.15)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Mail size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Automated Email Dispatch</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Integrated directly with the custom Email Service API. Immediately delivers a beautiful HTML confirmation email with the 6-digit key and direct zip download link.
              </p>
            </div>

            <div className="glass-card" style={{ padding: 30 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Server size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Zero-Setup SQLite Backend</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                No complex database credentials or MySQL creation needed. Uses high-concurrency WAL-mode SQLite database that self-initializes on first launch.
              </p>
            </div>

            <div className="glass-card" style={{ padding: 30 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Terminal size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>100% Path-Independent</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                The React client builds with relative assets (<code style={{ color: '#fbbf24' }}>base: './'</code>). Drop the contents into any root domain or subfolder without rewriting code.
              </p>
            </div>

            <div className="glass-card" style={{ padding: 30 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(168,85,247,0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Admin Recovery & Auth</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Protected admin portal at <code style={{ color: '#c084fc' }}>/#/admin</code> with JWT auth, forgot password tokens, and instant password recovery via email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 650, margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-success" style={{ marginBottom: 12 }}>LIFETIME ACCESS</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Simple, Transparent Pricing</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>
            Get instant access to the builder package, 6-digit license key, and full source files.
          </p>

          <div className="glass-card" style={{ padding: 40, border: '2px solid rgba(99, 102, 241, 0.4)', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: -14,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              padding: '4px 16px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1
            }}>
              SPECIAL LAUNCH OFFER
            </div>

            <div style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 10 }}>
              Site Builder Package v2
            </div>

            <div style={{ fontSize: 54, fontWeight: 800, margin: '16px 0', color: '#f8fafc' }}>
              ₹{productPrice.toLocaleString('en-IN')} <span style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 500 }}>/ one-time</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', margin: '30px 0' }}>
              {[
                'Full Site Builder v2 (.zip package)',
                'Unique 6-Digit Collision-Free License Key',
                'Instant Email Delivery with Download Link',
                'Deploy on Localhost & Live Servers',
                'Unlimited Page Exports & Custom Layouts',
                'Lifetime Updates & Telemetry Support'
              ].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowCheckout(true)}
              className="gradient-btn"
              style={{ width: '100%', padding: '16px 24px', fontSize: 16, borderRadius: 12 }}
            >
              <Zap size={18} /> Buy Now with Razorpay
            </button>

            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <ShieldCheck size={14} /> 256-bit Encrypted Checkout • Instant 6-Digit Key
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '32px 24px',
        textAlign: 'center',
        background: '#070a12',
        color: 'var(--text-dim)',
        fontSize: 13
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} style={{ color: '#818cf8' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>ElementorProBuilder Platform</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Custom Elementor & Site Builder Suite. All rights reserved.
          </div>
          <div>
            <a href="#/admin" style={{ color: '#818cf8', fontWeight: 600 }}>Admin Login &rarr;</a>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-backdrop" onClick={() => !loading && setShowCheckout(false)}>
          <div className="glass-card" style={{ maxWidth: 460, width: '100%', padding: 32, background: '#111726' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>Complete Your Purchase</h3>
              <button 
                onClick={() => !loading && setShowCheckout(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Enter your details to receive your <strong>6-digit license key</strong> and download link via email.
            </p>

            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email Address (for key delivery) *</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. john@example.com"
                  className="input-field"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9876543210"
                  className="input-field"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div style={{ background: '#0b0f19', padding: 14, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8' }}>₹{productPrice.toLocaleString('en-IN')} INR</span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="gradient-btn"
                style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }}
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <><Zap size={16} /> Pay ₹{productPrice.toLocaleString('en-IN')} via Razorpay</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Instant Order Success & Email Delivery Confirmation Modal */}
      {orderSuccess && (
        <div className="modal-backdrop">
          <div className="glass-card" style={{ maxWidth: 540, width: '100%', padding: 36, background: '#111726', textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={38} />
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Payment Successful!</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Your order has been completed and processed.
            </p>

            <div style={{
              background: '#090d16',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 12,
              padding: '20px 24px',
              textAlign: 'left',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: '#38bdf8', fontWeight: 700, fontSize: 15 }}>
                <Mail size={18} /> Dispatched to Your Email
              </div>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                We have sent your <strong>Site Builder Zip package download link</strong> along with your <strong>unique 6-digit license access key</strong> directly to:
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '8px 12px',
                borderRadius: 6,
                marginTop: 10,
                fontSize: 13,
                fontWeight: 600,
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)'
              }}>
                ✉️ {formData.email || 'your submitted email address'}
              </div>
            </div>

            {/* Important Activation Note */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 10,
              padding: '14px 18px',
              textAlign: 'left',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>
                ⚠️ Important Activation Policy:
              </div>
              <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>
                You can download the zip package <strong>multiple times</strong> from your email link, but your 6-digit access key can only be activated <strong>one time</strong> (it will be permanently locked to your first deployment domain/localhost).
              </div>
            </div>

            <button 
              onClick={() => {
                setOrderSuccess(null);
                setFormData({ name: '', email: '', phone: '' });
              }}
              className="gradient-btn"
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
            >
              Done & Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
