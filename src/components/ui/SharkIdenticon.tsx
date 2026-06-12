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

// Background gradient palettes (soft, modern, WhatsApp-style tonal)
const BG_PALETTES: [string, string][] = [
  ['#7A8B99', '#4B5C6B'], // slate
  ['#7E9BC4', '#456C99'], // blue
  ['#6FA188', '#3F7A60'], // sage
  ['#C48383', '#9A5252'], // rose
  ['#9479C4', '#664896'], // lavender
  ['#C4A36F', '#947544'], // sand
  ['#6FA5C4', '#3F7A99'], // sky
  ['#C46F95', '#963F65'], // pink
  ['#7AAC91', '#4C7E64'], // mint
  ['#A8927A', '#7A6650'], // taupe
  ['#7A88A8', '#4F5B78'], // periwinkle
  ['#C49170', '#946344'], // peach
  ['#5FA8A0', '#357771'], // teal
  ['#B07AC4', '#7E4C94'], // orchid
  ['#D49A5A', '#A26D33'], // amber
  ['#5C8FB0', '#36637F'], // ocean
];

// Hair / accessory color stops keyed to background hues
const HAIR_COLORS = ['#2B2118', '#3D2E22', '#5C3A1F', '#8B5A2B', '#1A1A1A', '#4A2C1A'];
const SKIN_TONES = ['#F5D5B5', '#E8B894', '#D49A6F', '#B07A52', '#8B5A3C', '#6B3F28'];

type HairStyle = 'short' | 'long' | 'bun' | 'curly' | 'mohawk' | 'bald' | 'cap' | 'side';
const HAIR_STYLES: HairStyle[] = ['short', 'long', 'bun', 'curly', 'mohawk', 'bald', 'cap', 'side'];

type Accessory = 'none' | 'glasses' | 'beard' | 'earrings' | 'mustache';
const ACCESSORIES: Accessory[] = ['none', 'none', 'glasses', 'beard', 'earrings', 'mustache'];

export const SharkIdenticon: React.FC<SharkIdenticonProps> = ({
  seed,
  name,
  role = 'student',
  size = 40,
  className,
}) => {
  const cfg = useMemo(() => {
    const base = seed + '::' + role;
    const h0 = fnv1a(base);
    const h1 = fnv1a(base + 'bg');
    const h2 = fnv1a(base + 'skin');
    const h3 = fnv1a(base + 'hair');
    const h4 = fnv1a(base + 'style');
    const h5 = fnv1a(base + 'acc');
    const h6 = fnv1a(base + 'shirt');
    return {
      uid: `id-${h0.toString(36)}`,
      bg: BG_PALETTES[h1 % BG_PALETTES.length],
      skin: SKIN_TONES[h2 % SKIN_TONES.length],
      hair: HAIR_COLORS[h3 % HAIR_COLORS.length],
      style: HAIR_STYLES[h4 % HAIR_STYLES.length],
      accessory: ACCESSORIES[h5 % ACCESSORIES.length],
      shirt: BG_PALETTES[h6 % BG_PALETTES.length][0],
    };
  }, [seed, role]);

  const { uid, bg, skin, hair, style, accessory, shirt } = cfg;

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
          <radialGradient id={`${uid}-bg`} cx="50%" cy="35%" r="80%">
            <stop offset="0%" stopColor={bg[0]} />
            <stop offset="100%" stopColor={bg[1]} />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${uid}-clip)`}>
          {/* Background */}
          <rect width="100" height="100" fill={`url(#${uid}-bg)`} />

          {/* Shirt / shoulders */}
          <path
            d="M 10 100 Q 10 70 50 68 Q 90 70 90 100 Z"
            fill={shirt}
          />
          {/* Neck */}
          <rect x="44" y="52" width="12" height="14" fill={skin} />
          {/* Head */}
          <circle cx="50" cy="40" r="16" fill={skin} />

          {/* Hair styles */}
          {style === 'short' && (
            <path d="M 34 38 Q 32 22 50 22 Q 68 22 66 38 Q 60 30 50 30 Q 40 30 34 38 Z" fill={hair} />
          )}
          {style === 'long' && (
            <>
              <path d="M 33 42 Q 30 20 50 20 Q 70 20 67 42 L 67 55 L 62 50 Q 60 32 50 32 Q 40 32 38 50 L 33 55 Z" fill={hair} />
            </>
          )}
          {style === 'bun' && (
            <>
              <circle cx="50" cy="20" r="7" fill={hair} />
              <path d="M 35 36 Q 34 26 50 26 Q 66 26 65 36 Q 60 32 50 32 Q 40 32 35 36 Z" fill={hair} />
            </>
          )}
          {style === 'curly' && (
            <>
              <circle cx="40" cy="26" r="6" fill={hair} />
              <circle cx="50" cy="22" r="7" fill={hair} />
              <circle cx="60" cy="26" r="6" fill={hair} />
              <circle cx="35" cy="34" r="5" fill={hair} />
              <circle cx="65" cy="34" r="5" fill={hair} />
            </>
          )}
          {style === 'mohawk' && (
            <path d="M 46 18 L 54 18 L 56 38 L 44 38 Z" fill={hair} />
          )}
          {style === 'cap' && (
            <>
              <path d="M 32 36 Q 32 22 50 22 Q 68 22 68 36 L 68 38 L 32 38 Z" fill={hair} />
              <rect x="32" y="36" width="40" height="4" fill={hair} opacity="0.7" />
            </>
          )}
          {style === 'side' && (
            <path d="M 34 38 Q 32 22 50 22 Q 68 22 66 38 L 62 32 Q 50 28 38 38 Z" fill={hair} />
          )}
          {/* bald = no hair render */}

          {/* Eyes */}
          <circle cx="44" cy="40" r="1.6" fill="#1a1a1a" />
          <circle cx="56" cy="40" r="1.6" fill="#1a1a1a" />

          {/* Accessories */}
          {accessory === 'glasses' && (
            <g stroke="#1a1a1a" strokeWidth="1.2" fill="none">
              <circle cx="44" cy="40" r="4" />
              <circle cx="56" cy="40" r="4" />
              <line x1="48" y1="40" x2="52" y2="40" />
            </g>
          )}
          {accessory === 'beard' && (
            <path d="M 38 46 Q 50 58 62 46 Q 60 54 50 56 Q 40 54 38 46 Z" fill={hair} />
          )}
          {accessory === 'mustache' && (
            <path d="M 43 47 Q 50 50 57 47 Q 54 49 50 49 Q 46 49 43 47 Z" fill={hair} />
          )}
          {accessory === 'earrings' && (
            <>
              <circle cx="34" cy="44" r="1.5" fill="#E8C547" />
              <circle cx="66" cy="44" r="1.5" fill="#E8C547" />
            </>
          )}

          {/* Smile */}
          <path d="M 45 46 Q 50 49 55 46" stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
