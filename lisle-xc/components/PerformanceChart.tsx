import { useState } from 'react';
import { LifetimePRIcon, SeasonPRIcon, DataPointCircle } from '@/components/Icons';

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
    return <div className="h-72 flex items-center justify-center text-foreground italic">No race data available for this view.</div>;
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
      <div className="absolute inset-y-4 left-4 w-12 text-xs text-slate-400 font-medium z-10 pointer-events-none">
        {/* Top Label -> 0% */}
        <span className="absolute top-0 -translate-y-1/2">{secondsToTime(minPace - pacePadding)}</span>
        {/* Middle Label -> 50% */}
        <span className="absolute top-1/2 -translate-y-1/2">{secondsToTime(minPace + (maxPace - minPace) / 2)}</span>
        {/* Bottom Label -> 100% */}
        <span className="absolute top-full -translate-y-1/2">{secondsToTime(maxPace + pacePadding)}</span>
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
                <svg x={`${xPercent}%`} y={`${yPercent}%`} className="overflow-visible">
                  <LifetimePRIcon 
                    x={isHovered ? -14 : -10} 
                    y={isHovered ? -14 : -10} 
                    width={isHovered ? 28 : 20} 
                    height={isHovered ? 28 : 20} 
                    className="transition-all duration-200 cursor-pointer overflow-visible drop-shadow-sm" 
                  />
                </svg>
              ) : d.isSeasonPR ? (
                <svg x={`${xPercent}%`} y={`${yPercent}%`} className="overflow-visible">
                  <SeasonPRIcon 
                    x={isHovered ? -10 : -7} 
                    y={isHovered ? -10 : -7} 
                    width={isHovered ? 20 : 14} 
                    height={isHovered ? 20 : 14} 
                    className="transition-all duration-200 cursor-pointer overflow-visible drop-shadow-sm" 
                  />
                </svg>
              ) : (
                <DataPointCircle 
                  cx={`${xPercent}%`} 
                  cy={`${yPercent}%`} 
                  r={isHovered ? "6" : "4"} 
                  fill={isHovered ? "#0284c7" : "#fff"} 
                  className="transition-all duration-200 cursor-pointer" 
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Custom Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute z-20 w-max bg-background text-foreground text-sm rounded-lg py-2 px-3 shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none transition-all"
          style={{ left: `${getX(hoveredIndex)}%`, top: `calc(${getY(data[hoveredIndex].paceSeconds)}% - 12px)` }}
        >
          {/* Display Time */}
          <div className="font-bold text-light-blue mb-1">
            {data[hoveredIndex].DisplayTime}
          </div>
          
          {/* Lifetime PR */}
          {data[hoveredIndex].isLifetimePR && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
              {/* Pass dynamic width/height to make it fit text size */}
              <LifetimePRIcon width="12" height="12" className="shrink-0" />
              <span>Lifetime PR</span>
            </div>
          )}

          {/* Season PR */}
          {data[hoveredIndex].isSeasonPR && !data[hoveredIndex].isLifetimePR && (
            <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold mb-1">
              <SeasonPRIcon width="12" height="12" className="shrink-0" />
              <span>Season PR</span>
            </div>
          )}

          {/* Meet Info */}
          <div className="text-xs whitespace-nowrap">
            {data[hoveredIndex].MeetName}
          </div>
          
          {/* Pace Info */}
          <div className="text-xs mt-1 border-t border-border pt-1">
            Pace: {data[hoveredIndex].pace}/mi
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};