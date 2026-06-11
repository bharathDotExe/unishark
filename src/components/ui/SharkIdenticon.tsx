import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SharkIdenticonProps {
  seed: string;
  name?: string;
  role?: 'student' | 'mentor' | 'investor' | 'admin';
  size?: number;
  className?: string;
}

const fnv1a = (str: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// WhatsApp-style default avatar: a clean silhouette of a person on a soft
// tonal background. Each user still gets a unique background color derived
// from their seed so accounts remain visually distinguishable.
const PALETTES: { bg: [string, string]; silhouette: string }[] = [
  { bg: ['#A6B5C2', '#7A8B99'], silhouette: '#FFFFFF' }, // slate (WhatsApp default)
  { bg: ['#B5C7E0', '#7E9BC4'], silhouette: '#FFFFFF' }, // soft blue
  { bg: ['#A8C9B5', '#6FA188'], silhouette: '#FFFFFF' }, // sage green
  { bg: ['#E0B5B5', '#C48383'], silhouette: '#FFFFFF' }, // dusty rose
  { bg: ['#C8B5E0', '#9479C4'], silhouette: '#FFFFFF' }, // soft lavender
  { bg: ['#E0CBA8', '#C4A36F'], silhouette: '#FFFFFF' }, // warm sand
  { bg: ['#A8D0E0', '#6FA5C4'], silhouette: '#FFFFFF' }, // sky
  { bg: ['#E0A8C4', '#C46F95'], silhouette: '#FFFFFF' }, // pink
  { bg: ['#B5D6C2', '#7AAC91'], silhouette: '#FFFFFF' }, // mint
  { bg: ['#D6C2B5', '#A8927A'], silhouette: '#FFFFFF' }, // taupe
  { bg: ['#B5BFD6', '#7A88A8'], silhouette: '#FFFFFF' }, // periwinkle
  { bg: ['#E0C2A8', '#C49170'], silhouette: '#FFFFFF' }, // peach
];

export const SharkIdenticon: React.FC<SharkIdenticonProps> = ({
  seed,
  name,
  role = 'student',
  size = 40,
  className,
}) => {
  const { uid, palette } = useMemo(() => {
    const hash = fnv1a(seed + role);
    const palette = PALETTES[hash % PALETTES.length];
    return { uid: `id-${hash.toString(36)}`, palette };
  }, [seed, role]);

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
          <radialGradient id={`${uid}-bg`} cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor={palette.bg[0]} />
            <stop offset="100%" stopColor={palette.bg[1]} />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${uid}-clip)`}>
          {/* Soft tonal background */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-bg)`} />

          {/* Person silhouette — WhatsApp / Material default avatar style.
              Head circle + rounded shoulders/torso emerging from the bottom. */}
          <g fill={palette.silhouette}>
            {/* Head */}
            <circle cx="50" cy="38" r="15" />
            {/* Shoulders / torso */}
            <path d="M 18 92 Q 18 64 50 64 Q 82 64 82 92 L 82 100 L 18 100 Z" />
          </g>
        </g>
      </svg>
    </div>
  );
};
