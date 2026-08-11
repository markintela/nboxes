import React from "react";
import { pal } from "@/lib/theme";

export function NBoxesLogo({ width = 220, height = 240, className, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 240"
      width={width}
      height={height}
      className={className}
      style={style}
    >
      <defs>
        <style>{`
          @font-face {
            font-family: 'Bebas Neue';
            font-style: normal;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/bebasneue/v16/JTUSjIg69CK48gW7PXooxW4.ttf) format('truetype');
          }
        `}</style>
      </defs>
      <g transform="translate(110,84) scale(1.12)">
        <polygon points="0,-58 50,-29 0,0 -50,-29" fill={pal.amber} stroke={pal.amber} strokeWidth="1" />
        <polygon points="-50,-29 0,0 0,58 -50,29" fill={pal.red} stroke={pal.red} strokeWidth="1" />
        <polygon points="50,-29 0,0 0,58 50,29" fill={pal.teal} stroke={pal.teal} strokeWidth="1" />
        <polygon points="0,-58 50,-29 0,0 -50,-29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
        <polygon points="-50,-29 0,0 0,58 -50,29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
        <polygon points="50,-29 0,0 0,58 50,29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
      </g>
      <text
        x="110"
        y="226"
        textAnchor="middle"
        fill={pal.cream}
        fontFamily="'Bebas Neue', Impact, sans-serif"
        fontSize="68"
        letterSpacing="-1"
        style={{ textTransform: "uppercase" }}
      >
        nboxes
      </text>
    </svg>
  );
}

export function NBoxesLogoAnimated({ width = 220, height = 240, className, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 240"
      width={width}
      height={height}
      className={className}
      style={style}
    >
      <defs>
        <style>{`
          @font-face {
            font-family: 'Bebas Neue';
            font-style: normal;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/bebasneue/v16/JTUSjIg69CK48gW7PXooxW4.ttf) format('truetype');
          }
          @keyframes nboxesSpin {
            0% { transform: rotate(0deg); }
            40% { transform: rotate(720deg); }
            100% { transform: rotate(720deg); }
          }
          .nboxes-cube {
            transform-origin: 0px 0px;
            animation: nboxesSpin 6s ease-in-out infinite;
          }
        `}</style>
      </defs>
      <g transform="translate(110,84) scale(1.12)">
        <g className="nboxes-cube">
          <polygon points="0,-58 50,-29 0,0 -50,-29" fill={pal.amber} stroke={pal.amber} strokeWidth="1" />
          <polygon points="-50,-29 0,0 0,58 -50,29" fill={pal.red} stroke={pal.red} strokeWidth="1" />
          <polygon points="50,-29 0,0 0,58 50,29" fill={pal.teal} stroke={pal.teal} strokeWidth="1" />
          <polygon points="0,-58 50,-29 0,0 -50,-29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
          <polygon points="-50,-29 0,0 0,58 -50,29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
          <polygon points="50,-29 0,0 0,58 50,29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
        </g>
      </g>
      <text
        x="110"
        y="226"
        textAnchor="middle"
        fill={pal.cream}
        fontFamily="'Bebas Neue', Impact, sans-serif"
        fontSize="68"
        letterSpacing="-1"
        style={{ textTransform: "uppercase" }}
      >
        nboxes
      </text>
    </svg>
  );
}

export function NBoxIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="-58 -58 116 116" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="0,-58 50,-29 0,0 -50,-29" fill={pal.amber} stroke={pal.amber} strokeWidth="1" />
      <polygon points="-50,-29 0,0 0,58 -50,29" fill={pal.red} stroke={pal.red} strokeWidth="1" />
      <polygon points="50,-29 0,0 0,58 50,29" fill={pal.teal} stroke={pal.teal} strokeWidth="1" />
      <polygon points="0,-58 50,-29 0,0 -50,-29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
      <polygon points="-50,-29 0,0 0,58 -50,29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
      <polygon points="50,-29 0,0 0,58 50,29" fill="none" stroke={pal.bg} strokeWidth="2.5" />
    </svg>
  );
}

export function Logo({ size = "text-2xl", iconSize = 24 }) {
  return (
    <div className="flex items-center gap-2">
      <NBoxIcon size={iconSize} />
      <span
        className={`font-display font-bold ${size}`}
        style={{ color: pal.amber, textShadow: `0 0 18px ${pal.amberSoft}`, textTransform: "uppercase" }}
      >
        n<span style={{ color: pal.cream }}>Boxes</span>
      </span>
    </div>
  );
}

export function LogoBadge({ size = 168 }) {
  return <NBoxesLogo width={size} height={Math.round(size * (240 / 220))} />;
}

export function LogoBadgeAnimated({ size = 168 }) {
  return <NBoxesLogoAnimated width={size} height={Math.round(size * (240 / 220))} />;
}
