import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SharkIdenticonProps {
  seed: string;
  name?: string;
  role?: 'student' | 'mentor' | 'investor' | 'admin';
  size?: number;
  className?: string;
}

// FNV-1a hash
const fnv1a = (str: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// Soft, premium pastel palettes (Apple/Notion-inspired). Background is light,
// monogram is a deep tonal version of the same hue. Calm, elegant, distinct.
const PALETTES: { bg: [string, string, string]; ink: string }[] = [
  { bg: ['#FDE7EF', '#F8C8DC', '#F4A6C0'], ink: '#7A1F3D' }, // rose
  { bg: ['#E6F0FF', '#C5DCFF', '#9BC2FF'], ink: '#0F3A8A' }, // sky
  { bg: ['#E7F8EE', '#BFEBD0', '#8FD9AE'], ink: '#0E5132' }, // sage
  { bg: ['#FFF1DC', '#FFD9A8', '#FFB778'], ink: '#7A3D08' }, // apricot
  { bg: ['#F0E8FF', '#D6C3FF', '#B79CFF'], ink: '#3B1A85' }, // lilac
  { bg: ['#E0F7FA', '#A7E8EE', '#74D2DB'], ink: '#0B4A55' }, // aqua
  { bg: ['#FFF4D6', '#FCE48A', '#F4C752'], ink: '#6A4900' }, // sand
  { bg: ['#F5EDE3', '#E4D2BB', '#C8AE8B'], ink: '#4A3618' }, // sand stone
  { bg: ['#FFE4E1', '#FFB8B0', '#FF8F82'], ink: '#7A1A12' }, // coral
  { bg: ['#E6FBF1', '#A8EFCD', '#6BDFA8'], ink: '#0B5235' }, // mint
  { bg: ['#EEF1FF', '#C8D0FF', '#9AA8FF'], ink: '#1B2670' }, // periwinkle
  { bg: ['#F9E8FF', '#E3B8F7', '#CB8DEC'], ink: '#561A75' }, // orchid
  { bg: ['#FFEDE0', '#FFC8A0', '#FFA56C'], ink: '#7A2E00' }, // tangerine
  { bg: ['#E8F5E9', '#B4DCB8', '#7EBE88'], ink: '#1B4A21' }, // moss
  { bg: ['#FFE6F2', '#FFB0D8', '#FF85BD'], ink: '#7A0F47' }, // pink
  { bg: ['#E9F3FF', '#B6D9FF', '#7FBAFF'], ink: '#0B3B7A' }, // azure
];

const getInitials = (name?: string, seed?: string): string => {
  const source = (name || '').trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }
  if (seed) {
    const clean = seed.replace(/[^a-zA-Z0-9]/g, '');
    return (clean.slice(0, 2) || 'U').toUpperCase();
  }
  return 'U';
};

export const SharkIdenticon: React.FC<SharkIdenticonProps> = ({
  seed,
  name,
  role = 'student',
  size = 40,
  className,
}) => {
  const { uid, palette, blobs, initials, rotation } = useMemo(() => {
    const hash = fnv1a(seed + role);
    const palette = PALETTES[hash % PALETTES.length];
    const uid = `id-${hash.toString(36)}`;
    const rotation = (hash >> 8) % 360;

    // Three soft mesh blobs with deterministic per-user positions
    const blobs = Array.from({ length: 3 }).map((_, i) => {
      const h = fnv1a(seed + '::' + i);
      return {
        cx: 15 + ((h & 0xff) / 255) * 70,
        cy: 15 + (((h >> 8) & 0xff) / 255) * 70,
        r: 38 + (((h >> 16) & 0xff) / 255) * 22,
        color: palette.bg[i % 3],
      };
    });

    return { uid, palette, blobs, initials: getInitials(name, seed), rotation };
  }, [seed, name, role]);

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 select-none',
        className
      )}
      style={{ width: size, height: size }}
      aria-label={`Avatar for ${name || seed}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`${uid}-base`} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor={palette.bg[0]} />
            <stop offset="100%" stopColor={palette.bg[1]} />
          </radialGradient>
          <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* Soft tonal base */}
        <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-base)`} />

        {/* Mesh-style soft blobs — gives each user a unique flow */}
        <g
          filter={`url(#${uid}-blur)`}
          transform={`rotate(${rotation} 50 50)`}
          opacity="0.85"
        >
          {blobs.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.color} />
          ))}
        </g>

        {/* Subtle inner highlight for depth */}
        <ellipse cx="35" cy="28" rx="30" ry="18" fill="white" opacity="0.22" />

        {/* Monogram — refined serif for premium feel */}
        <text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif"
          fontWeight="600"
          fontSize="46"
          fill={palette.ink}
          style={{ letterSpacing: '0.5px' }}
        >
          {initials}
        </text>

        {/* Hairline ring */}
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="none"
          stroke={palette.ink}
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};
