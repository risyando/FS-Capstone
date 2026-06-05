import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PROVINCES = [
  { id: 'aceh', name: 'Aceh', d: 'M30,30 L90,40 L70,90 L20,80 Z', lx: 55, ly: 62 },
  { id: 'sumut', name: 'Sumatera Utara', d: 'M40,90 L150,70 L180,150 L120,210 L60,200 Z', lx: 100, ly: 150 },
  { id: 'riau', name: 'Riau', d: 'M150,140 L240,130 L230,180 L140,200 Z', lx: 190, ly: 167 },
  { id: 'sumsel', name: 'Sumatera Selatan', d: 'M120,210 L230,180 L260,260 L180,300 L80,280 Z', lx: 170, ly: 240 },
  { id: 'lampung', name: 'Lampung', d: 'M180,300 L280,280 L300,340 L210,360 Z', lx: 240, ly: 328 },
  { id: 'jakarta', name: 'DKI Jakarta', d: 'M300,340 L360,330 L370,360 L310,370 Z', lx: 335, ly: 354, small: true },
  { id: 'jabar', name: 'Jawa Barat', d: 'M340,340 L430,330 L440,370 L350,380 Z', lx: 390, ly: 362, small: true },
  { id: 'jateng', name: 'Jawa Tengah', d: 'M430,330 L520,330 L530,370 L440,380 Z', lx: 480, ly: 358, small: true },
  { id: 'diy', name: 'DI Yogyakarta', d: 'M510,360 L555,355 L565,385 L515,388 Z', lx: 538, ly: 375, small: true, label: 'DIY' },
  { id: 'jatim', name: 'Jawa Timur', d: 'M530,330 L630,330 L640,375 L540,385 Z', lx: 585, ly: 358, small: true },
  { id: 'bali', name: 'Bali', d: 'M640,355 L680,350 L685,375 L645,380 Z', lx: 662, ly: 370, small: true },
  { id: 'ntb', name: 'Nusa Tenggara Barat', d: 'M700,350 L760,345 L770,380 L705,385 Z', lx: 735, ly: 370, small: true, label: 'NTB' },
  { id: 'ntt', name: 'Nusa Tenggara Timur', d: 'M780,350 L880,345 L890,390 L785,395 Z', lx: 833, ly: 373, label: 'NTT' },
  { id: 'kalbar', name: 'Kalimantan Barat', d: 'M310,180 L420,170 L420,260 L320,270 Z', lx: 368, ly: 222 },
  { id: 'kalteng', name: 'Kalimantan Tengah', d: 'M420,170 L500,170 L510,260 L420,260 Z', lx: 465, ly: 220, label: 'Kalteng' },
  { id: 'kalsel', name: 'Kalimantan Selatan', d: 'M510,200 L570,200 L575,265 L510,260 Z', lx: 540, ly: 236, label: 'Kalsel' },
  { id: 'kaltim', name: 'Kalimantan Timur', d: 'M500,90 L590,90 L600,200 L510,200 Z', lx: 548, ly: 150, label: 'Kaltim' },
  { id: 'sulut', name: 'Sulawesi Utara', d: 'M650,90 L720,90 L725,140 L660,150 Z', lx: 688, ly: 120 },
  { id: 'sulteng', name: 'Sulawesi Tengah', d: 'M650,150 L720,150 L725,220 L655,225 Z', lx: 688, ly: 190, label: 'Sulteng' },
  { id: 'sulsel', name: 'Sulawesi Selatan', d: 'M655,225 L720,220 L725,290 L660,290 Z', lx: 690, ly: 260, label: 'Sulsel' },
  { id: 'maluku', name: 'Maluku', d: 'M770,150 L830,150 L835,220 L775,225 Z', lx: 803, ly: 190 },
  { id: 'malut', name: 'Maluku Utara', d: 'M770,90 L825,90 L830,140 L775,145 Z', lx: 800, ly: 118, small: true },
  { id: 'papbar', name: 'Papua Barat', d: 'M850,150 L920,150 L925,230 L855,230 Z', lx: 887, ly: 195 },
  { id: 'papua', name: 'Papua', d: 'M925,150 L990,150 L990,260 L925,260 Z', lx: 958, ly: 210 },
];

const PINS = [
  { cx: 335, cy: 350, delay: 0 },
  { cx: 595, cy: 358, delay: 0.4 },
  { cx: 688, cy: 270, delay: 0.9 },
  { cx: 100, cy: 130, delay: 1.4 },
];

export default function IndonesiaMap() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  function handleClick(province) {
    navigate(`/jobs?province=${encodeURIComponent(province.name)}`);
  }

  function handleMouseEnter(province, e) {
    setHovered(province.id);
    const rect = e.currentTarget.closest('svg').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ show: true, text: province.name, x, y });
  }

  function handleMouseMove(e) {
    if (!tooltip.show) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip(prev => ({ ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top }));
  }

  function handleMouseLeave() {
    setHovered(null);
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 460"
        role="img"
        aria-label="Peta Indonesia"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: 900, height: 'auto', display: 'block', margin: '0 auto' }}
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id="rfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a4150" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#222731" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#161a23" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="rfillHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <radialGradient id="seaBg2" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0f1320" stopOpacity="0.0" />
            <stop offset="70%" stopColor="#070a12" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#03060c" stopOpacity="0.65" />
          </radialGradient>
          <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="pinH2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#c9ccd3" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c9ccd3" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1000" height="460" fill="url(#seaBg2)" />

        <g fontFamily="-apple-system, Segoe UI, Roboto, Arial, sans-serif">
          {PROVINCES.map(p => (
            <g
              key={p.id}
              onClick={() => handleClick(p)}
              onMouseEnter={e => handleMouseEnter(p, e)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={p.d}
                fill={hovered === p.id ? 'url(#rfillHover)' : 'url(#rfill)'}
                stroke={hovered === p.id ? 'rgba(165,180,252,0.8)' : 'rgba(255,255,255,0.22)'}
                strokeWidth="1"
                filter={hovered === p.id ? 'url(#glow2)' : 'none'}
                style={{
                  transition: 'fill .25s ease, stroke .25s ease, filter .25s ease, transform .15s ease',
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                  transform: hovered === p.id ? 'scale(1.03)' : 'scale(1)',
                }}
              />
              <text
                x={p.lx}
                y={p.ly}
                textAnchor="middle"
                fontSize={p.small ? 10 : 11}
                fill={hovered === p.id ? '#e0e7ff' : '#cfd3dc'}
                fontWeight="700"
                pointerEvents="none"
                letterSpacing="0.3"
                paintOrder="stroke fill"
                stroke="rgba(0,0,0,0.55)"
                strokeWidth="2.4"
              >
                {p.label || p.name}
              </text>
            </g>
          ))}
        </g>

        {/* City pins */}
        <g>
          {PINS.map((pin, i) => (
            <g key={i}>
              <circle cx={pin.cx} cy={pin.cy} r="9" fill="url(#pinH2)" style={{
                transformOrigin: `${pin.cx}px ${pin.cy}px`,
                animation: `mapPinPulse 2.6s ease-out infinite ${pin.delay}s`,
              }} />
              <circle cx={pin.cx} cy={pin.cy} r="2.5" fill="#ffffff" />
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 12,
          top: tooltip.y - 36,
          background: 'rgba(99,102,241,0.95)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'left .08s, top .08s',
        }}>
          {tooltip.text}
          <div style={{
            fontSize: 10,
            fontWeight: 400,
            opacity: 0.8,
            marginTop: 2,
          }}>Klik untuk lihat lowongan →</div>
        </div>
      )}

      <style>{`
        @keyframes mapPinPulse {
          0%   { transform: scale(0.6); opacity: 0.85; }
          70%  { transform: scale(2.0); opacity: 0; }
          100% { transform: scale(2.0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
