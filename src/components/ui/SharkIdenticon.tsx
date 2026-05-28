import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SharkIdenticonProps {
  seed: string;
  role?: 'student' | 'mentor' | 'investor' | 'admin';
  size?: number;
  className?: string;
}

// Simple deterministic hash function (djb2)
const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return Math.abs(hash);
};

export const SharkIdenticon: React.FC<SharkIdenticonProps> = ({ 
  seed, 
  role = 'student', 
  size = 40,
  className 
}) => {
  const { grid, colorTheme } = useMemo(() => {
    const hash = hashString(seed);
    
    // Generate a 5x5 symmetrical grid (15 unique blocks, reflected)
    // We use the bits of the hash to determine if a block is active
    const grid: boolean[][] = Array(5).fill(false).map(() => Array(5).fill(false));
    let bitIndex = 0;
    
    // To make it look slightly more "fin-like", we can bias the bottom/center
    // but pure randomness is fine for 5x5 identicons.
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 5; row++) {
        // Extract the nth bit from the hash
        const bit = (hash >> bitIndex) & 1;
        const isActive = bit === 1;
        
        // Apply to left side and mirrored right side
        grid[row][col] = isActive;
        grid[row][4 - col] = isActive;
        
        bitIndex++;
      }
    }

    // Role-based color themes (Dark mode optimized, neon, glowing)
    const themes = {
      student: {
        bg: "bg-[#050B14]", // Dark deep blue
        fill: "#00E5FF", // Neon Cyan
        glow: "rgba(0, 229, 255, 0.4)"
      },
      mentor: {
        bg: "bg-[#11051A]", // Dark deep purple
        fill: "#B026FF", // Neon Purple
        glow: "rgba(176, 38, 255, 0.4)"
      },
      investor: {
        bg: "bg-[#03150D]", // Dark deep green
        fill: "#00FFA3", // Emerald Green
        glow: "rgba(0, 255, 163, 0.4)"
      },
      admin: {
        bg: "bg-[#1A1301]", // Dark deep gold
        fill: "#FFC107", // Gold
        glow: "rgba(255, 193, 7, 0.4)"
      }
    };

    return { grid, colorTheme: themes[role] };
  }, [seed, role]);

  const blockSize = size / 5;

  return (
    <div 
      className={cn(
        "rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center flex-shrink-0",
        colorTheme.bg,
        className
      )}
      style={{ 
        width: size, 
        height: size,
        boxShadow: `0 0 10px ${colorTheme.glow}` 
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="-1.5 -1.5 8 8" 
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform duration-500 hover:rotate-3"
      >
        <defs>
          <filter id={`glow-${seed}`}>
            <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {grid.map((row, r) => 
          row.map((isActive, c) => {
            if (!isActive) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill={colorTheme.fill}
                rx={0.25} // Rounded pixel edges
                ry={0.25}
                filter={`url(#glow-${seed})`}
                className="transition-all duration-300"
                style={{
                  transformOrigin: 'center',
                }}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
