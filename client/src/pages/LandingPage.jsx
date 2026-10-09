import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, Globe, Download, CheckCircle2, Lock, ArrowRight, 
  Sparkles, Layers, RefreshCw, Copy, Check, ExternalLink,
  Laptop, Server, Mail, Star, ShieldCheck, Play, Video,
  ChevronRight, Menu, X, HelpCircle, Code2, Rocket, Key,
  Palette, Cpu, Compass
} from 'lucide-react';
import WebCraftLogo from '../components/WebCraftLogo';
import { api, getApiBaseUrl } from '../services/api';

export default function LandingPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [productPrice, setProductPrice] = useState(299);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState('canvas');
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch real-time active price configured by admin
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get('product/price');
        if (res && res.success && res.price) {
          setProductPrice(Number(res.price));
        }
      } catch (err) {
        console.error('Error fetching dynamic price:', err);
      }
    };
    fetchPrice();
  }, []);

  // Load Razorpay Script dynamically
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
        name: 'WebCraft Studio',
        description: 'Lifetime Standalone License & Visual Builder Package',
        image: 'https://cdn-icons-png.flaticon.com/512/919/919830.png',
        order_id: res.order_id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone || ''
        },
        theme: {
          color: '#4f46e5'
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

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Does WebCraft Studio require WordPress or MySQL to run?',
      a: 'No! WebCraft Studio is a 100% standalone visual site builder and deployment suite. It runs instantly on any local server (XAMPP/WAMP) or live hosting (cPanel, DirectAdmin, VPS) with zero database setup required.'
    },
    {
      q: 'How do I receive my 6-digit license key and ZIP download?',
      a: 'Delivery is 100% automated and instant. As soon as your Razorpay payment completes, your unique 6-digit license key and ZIP package appear on screen and are simultaneously dispatched to your email inbox with access to your Customer Download Portal.'
    },
    {
      q: 'Can I test and build locally on localhost before deploying to live hosting?',
      a: 'Yes! Your license activates smoothly on localhost for development and can be deployed directly to your live client domain with automated telemetry bindings.'
    },
    {
      q: 'Is this a one-time payment or a recurring subscription?',
      a: 'This is a single one-time payment for lifetime access, updates, and commercial usage rights to craft unlimited client websites.'
    }
  ];

  return (
    <div className="public-site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050814', color: '#f8fafc' }}>
      
      {/* 1. Header & Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        background: 'rgba(5, 8, 20, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 24px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo with Custom WebCraft Symbol */}
          <a href="#" style={{ textDecoration: 'none' }}>
            <WebCraftLogo size={34} textSize={17} subtitle="STUDIO" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <button onClick={() => scrollToSection('overview')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>
              Overview
            </button>
            <button onClick={() => scrollToSection('video-showcase')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>
              Live Demo & Video
            </button>
            <button onClick={() => scrollToSection('benefits')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>
              Key Benefits
            </button>
            <button onClick={() => scrollToSection('pricing')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>
              Pricing
            </button>
            <button onClick={() => scrollToSection('faq')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>
              FAQ
            </button>
          </nav>

          {/* Header Action CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setShowCheckout(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 50%, #9333ea 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Zap size={15} />
              <span>Get Access — ₹{productPrice}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '8px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'none'
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: 'rgba(10, 15, 28, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 14,
            borderRadius: 12
          }}>
            <button onClick={() => scrollToSection('overview')} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: 16, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              Overview
            </button>
            <button onClick={() => scrollToSection('video-showcase')} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: 16, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              Live Demo & Video
            </button>
            <button onClick={() => scrollToSection('benefits')} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: 16, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              Key Benefits
            </button>
            <button onClick={() => scrollToSection('pricing')} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: 16, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              Pricing & Instant Purchase
            </button>
            <button onClick={() => scrollToSection('faq')} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: 16, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              Frequently Asked Questions
            </button>
          </div>
        )}
      </header>

      {/* 2. High-Impact Hero Section (Full Viewport Screen) */}
      <section id="overview" style={{
        minHeight: 'calc(100vh - 58px)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 10%, rgba(6, 182, 212, 0.15) 0%, rgba(79, 70, 229, 0.12) 40%, rgba(5, 8, 20, 0) 75%)'
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          
          {/* Brand Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 14px',
            borderRadius: 999,
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            marginBottom: 16,
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)'
          }}>
            <Sparkles size={14} color="#38bdf8" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e0f2fe', letterSpacing: '0.3px' }}>
              Craft Custom Websites • Standalone Visual Builder & Instant Deploy
            </span>
          </div>

          {/* Main H1 Headline */}
          <h1 style={{
            fontSize: 'clamp(28px, 3.6vw, 44px)',
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: '-1px',
            marginBottom: 14,
            color: '#ffffff'
          }}>
            Craft, Customize & Deploy Custom Websites <br />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Directly on Any Server
            </span>
          </h1>

          {/* Visual Subtitle (Concise, Low Height) */}
          <p style={{
            fontSize: 'clamp(14px, 1.4vw, 16px)',
            color: '#94a3b8',
            maxWidth: 680,
            margin: '0 auto 22px',
            lineHeight: 1.5,
            fontWeight: 400
          }}>
            <strong>WebCraft Studio</strong> delivers a standalone drag-and-drop web creation engine with zero database setup.
            Buy once, craft custom pages visually, and deploy directly with automated 6-digit key protection.
          </p>

          {/* Hero Call-to-Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 26 }}>
            <button
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setShowCheckout(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 50%, #9333ea 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '13px 26px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                boxShadow: '0 6px 24px rgba(6, 182, 212, 0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <Zap size={16} />
              <span>Get WebCraft Studio — ₹{productPrice}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => scrollToSection('video-showcase')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                padding: '13px 22px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                transition: 'background 0.2s'
              }}
            >
              <Play size={15} color="#38bdf8" />
              <span>Watch Studio Demo</span>
            </button>
          </div>

          {/* 4 Trust Highlights (Compact, Fully Visible on First Viewport Horizon) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
            maxWidth: 980,
            margin: '0 auto',
            textAlign: 'left'
          }}>
            {[
              { icon: ShieldCheck, title: 'Instant 6-Digit Key', desc: 'Collision-free license generated on purchase', color: '#38bdf8' },
              { icon: Globe, title: 'Direct Deployment', desc: 'Deploy on XAMPP, cPanel, VPS without MySQL', color: '#818cf8' },
              { icon: Mail, title: 'Instant Mailer', desc: 'Key and ZIP delivered to your inbox & portal', color: '#c084fc' },
              { icon: Server, title: 'Zero Database Lock-in', desc: 'Powered by embedded SQLite engine', color: '#34d399' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="glow-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{
                    width: 32,
                    minWidth: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3, marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Dedicated Video & Product Showcase Section */}
      <section id="video-showcase" style={{
        padding: '70px 24px',
        background: 'linear-gradient(180deg, rgba(5, 8, 20, 0.8) 0%, rgba(11, 17, 34, 0.95) 50%, rgba(5, 8, 20, 0.8) 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#38bdf8',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: 14
            }}>
              <Video size={14} /> Interactive Studio Demonstration
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 12 }}>
              See WebCraft Studio in Action
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 620, margin: '0 auto' }}>
              Experience visual drag-and-drop customization, live style inspections, and instantaneous standalone deployment.
            </p>
          </div>

          {/* Interactive Showcase Mockup Frame */}
          <div className="video-frame" style={{ maxWidth: 1040, margin: '0 auto', borderColor: 'rgba(6, 182, 212, 0.25)' }}>
            
            {/* Top Browser Bar Mockup */}
            <div style={{
              background: 'rgba(10, 15, 28, 0.95)',
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 12, fontFamily: 'var(--font-mono)' }}>
                  WebCraft_Studio_v2.0 • Standalone Canvas
                </span>
              </div>

              {/* Showcase Tabs */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'canvas', label: '🎨 Visual Canvas' },
                  { id: 'activation', label: '🔑 Instant Activation' },
                  { id: 'export', label: '⚡ Clean Code Export' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDemoTab(tab.id)}
                    style={{
                      background: activeDemoTab === tab.id ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: activeDemoTab === tab.id ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid transparent',
                      color: activeDemoTab === tab.id ? '#e0f2fe' : '#94a3b8',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video / Interactive Canvas Area */}
            <div style={{
              position: 'relative',
              minHeight: 460,
              background: '#070b18',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px 20px',
              overflow: 'hidden'
            }}>
              
              {/* Tab 1: Visual Canvas Preview */}
              {activeDemoTab === 'canvas' && (
                <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '220px 1fr 220px', gap: 16, height: '100%' }}>
                  
                  {/* Left Widget Sidebar */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 10 }}>
                      Widgets & Blocks
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {['Header Block', 'Hero Banner', 'Action Button', 'Feature Matrix', 'Pricing Table', 'Contact Form'].map((w, i) => (
                        <div key={i} style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px dashed rgba(255,255,255,0.15)',
                          borderRadius: 8,
                          padding: '10px 6px',
                          textAlign: 'center',
                          fontSize: 11,
                          color: '#cbd5e1',
                          cursor: 'grab'
                        }}>
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center Canvas */}
                  <div style={{
                    background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.12) 0%, rgba(9, 13, 24, 0.95) 100%)',
                    borderRadius: 12,
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      marginBottom: 16,
                      boxShadow: '0 0 30px rgba(6, 182, 212, 0.5)'
                    }}>
                      <Play size={24} style={{ marginLeft: 3 }} />
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
                      WebCraft Studio Visual Canvas
                    </div>
                    <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 360, lineHeight: 1.5, marginBottom: 18 }}>
                      Craft custom websites visually with real-time style controls and 100% path independence.
                    </p>

                    <button
                      onClick={() => setShowCheckout(true)}
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Zap size={14} /> Buy & Launch Studio
                    </button>
                  </div>

                  {/* Right Style Inspector */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 10 }}>
                      Style Inspector
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>ACCENT GRADIENT</div>
                        <div style={{ height: 16, borderRadius: 4, background: 'linear-gradient(90deg, #06b6d4, #818cf8)' }}></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>BORDER RADIUS</div>
                        <input type="range" defaultValue={14} readOnly style={{ width: '100%', accentColor: '#06b6d4' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        ✓ Telemetry Linked
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: 6-Digit License Activation */}
              {activeDemoTab === 'activation' && (
                <div style={{ maxWidth: 440, width: '100%', background: 'rgba(15, 23, 42, 0.9)', padding: '32px 28px', borderRadius: 16, border: '1px solid rgba(6, 182, 212, 0.35)', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Key size={24} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Enter 6-Digit Access Key</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
                    Received upon purchase. Binds automatically to your domain.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                    {['V', 'T', '4', 'N', '5', 'P'].map((char, i) => (
                      <div key={i} style={{ width: 42, height: 48, borderRadius: 8, background: '#070c18', border: '1px solid #06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                        {char}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                    ✓ Status: Activated on localhost / client.domain
                  </div>
                </div>
              )}

              {/* Tab 3: Clean Code Export */}
              {activeDemoTab === 'export' && (
                <div style={{ maxWidth: 540, width: '100%', background: '#050811', padding: '24px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94a3b8', textAlign: 'left' }}>
                  <div style={{ color: '#06b6d4', marginBottom: 8 }}>// WebCraft Studio Export Output</div>
                  <div>&lt;<span style={{ color: '#f43f5e' }}>section</span> <span style={{ color: '#38bdf8' }}>class</span>=<span style={{ color: '#34d399' }}>"webcraft-hero"</span>&gt;</div>
                  <div style={{ paddingLeft: 16 }}>&lt;<span style={{ color: '#f43f5e' }}>h1</span>&gt;Crafted Without Limits&lt;/<span style={{ color: '#f43f5e' }}>h1</span>&gt;</div>
                  <div style={{ paddingLeft: 16 }}>&lt;<span style={{ color: '#f43f5e' }}>button</span> <span style={{ color: '#38bdf8' }}>class</span>=<span style={{ color: '#34d399' }}>"btn-craft"</span>&gt;Explore&lt;/<span style={{ color: '#f43f5e' }}>button</span>&gt;</div>
                  <div>&lt;/<span style={{ color: '#f43f5e' }}>section</span>&gt;</div>
                  <div style={{ marginTop: 14, color: '#34d399', fontSize: 11 }}>
                    ✓ 100% Path-Independent HTML/CSS • Instant Load Speeds
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* 4. Core Business Benefits (Iconic Grid, Low Reading) */}
      <section id="benefits" style={{ padding: '80px 24px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: 14
          }}>
            <ShieldCheck size={14} /> Crafted For Web Professionals & Agencies
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 12 }}>
            Engineered for Maximum Speed & Freedom
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
            Everything you need to craft custom sites and deploy standalone packages instantly.
          </p>
        </div>

        {/* 6 High-Impact Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24
        }}>
          {[
            {
              icon: Server,
              title: 'Zero Database Lock-in',
              badge: 'Embedded SQLite',
              color: '#38bdf8',
              desc: 'No MySQL servers or migrations needed. Runs directly on high-performance embedded SQLite out-of-the-box.'
            },
            {
              icon: Key,
              title: '6-Digit Domain Locking',
              badge: 'Automated Security',
              color: '#818cf8',
              desc: 'Cryptographic 6-digit license keys automatically lock to client domains or localhost upon first activation.'
            },
            {
              icon: Globe,
              title: 'Real-Time Domain Telemetry',
              badge: 'Live Tracking',
              color: '#34d399',
              desc: 'Automatic IP detection, binding timestamp, and active status telemetry without intrusive client overhead.'
            },
            {
              icon: Mail,
              title: 'Instant Automated Mailer',
              badge: 'Zero Waiting',
              color: '#c084fc',
              desc: 'Automated confirmation email delivers your 6-digit access key and direct access to your Customer Portal.'
            },
            {
              icon: Layers,
              title: '100% Path-Independent',
              badge: 'Ultra Portable',
              color: '#fbbf24',
              desc: 'Extract anywhere—subfolders, local hosts, or root domains. Absolute paths are resolved automatically.'
            },
            {
              icon: ShieldCheck,
              title: 'Lifetime Commercial Freedom',
              badge: 'Single Payment',
              color: '#f43f5e',
              desc: 'Single license gives you full commercial rights to craft unlimited client landing pages and prototypes.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glow-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `rgba(6, 182, 212, 0.1)`,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.color,
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {item.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, flex: 1 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </section>

      {/* 5. 3-Step Infographic Flow */}
      <section id="how-it-works" style={{
        padding: '70px 24px',
        background: 'rgba(10, 15, 28, 0.6)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, marginBottom: 12 }}>
            Simple 3-Step Deployment Process
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 500, margin: '0 auto 40px' }}>
            Get your standalone builder running and deployed in under 2 minutes.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            textAlign: 'left'
          }}>
            {[
              { step: '01', title: 'Instant Purchase', desc: 'Pay securely via Razorpay (Cards/UPI) and receive your 6-digit key + portal link instantly.' },
              { step: '02', title: 'Drop & Extract', desc: 'Extract the package to your XAMPP, cPanel, or VPS folder. Zero database configuration needed.' },
              { step: '03', title: 'Activate & Deploy', desc: 'Enter your 6-digit key upon launch. The studio locks to your domain and unlocks the visual canvas.' }
            ].map((s, idx) => (
              <div key={idx} className="glow-card" style={{ padding: '24px 20px', position: 'relative' }}>
                <div style={{
                  fontSize: 32,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 12,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {s.step}
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#f8fafc' }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Dynamic Pricing & Checkout Section */}
      <section id="pricing" style={{ padding: '90px 24px 70px', position: 'relative' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: 14
          }}>
            <Sparkles size={14} /> Lifetime Commercial Access
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 12 }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 36 }}>
            Pay once and own the WebCraft Studio package forever.
          </p>

          {/* Pricing Box Card */}
          <div className="glow-card" style={{
            padding: '40px 32px',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            boxShadow: '0 20px 60px -15px rgba(6, 182, 212, 0.25)',
            textAlign: 'left'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>WebCraft Studio Suite v2.0</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Lifetime updates & commercial license</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', display: 'flex', alignItems: 'center' }}>
                  ₹{productPrice}
                </div>
                <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>One-time payment</div>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              {[
                'Full Standalone WebCraft Studio ZIP package',
                'Unique 6-Digit Collision-Free License Key',
                'Customer Download & Activation Portal Access',
                'Automatic Localhost & Live Domain Telemetry',
                'Instant Automated Email Confirmation',
                'Zero MySQL Database Configuration Required',
                '100% Path-Independent & Subfolder Portable',
                'Commercial License — Craft Unlimited Client Pages'
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color="#38bdf8" style={{ minWidth: 16 }} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Buy CTA Button */}
            <button
              onClick={() => setShowCheckout(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 50%, #9333ea 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '16px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <Zap size={18} />
              <span>Buy Now with Razorpay — ₹{productPrice}</span>
            </button>

          </div>

        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" style={{ padding: '40px 24px 80px', maxWidth: 840, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, marginBottom: 8 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Quick answers about installation, licensing, and usage.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="glow-card" 
                style={{ padding: '18px 22px', cursor: 'pointer' }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
                    {faq.q}
                  </div>
                  <ChevronRight 
                    size={18} 
                    color="#38bdf8" 
                    style={{ 
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      minWidth: 18
                    }} 
                  />
                </div>
                {isOpen && (
                  <p style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Professional Business Footer */}
      <footer style={{
        marginTop: 'auto',
        background: '#040711',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '50px 24px 30px'
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
            paddingBottom: 30,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {/* Logo & Description */}
            <div style={{ maxWidth: 380 }}>
              <WebCraftLogo size={34} textSize={17} subtitle="STUDIO" />
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginTop: 12 }}>
                Next-generation standalone visual website builder & direct deployment studio. Fast, lightweight, and independent.
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <button onClick={() => scrollToSection('overview')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Overview</button>
              <button onClick={() => scrollToSection('video-showcase')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Demo</button>
              <button onClick={() => scrollToSection('benefits')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Benefits</button>
              <button onClick={() => scrollToSection('pricing')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Pricing</button>
              <button onClick={() => scrollToSection('faq')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>FAQ</button>
            </div>
          </div>

          {/* Bottom Copyright & AllySoft Solutions Credit */}
          <div style={{
            paddingTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
            color: '#64748b'
          }}>
            <div>
              © {new Date().getFullYear()} WebCraft Studio. All rights reserved.
            </div>

            {/* Prominent Footer Credit */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(6, 182, 212, 0.08)',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(6, 182, 212, 0.25)',
              color: '#cbd5e1',
              fontWeight: 600
            }}>
              <span>Developed by</span>
              <strong style={{
                background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}>
                AllySoft Solutions
              </strong>
            </div>
          </div>

        </div>
      </footer>

      {/* 9. Razorpay Checkout Modal */}
      {showCheckout && (
        <div className="modal-backdrop" onClick={() => !loading && setShowCheckout(false)}>
          <div 
            className="glow-card" 
            style={{ maxWidth: 460, width: '100%', padding: '32px 28px', background: '#0b0f19', border: '1px solid rgba(6, 182, 212, 0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <WebCraftLogo size={32} showText={false} />
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800 }}>Complete Your Purchase</h3>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>Amount: <strong style={{ color: '#fff' }}>₹{productPrice}</strong></p>
                </div>
              </div>
              <button onClick={() => setShowCheckout(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Your Full Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Email Address (For Key Delivery) *</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} />
                <span>Instant automated 6-digit license delivery to your email</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 50%, #9333ea 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6
                }}
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <><Lock size={16} /> Pay ₹{productPrice} via Razorpay</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. Order Success & Key Reveal Modal */}
      {orderSuccess && (
        <div className="modal-backdrop">
          <div 
            className="glow-card" 
            style={{ maxWidth: 500, width: '100%', padding: '36px 30px', background: '#0b0f19', border: '1px solid rgba(6, 182, 212, 0.4)', textAlign: 'center' }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Payment Successful!</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
              Your 6-digit access key is ready and has been dispatched to <strong>{formData.email}</strong>.
            </p>

            {/* License Key Box */}
            <div style={{ background: '#050811', padding: '18px', borderRadius: 12, border: '1px dashed rgba(6, 182, 212, 0.4)', marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8 }}>
                YOUR 6-DIGIT ACTIVATION KEY
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', letterSpacing: '4px', marginBottom: 12 }}>
                {orderSuccess.license_key}
              </div>
              <button
                onClick={copyLicenseKey}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: copied ? '#38bdf8' : '#fff',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Key Copied!' : 'Copy License Key'}</span>
              </button>
            </div>

            {/* Direct ZIP Download */}
            <a
              href={downloadZipUrl()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%)',
                color: '#fff',
                textDecoration: 'none',
                padding: '14px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 15,
                marginBottom: 16
              }}
            >
              <Download size={18} /> Download WebCraft Studio Package
            </a>

            {/* Email Dispatch Notice */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 12.5,
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              marginBottom: 16,
              lineHeight: 1.5
            }}>
              <Mail size={22} color="#38bdf8" style={{ minWidth: 22 }} />
              <div>
                <span>Your <strong>ZIP package download link</strong> and <strong>license access key</strong> have also been sent to your submitted email: <strong style={{ color: '#38bdf8' }}>{formData.email}</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccess(null)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', marginTop: 8 }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
