import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SharkIdenticonProps {
  seed: string;
  name?: string;
  role?: 'student' | 'mentor' | 'investor' | 'admin';
  size?: number;
  className?: string;
}

// Strong, well-distributed hash (FNV-1a)
const fnv1a = (str: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const ROLES = ['student', 'mentor', 'investor', 'admin'] as const;

// Curated, vibrant gradient palettes — every user gets a distinct beautiful combo
const PALETTES: [string, string, string][] = [
  ['#FF6B6B', '#FFD93D', '#FF8E53'], // sunset
  ['#6A11CB', '#2575FC', '#00C9FF'], // electric blue/purple
  ['#11998E', '#38EF7D', '#A8FF78'], // mint forest
  ['#FC466B', '#3F5EFB', '#A044FF'], // magenta to indigo
  ['#F7971E', '#FFD200', '#FF6A00'], // golden hour
  ['#00DBDE', '#FC00FF', '#7B2FF7'], // cyber neon
  ['#FA709A', '#FEE140', '#FF9A8B'], // peach pink
  ['#43E97B', '#38F9D7', '#00C9A7'], // emerald aqua
  ['#5EE7DF', '#B490CA', '#F794A4'], // pastel dream
  ['#FF512F', '#DD2476', '#F09819'], // crimson amber
  ['#4FACFE', '#00F2FE', '#43E97B'], // arctic
  ['#F953C6', '#B91D73', '#FFB6B9'], // berry bloom
  ['#3A1C71', '#D76D77', '#FFAF7B'], // dusk
  ['#1FA2FF', '#12D8FA', '#A6FFCB'], // ocean
  ['#FF9966', '#FF5E62', '#FFC371'], // tangerine
  ['#8E2DE2', '#4A00E0', '#00C2FF'], // deep galaxy
];

const getInitials = (name?: string, seed?: string): string => {
  const source = (name || '').trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }
  if (seed) {
    // Pick two letters from seed
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
  const { gradId, patternId, colors, angle, shapes, initials, ringColor } = useMemo(() => {
    const hash = fnv1a(seed + role);
    const colors = PALETTES[hash % PALETTES.length];
    const angle = (hash >> 4) % 360;
    const uid = (hash.toString(36) + (seed || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)) || 'id';
    const gradId = `g-${uid}`;
    const patternId = `p-${uid}`;

    // Generate 5 decorative floating shapes (circles/blobs) for unique pattern
    const shapes = Array.from({ length: 6 }).map((_, i) => {
      const h = fnv1a(seed + ':' + i);
      return {
        cx: ((h & 0xff) / 255) * 100,
        cy: (((h >> 8) & 0xff) / 255) * 100,
        r: 8 + (((h >> 16) & 0xff) / 255) * 18,
        opacity: 0.12 + (((h >> 20) & 0x0f) / 15) * 0.22,
      };
    });

    const initials = getInitials(name, seed);
    const ringColor = colors[2];
    return { gradId, patternId, colors, angle, shapes, initials, ringColor };
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
          <linearGradient
            id={gradId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientTransform={`rotate(${angle} 0.5 0.5)`}
          >
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="55%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
          <radialGradient id={`${gradId}-shine`} cx="30%" cy="25%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="60%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background gradient */}
        <rect x="0" y="0" width="100" height="100" fill={`url(#${gradId})`} />

        {/* Decorative shapes for unique per-user texture */}
        <g>
          {shapes.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="white"
              opacity={s.opacity}
            />
          ))}
        </g>

        {/* Soft top-left shine */}
        <rect x="0" y="0" width="100" height="100" fill={`url(#${gradId}-shine)`} />

        {/* Initials */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
          fontWeight="800"
          fontSize="42"
          fill="white"
          style={{ letterSpacing: '-1px', paintOrder: 'stroke', textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
        >
          {initials}
        </text>

        {/* Inner ring accent */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};
