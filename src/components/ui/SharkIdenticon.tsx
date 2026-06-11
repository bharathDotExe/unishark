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

// Premium deep-jewel palettes inspired by luxury brand identities
// (Aesop, Hermès, Cartier, Apple Vision). Rich saturated backgrounds with
// metallic-foil monograms for a high-end, editorial feel.
const PALETTES: { a: string; b: string; c: string; foil: [string, string, string]; accent: string }[] = [
  { a: '#0B1F3A', b: '#1E3A6F', c: '#3D6FB8', foil: ['#E8D9A8', '#F5E9C2', '#C9A961'], accent: '#7BB3FF' }, // midnight + champagne
  { a: '#1A0B2E', b: '#3D1B5C', c: '#7B3FAD', foil: ['#FFD9F0', '#FFB8E0', '#D97FBC'], accent: '#E0A3FF' }, // royal violet + rose foil
  { a: '#0A2E2A', b: '#0F4C46', c: '#1E8278', foil: ['#FFE4A8', '#FFC97A', '#C99449'], accent: '#7FE0D0' }, // emerald + gold
  { a: '#2E0F1A', b: '#5C1B2F', c: '#A8324E', foil: ['#FFE0B8', '#FFC585', '#D49050'], accent: '#FF7FA5' }, // burgundy + amber
  { a: '#0B1B2E', b: '#1E2F4F', c: '#3D5A82', foil: ['#D8E6FF', '#A8C5FF', '#5D8FE0'], accent: '#7FB0FF' }, // navy + ice silver
  { a: '#2A1A0B', b: '#4F2F15', c: '#8B5A2B', foil: ['#FFE8C2', '#FFD18A', '#D49A4A'], accent: '#FFB87A' }, // cognac + bronze
  { a: '#0E2E1F', b: '#1F5C3D', c: '#3D9670', foil: ['#FFF2C5', '#FFE388', '#D4B040'], accent: '#7FE0A8' }, // forest + citrine
  { a: '#2E0B1F', b: '#5C1740', c: '#9B2E6E', foil: ['#FFD9E5', '#FFB0CC', '#D97FA8'], accent: '#FF7FC2' }, // plum + blush
  { a: '#0B1E2E', b: '#15405C', c: '#2E7AA8', foil: ['#E8FBFF', '#A8E8FF', '#5DB8E0'], accent: '#7FD0FF' }, // ocean + frost
  { a: '#1F0F2E', b: '#3D1F5C', c: '#6E3FA8', foil: ['#FFE8B8', '#FFCF7F', '#D49C40'], accent: '#C29FFF' }, // amethyst + gold
  { a: '#2E1B0B', b: '#5C3315', c: '#A86A2E', foil: ['#FFEAD0', '#FFCB95', '#D4944A'], accent: '#FFAE7F' }, // chestnut + caramel
  { a: '#0B2E2E', b: '#155C5C', c: '#2E9B9B', foil: ['#F0FFE5', '#C5F0A8', '#7FB85D'], accent: '#7FE0E0' }, // teal + lime foil
  { a: '#1A1A2E', b: '#2E2E4F', c: '#5C5C8C', foil: ['#FFF5D9', '#FFE5A8', '#D4B85D'], accent: '#A8AFFF' }, // graphite + champagne
  { a: '#2E0B0B', b: '#5C1515', c: '#A82E2E', foil: ['#FFE3B8', '#FFC880', '#D4983D'], accent: '#FF8A7F' }, // crimson + gold
  { a: '#0E1F0B', b: '#1F4015', c: '#3D7A2E', foil: ['#FFFBD0', '#FFEE85', '#D4BA3D'], accent: '#A8E07F' }, // olive + sun
  { a: '#0B0B1F', b: '#15154F', c: '#2E2EA8', foil: ['#FFE8E0', '#FFB8A8', '#D97A5D'], accent: '#7F8AFF' }, // sapphire + rose-gold
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
  const { uid, palette, orbs, initials, rotation, facets, glintAngle } = useMemo(() => {
    const hash = fnv1a(seed + role);
    const palette = PALETTES[hash % PALETTES.length];
    const uid = `id-${hash.toString(36)}`;
    const rotation = (hash >> 8) % 360;
    const glintAngle = ((hash >> 16) % 360);

    // Glass orbs — refracted color spots, deterministic per user
    const orbs = Array.from({ length: 4 }).map((_, i) => {
      const h = fnv1a(seed + '~' + i);
      return {
        cx: 18 + ((h & 0xff) / 255) * 64,
        cy: 18 + (((h >> 8) & 0xff) / 255) * 64,
        r: 22 + (((h >> 16) & 0xff) / 255) * 18,
        color: i === 0 ? palette.c : i === 1 ? palette.accent : i === 2 ? palette.b : palette.c,
        opacity: 0.55 + (((h >> 24) & 0xff) / 255) * 0.35,
      };
    });

    // Faceted polygon — like a cut gemstone facet ring
    const facetCount = 6 + (hash % 3); // 6-8 facets
    const facets = Array.from({ length: facetCount }).map((_, i) => {
      const angle = (i / facetCount) * Math.PI * 2 + (rotation * Math.PI) / 180;
      const r = 46;
      return {
        x: 50 + Math.cos(angle) * r,
        y: 50 + Math.sin(angle) * r,
      };
    });

    return {
      uid,
      palette,
      orbs,
      initials: getInitials(name, seed),
      rotation,
      facets,
      glintAngle,
    };
  }, [seed, name, role]);

  const facetPath = facets.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z';

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
          {/* Deep jewel base */}
          <radialGradient id={`${uid}-base`} cx="35%" cy="30%" r="85%">
            <stop offset="0%" stopColor={palette.c} />
            <stop offset="55%" stopColor={palette.b} />
            <stop offset="100%" stopColor={palette.a} />
          </radialGradient>

          {/* Metallic foil gradient for monogram */}
          <linearGradient
            id={`${uid}-foil`}
            gradientUnits="userSpaceOnUse"
            x1="20"
            y1="20"
            x2="80"
            y2="80"
            gradientTransform={`rotate(${glintAngle} 50 50)`}
          >
            <stop offset="0%" stopColor={palette.foil[0]} />
            <stop offset="45%" stopColor={palette.foil[1]} />
            <stop offset="55%" stopColor={palette.foil[2]} />
            <stop offset="100%" stopColor={palette.foil[0]} />
          </linearGradient>

          {/* Soft blur for refracted orbs */}
          <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>

          {/* Subtle grain via turbulence */}
          <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={(fnv1a(seed) % 100).toString()} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0" />
          </filter>

          {/* Inner shadow for depth */}
          <radialGradient id={`${uid}-vignette`} cx="50%" cy="50%" r="55%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>

          <clipPath id={`${uid}-clip`}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${uid}-clip)`}>
          {/* Deep base */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-base)`} />

          {/* Refracted glass orbs */}
          <g filter={`url(#${uid}-blur)`} opacity="0.9">
            {orbs.map((o, i) => (
              <circle key={i} cx={o.cx} cy={o.cy} r={o.r} fill={o.color} opacity={o.opacity} />
            ))}
          </g>

          {/* Faceted gemstone outline */}
          <path
            d={facetPath}
            fill="none"
            stroke={palette.foil[1]}
            strokeOpacity="0.35"
            strokeWidth="0.6"
          />
          <path
            d={facetPath}
            fill="none"
            stroke={palette.foil[2]}
            strokeOpacity="0.55"
            strokeWidth="0.3"
            transform="scale(0.78) translate(14, 14)"
          />

          {/* Top-left specular highlight */}
          <ellipse cx="32" cy="26" rx="26" ry="14" fill="white" opacity="0.18" />
          <ellipse cx="28" cy="22" rx="10" ry="5" fill="white" opacity="0.35" />

          {/* Grain texture */}
          <rect x="0" y="0" width="100" height="100" filter={`url(#${uid}-grain)`} opacity="0.5" />

          {/* Bottom vignette for depth */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-vignette)`} />

          {/* Monogram — foil-stamped serif */}
          <text
            x="50"
            y="53"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif"
            fontWeight="600"
            fontSize="44"
            fill={`url(#${uid}-foil)`}
            style={{ letterSpacing: '1px' }}
          >
            {initials}
          </text>

          {/* Hairline gold ring */}
          <circle
            cx="50"
            cy="50"
            r="48.5"
            fill="none"
            stroke={palette.foil[2]}
            strokeOpacity="0.55"
            strokeWidth="0.8"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={palette.foil[0]}
            strokeOpacity="0.18"
            strokeWidth="0.4"
          />
        </g>
      </svg>
    </div>
  );
};
