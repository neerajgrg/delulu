import React from 'react';

interface DeluluLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const DeluluLogo: React.FC<DeluluLogoProps> = ({
  size = 22,
  className = '',
  showText = false,
  textClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Top Arc Gradient: Cyan to Blue */}
          <linearGradient id="dRibbonTop" x1="4" y1="4" x2="32" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Right Sweeping Curve: Electric Indigo to Deep Violet */}
          <linearGradient id="dRibbonRight" x1="32" y1="10" x2="16" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* Left Spine / Bottom Anchor: Deep Obsidian Blue */}
          <linearGradient id="dRibbonSpine" x1="6" y1="32" x2="6" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Inner Void Ambient Glow */}
          <radialGradient id="dInnerGlow" cx="19" cy="18" r="9" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background glow inside the D loop */}
        <circle cx="19" cy="18" r="9" fill="url(#dInnerGlow)" />

        {/* 1. Left Vertical Core Pillar (The Backbone) */}
        <path
          d="M 6 5.5 C 6 4.12 7.12 3 8.5 3 L 13.5 3 C 14.88 3 16 4.12 16 5.5 L 16 30.5 C 16 31.88 14.88 33 13.5 33 L 8.5 33 C 7.12 33 6 31.88 6 30.5 Z"
          fill="url(#dRibbonSpine)"
        />

        {/* 2. Top Forward-Sweeping Bridge */}
        <path
          d="M 14 3 L 23 3 C 28.52 3 33 7.48 33 13 C 33 15.2 32.28 17.23 31.06 18.88 L 24.5 12.32 C 24.82 11.28 25 10.16 25 9 C 25 6.79 23.21 5 21 5 L 14 5 Z"
          fill="url(#dRibbonTop)"
        />

        {/* 3. Right & Bottom Folded Return Loop (Completing the dimensional 'D') */}
        <path
          d="M 33 13 C 33 19.63 27.63 25 21 25 L 14 25 L 14 31 L 21 31 C 29.84 31 37 23.84 37 15 C 37 13.5 36.8 12.05 36.43 10.66 L 31.06 16.03 C 31.67 15.08 32 13.97 32 12.78 Z"
          fill="url(#dRibbonRight)"
          transform="translate(-3, 2)"
        />

        {/* 4. Precision Specular Highlights (Laser edges) */}
        <path
          d="M 8.5 4 L 13.5 4 C 14.33 4 15 4.67 15 5.5 L 15 30.5"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M 14 4 L 23 4 C 27.97 4 32 8.03 32 13"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span
          className={`font-semibold tracking-tight text-ink font-sans flex items-center gap-1.5 ${
            textClassName || 'text-xs'
          }`}
        >
          <span>delulu</span>
          <span className="text-3xs uppercase tracking-wider px-1 py-0.2 rounded bg-accent/15 text-accent-bright font-mono border border-accent/30 font-medium">
            ide
          </span>
        </span>
      )}
    </div>
  );
};

export default DeluluLogo;
