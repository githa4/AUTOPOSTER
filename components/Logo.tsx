
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center group cursor-pointer select-none">
      {/* 1. Ambient Background Glow (Pulse) */}
      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />

      {/* SVG Canvas */}
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          {/* Main Brand Gradient */}
          <linearGradient id="quantum-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
            <stop offset="50%" stopColor="#818cf8" /> {/* indigo-400 */}
            <stop offset="100%" stopColor="#c084fc" /> {/* purple-400 */}
          </linearGradient>
          
          {/* Glow Filter for Neon Effect */}
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 2. Outer Ring: Thin, Slow Rotation */}
        <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="url(#quantum-grad)" 
            strokeWidth="0.5" 
            strokeOpacity="0.4"
            className="origin-center animate-[spin_12s_linear_infinite]"
            strokeDasharray="10 5"
        />

        {/* 3. Active Arcs: Fast, Glowing, Opposing */}
        <g className="origin-center animate-[spin_3s_ease-in-out_infinite]">
            {/* Top-Right Arc */}
            <path 
                d="M50 15 A35 35 0 0 1 85 50" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="3" 
                strokeLinecap="round" 
                filter="url(#neon-glow)" 
            />
            {/* Bottom-Left Arc */}
            <path 
                d="M50 85 A35 35 0 0 1 15 50" 
                fill="none" 
                stroke="#c084fc" 
                strokeWidth="3" 
                strokeLinecap="round" 
                filter="url(#neon-glow)" 
            />
        </g>

        {/* 4. Middle Geometry: Rotating Hexagon/Triangle Mesh */}
        <g className="origin-center animate-[spin_8s_linear_infinite_reverse] opacity-80">
            <polygon 
                points="50,25 71.6,37.5 71.6,62.5 50,75 28.4,62.5 28.4,37.5" 
                fill="none" 
                stroke="white" 
                strokeWidth="1"
                strokeOpacity="0.5"
            />
            <path d="M50 25 L50 75 M28.4 37.5 L71.6 62.5 M71.6 37.5 L28.4 62.5" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>

        {/* 5. Core Singularity: Breathing & Glowing */}
        <circle 
            cx="50" cy="50" r="8" 
            fill="white" 
            filter="url(#neon-glow)" 
            className="origin-center animate-[pulse_2s_ease-in-out_infinite]" 
        />
        
        {/* Core Detail: Small Inner Dot */}
        <circle cx="50" cy="50" r="3" fill="#3b82f6" />

      </svg>
    </div>
  );
};
