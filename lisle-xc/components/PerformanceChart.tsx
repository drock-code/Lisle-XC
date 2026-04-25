import { useState } from 'react';

import type { ProcessedResult } from '@/lib/runner-utils';
import { secondsToTime } from '@/lib/utils';

interface ChartableResult extends ProcessedResult {
  JH?: number; 
  seconds: number;
  paceSeconds: number; 
  pace: string;
  DisplayTime: string;
}

export const PerformanceChart = ({ data }: { data: ChartableResult[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-slate-400 italic">No race data available for this view.</div>;
  }

  // Calculate scales based on PACE instead of total time
  const paces = data.map(d => d.paceSeconds);
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const pacePadding = (maxPace - minPace) * 0.1 || 15;

  // In XC, faster (lower) paces go UP.
  const getY = (paceSec: number) => {
    const range = (maxPace + pacePadding) - (minPace - pacePadding);
    const val = paceSec - (minPace - pacePadding);
    return (val / range) * 100;
  };

  const getX = (index: number) => {
    if (data.length === 1) return 50;
    return (index / (data.length - 1)) * 90 + 5; // 5% to 95% width
  };

  return (
    <div className="relative w-full h-80 bg-background rounded-xl border border-foreground p-4 mt-6">
        {/* Y-Axis Labels (Pace) */}
        <div className="absolute left-4 top-4 bottom-8 w-12 flex flex-col justify-between text-xs text-foreground font-medium z-10 pointer-events-none">
            <span>{secondsToTime(minPace - pacePadding)}</span>
            <span>{secondsToTime(minPace + (maxPace - minPace) / 2)}</span>
            <span>{secondsToTime(maxPace + pacePadding)}</span>
        </div>

      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {/* Grid Lines */}
        <line x1="5%" y1="0%" x2="100%" y2="0%" stroke="var(--foreground)" strokeDasharray="4 4" />
        <line x1="5%" y1="50%" x2="100%" y2="50%" stroke="var(--foreground)" strokeDasharray="4 4" />
        <line x1="5%" y1="100%" x2="100%" y2="100%" stroke="var(--foreground)" strokeDasharray="4 4" />

        {/* The Data Line Segments */}
        {data.map((d, i) => {
          if (i === 0) return null; 
          const prev = data[i - 1];
          return (
            <line
              key={`line-${i}`}
              x1={`${getX(i - 1)}%`}
              y1={`${getY(prev.paceSeconds)}%`}
              x2={`${getX(i)}%`}
              y2={`${getY(d.paceSeconds)}%`}
              stroke="#0ea5e9"
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-md"
            />
          );
        })}

        {/* Data Points & Interaction */}
        {data.map((d, i) => {
          const isHovered = hoveredIndex === i;
          const xPercent = getX(i);
          const yPercent = getY(d.paceSeconds);

          return (
            <g key={`point-${i}`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <circle cx={`${xPercent}%`} cy={`${yPercent}%`} r="15" fill="transparent" className="cursor-pointer" />
              
              {d.isLifetimePR ? (
                <svg x={`calc(${xPercent}% - ${isHovered ? 14 : 10}px)`} y={`calc(${yPercent}% - ${isHovered ? 14 : 10}px)`} width={isHovered ? 28 : 20} height={isHovered ? 28 : 20} viewBox="0 0 24 24" fill="#fcd34d" stroke="#d97706" strokeWidth="2" className="transition-all duration-200 cursor-pointer overflow-visible drop-shadow-sm">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ) : d.isSeasonPR ? (
                <svg x={`calc(${xPercent}% - ${isHovered ? 10 : 7}px)`} y={`calc(${yPercent}% - ${isHovered ? 10 : 7}px)`} width={isHovered ? 20 : 14} height={isHovered ? 20 : 14} viewBox="0 0 24 24" fill="#10b981" stroke="#047857" strokeWidth="3" className="transition-all duration-200 cursor-pointer overflow-visible drop-shadow-sm">
                   <polygon points="12 2 22 12 12 22 2 12" />
                </svg>
              ) : (
                <circle cx={`${xPercent}%`} cy={`${yPercent}%`} r={isHovered ? "6" : "4"} fill={isHovered ? "#0284c7" : "#fff"} stroke="#0ea5e9" strokeWidth="3" className="transition-all duration-200 cursor-pointer" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Custom Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute z-20 w-max bg-slate-900 text-white text-sm rounded-lg py-2 px-3 shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none transition-all"
          style={{ left: `${getX(hoveredIndex)}%`, top: `calc(${getY(data[hoveredIndex].paceSeconds)}% - 12px)` }}
        >
          <div className="font-bold text-sky-400 mb-1">{data[hoveredIndex].DisplayTime}</div>
          {data[hoveredIndex].isLifetimePR && <div className="text-amber-400 text-xs font-bold mb-1">⭐ Lifetime PR</div>}
          {data[hoveredIndex].isSeasonPR && !data[hoveredIndex].isLifetimePR && <div className="text-emerald-400 text-xs font-bold mb-1">♦️ Season PR</div>}
          <div className="text-slate-300 text-xs whitespace-nowrap">{data[hoveredIndex].MeetName}</div>
          <div className="text-slate-400 text-xs mt-1 border-t border-slate-700 pt-1">
            Pace: {data[hoveredIndex].pace}/mi
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};