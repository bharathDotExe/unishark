import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SharkIdenticonProps {
  seed: string;
  role?: 'student' | 'mentor' | 'investor' | 'admin';
  size?: number;
  className?: string;
}

const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
};

const ROLES = ['student', 'mentor', 'investor', 'admin'] as const;

const hueFromHash = (hash: number, offset: number): number => {
  return ((hash >> offset) & 0xFF) / 255;
};

export const SharkIdenticon: React.FC<SharkIdenticonProps> = ({
  seed,
  role = 'student',
  size = 40,
  className,
}) => {
  const { rings, defs, bgFill, accentFill } = useMemo(() => {
    const hash = hashString(seed);
    const roleIndex = ROLES.indexOf(role);

    // Role-based hue anchors for sophistication
    const roleHues = [200, 270, 155, 45]; // student=blue, mentor=purple, investor=green, admin=gold
    const baseHue = roleHues[roleIndex];
    const hueVar = Math.floor(hueFromHash(hash, 0) * 40) - 20; // ±20° variation
    const primaryHue = (baseHue + hueVar + 360) % 360;
    const secondaryHue = (primaryHue + 30) % 360;

    // Build 3 concentric rings with segments
    const rings: { segments: number; innerR: number; outerR: number; bits: boolean[] }[] = [];
    let bitOffset = 8;

    const ringConfigs = [
      { segments: 6, innerR: 0.12, outerR: 0.35 },
      { segments: 10, innerR: 0.37, outerR: 0.60 },
      { segments: 14, innerR: 0.62, outerR: 0.85 },
    ];

    for (const cfg of ringConfigs) {
      const bits: boolean[] = [];
      for (let i = 0; i < cfg.segments; i++) {
        bits.push(((hash >> (bitOffset + i)) & 1) === 1);
      }
      bitOffset += cfg.segments;
      rings.push({ segments: cfg.segments, innerR: cfg.innerR, outerR: cfg.outerR, bits });
    }

    // Gradient IDs unique per seed
    const gradBg = `bg-${seed.slice(0, 8)}`;
    const gradAccent = `accent-${seed.slice(0, 8)}`;

    const bgFill = `url(#${gradBg})`;
    const accentFill = `url(#${gradAccent})`;

    const defs = (
      <>
        <radialGradient id={gradBg} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor={`hsl(${primaryHue}, 25%, 22%)`} />
          <stop offset="100%" stopColor={`hsl(${primaryHue}, 35%, 12%)`} />
        </radialGradient>
        <linearGradient id={gradAccent} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${primaryHue}, 70%, 65%)`} />
          <stop offset="100%" stopColor={`hsl(${secondaryHue}, 60%, 55%)`} />
        </linearGradient>
      </>
    );

    return { rings, defs, bgFill, accentFill, hasCenter };
  }, [seed, role]);

  // Generate SVG paths for a ring segment
  const segmentPath = (innerR: number, outerR: number, segments: number, index: number): string => {
    const startAngle = (index / segments) * Math.PI * 2 - Math.PI / 2;
    const endAngle = ((index + 1) / segments) * Math.PI * 2 - Math.PI / 2;
    const gap = 0.03; // slight gap between segments

    const sa = startAngle + gap;
    const ea = endAngle - gap;

    const x1 = 0.5 + innerR * Math.cos(sa);
    const y1 = 0.5 + innerR * Math.sin(sa);
    const x2 = 0.5 + outerR * Math.cos(sa);
    const y2 = 0.5 + outerR * Math.sin(sa);
    const x3 = 0.5 + outerR * Math.cos(ea);
    const y3 = 0.5 + outerR * Math.sin(ea);
    const x4 = 0.5 + innerR * Math.cos(ea);
    const y4 = 0.5 + innerR * Math.sin(ea);

    const largeArc = (ea - sa) > Math.PI ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1 1"
        xmlns="http://www.w3.org/2000/svg"
      >
        {defs}
        {/* Background circle */}
        <circle cx="0.5" cy="0.5" r="0.5" fill={bgFill} />

        {/* Rings */}
        {rings.map((ring, ringIdx) =>
          ring.bits.map((active, segIdx) => {
            if (!active) return null;
            const opacity = 0.6 + (ringIdx * 0.2); // inner rings more opaque
            return (
              <path
                key={`r${ringIdx}-s${segIdx}`}
                d={segmentPath(ring.innerR, ring.outerR, ring.segments, segIdx)}
                fill={accentFill}
                opacity={opacity}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
