import React from 'react';

/**
 * Custom SVG icons with a "Sketchy Blueprint" aesthetic.
 * These fulfill the user's request for "Hand-drawn mix with Technical Blueprint".
 */

export const BlueprintSatellite = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Satellite Body - Slight Sketchy Offset */}
    <rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(-15 12 12)" />
    {/* Solar Panels - Blueprint Lines */}
    <path d="M4 11l4-1m0 0l-1-4m1 4l1 4" strokeDasharray="2 1" />
    <path d="M16 14l4 1m0 0l-1-4m1 4l1 4" strokeDasharray="2 1" />
    {/* Signal Waves - Hand Drawn feel */}
    <path d="M10 17c.5 2 2.5 3 4 2" strokeWidth="1" />
    <path d="M8 19c1 3 5 4 8 2" opacity="0.5" strokeWidth="1" />
  </svg>
);

export const BlueprintRadar = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 3v9l6 6" className="animate-pulse" />
    <path d="M12 12l4-4" strokeWidth="1" opacity="0.7" />
    {/* Sketchy crosshair */}
    <path d="M2 12h3m14 0h3M12 2v3m0 14v3" />
  </svg>
);

export const BlueprintSeismic = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 13h3l2-5 4 10 3-7 2 4h6" />
    {/* Grid background mini */}
    <path d="M2 18h20M2 8h20" strokeWidth="0.5" opacity="0.2" />
    <path d="M7 5v14M17 5v14" strokeWidth="0.5" opacity="0.2" />
  </svg>
);

export const BlueprintAlert = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L3 20h18L12 2z" />
    <path d="M12 9v4" />
    <circle cx="12" cy="17" r="0.5" fill={color} />
    {/* Sketchy outlines */}
    <path d="M11 4l-8 15m17 0L13 4" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

export const BlueprintMap = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
    <path d="M9 3v15M15 6v15" strokeDasharray="2 2" />
  </svg>
);

export const BlueprintShield = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 10l3 3 5-5" strokeWidth="1" strokeDasharray="3 1" />
  </svg>
);
