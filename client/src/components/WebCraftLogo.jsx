import React from 'react';

export default function WebCraftLogo({ size = 36, showText = true, subtitle = 'STUDIO', textSize = 17 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', userSelect: 'none' }}>
      {/* Geometric 'W' + 'C' Vector Icon Badge */}
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="logoWCGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="logoWCAccent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container */}
        <rect width="64" height="64" rx="16" fill="#0d1322" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />

        {/* Left Wing of W */}
        <path d="M15 20L23 44L28 32L24 20H15Z" fill="url(#logoWCGrad)" />
        
        {/* Right Wing of W */}
        <path d="M49 20L41 44L36 32L40 20H49Z" fill="url(#logoWCGrad)" />
        
        {/* Center Diamond / Craft Node */}
        <polygon points="32,24 38,34 32,44 26,34" fill="url(#logoWCAccent)" />
        
        {/* Glowing Center Core */}
        <circle cx="32" cy="34" r="2.5" fill="#ffffff" />
      </svg>

      {/* Stylized Brand Typography */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{
            fontWeight: 800,
            fontSize: textSize,
            letterSpacing: '-0.4px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>Web</span>
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800
            }}>
              Craft
            </span>
            {subtitle && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8',
                padding: '2px 6px',
                borderRadius: 5,
                border: '1px solid rgba(6, 182, 212, 0.3)',
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
