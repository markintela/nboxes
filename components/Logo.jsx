import React from "react";
import { pal } from "@/lib/theme";

export function NBoxIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="32" height="23" rx="3" stroke={pal.amber} strokeWidth="2.5" />
      <rect x="11" y="6" width="6" height="6" rx="1" fill={pal.amber} />
      <rect x="23" y="6" width="6" height="6" rx="1" fill={pal.amber} />
      <path d="M22 14 L13.5 24.5 L18.5 24.5 L16.5 32 L27 19.5 L21 19.5 Z" fill={pal.red} />
    </svg>
  );
}

export function Logo({ size = "text-2xl", iconSize = 24 }) {
  return (
    <div className="flex items-center gap-2">
      <NBoxIcon size={iconSize} />
      <span
        className={`font-display font-bold ${size} marquee-flicker`}
        style={{ color: pal.amber, textShadow: `0 0 18px ${pal.amberSoft}` }}
      >
        n<span style={{ color: pal.cream }}>Boxes</span>
      </span>
    </div>
  );
}

export function LogoBadge({ size = 168 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-label="nBoxes">
      <circle cx="100" cy="100" r="94" fill={pal.panel} stroke={pal.amber} strokeWidth="4" />
      <circle cx="100" cy="100" r="82" fill="none" stroke={pal.cream} strokeWidth="1.5" strokeDasharray="3 5" opacity="0.45" />
      <path id="nboxesTopArc" d="M30,112 A72,72 0 0 1 170,112" fill="none" />
      <text fontFamily="Oswald, sans-serif" fontWeight="700" fontSize="24" fill={pal.amber} letterSpacing="3">
        <textPath href="#nboxesTopArc" startOffset="50%" textAnchor="middle">
          nBOXES
        </textPath>
      </text>
      <g transform="translate(100,122) scale(1.5)">
        <rect x="-18" y="-12" width="36" height="26" rx="3" fill="none" stroke={pal.cream} strokeWidth="2.2" />
        <rect x="-10" y="-17" width="6" height="6" rx="1" fill={pal.cream} />
        <rect x="4" y="-17" width="6" height="6" rx="1" fill={pal.cream} />
        <path d="M4 -8 L-4 4 L1 4 L-1 12 L9 -1 L3 -1 Z" fill={pal.red} />
      </g>
      <text x="100" y="168" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill={pal.creamDim} letterSpacing="3">
        SALA DE ENSAIO
      </text>
    </svg>
  );
}
