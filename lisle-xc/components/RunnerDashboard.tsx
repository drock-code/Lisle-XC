"use client";

import React, { useState, useMemo } from 'react';
import { User, Calendar, Map, Activity, ChevronDown } from 'lucide-react';
import type { ProcessedResult } from '@/lib/runner-utils';
import type { RunnerProfileRow } from '@/lib/queries';

// We extend the processed result just for the component to hold our math
interface ChartableResult extends ProcessedResult {
  JH?: number; 
  seconds: number;
  paceSeconds: number; // Add this line to hold the raw pace math
  pace: string;
  DisplayTime: string;
}

interface RunnerDashboardProps {
  runner: RunnerProfileRow;
  results: ProcessedResult[];
}

// --- UTILITY FUNCTIONS ---
const timeToSeconds = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
};

const secondsToTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getDistanceInMiles = (distance: number, unit: string) => {
  const normalizedUnit = unit?.toLowerCase() || '';
  
  // Convert Kilometers (5K, 3K, etc.) to Miles
  if (normalizedUnit.includes('k') || normalizedUnit === 'kilometers') {
    return distance * 0.621371;
  }
  // Convert Meters (5000m, 3200m) to Miles
  if (normalizedUnit === 'meters' || normalizedUnit === 'm') {
    return distance / 1609.344;
  }
  
  // If it's already "Miles" or "mi", just return the number
  return distance;
};

// --- CUSTOM SVG CHART COMPONENT ---
const PerformanceChart = ({ data }: { data: ChartableResult[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-slate-400 italic">No race data available for this view.</div>;
  }

  // Calculate scales based on PACE instead of total time
  const paces = data.map(d => d.paceSeconds);
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const pacePadding = (maxPace - minPace) * 0.1 || 15; // Add a little padding to the top/bottom of the chart

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
    <div className="relative w-full h-80 bg-slate-50/50 rounded-xl border border-slate-100 p-4 mt-6">
      {/* Y-Axis Labels (Now showing Pace) */}
      <div className="absolute left-4 top-4 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400 font-medium z-10">
        <span>{secondsToTime(minPace - pacePadding)}</span>
        <span>{secondsToTime(minPace + (maxPace - minPace) / 2)}</span>
        <span>{secondsToTime(maxPace + pacePadding)}</span>
      </div>

      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {/* Grid Lines */}
        <line x1="15%" y1="0%" x2="100%" y2="0%" stroke="#e2e8f0" strokeDasharray="4 4" />
        <line x1="15%" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeDasharray="4 4" />
        <line x1="15%" y1="100%" x2="100%" y2="100%" stroke="#e2e8f0" strokeDasharray="4 4" />

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
          className="absolute z-20 bg-slate-900 text-white text-sm rounded-lg py-2 px-3 shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none transition-all"
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

// --- MAIN DASHBOARD COMPONENT ---
export default function RunnerDashboard({ runner, results }: RunnerDashboardProps) {
  // Check if the runner has records for each level
  const hasHS = results.some(r => r.JH !== 1);
  const hasJH = results.some(r => r.JH === 1);

  // Default to HS if they have it, otherwise default to JH
  const [activeTab, setActiveTab] = useState<'HS' | 'JH'>(hasHS ? 'HS' : 'JH');
  const [selectedSeason, setSelectedSeason] = useState<number | 'Career'>('Career');

// Process data for charts and PRs
  const processedResults = useMemo(() => {
    return results.map(r => {
      const sec = timeToSeconds(r.Time);
      const distNum = parseFloat(r.Distance);
      
      // Calculate true distance in miles for accurate pacing
      const distInMiles = getDistanceInMiles(distNum, r.DistanceUnit);
      const paceSec = sec / (distInMiles || 1);

      // Clean up the time string (e.g., '00:15:30' -> '15:30', '00:09:45' -> '9:45')
      let cleanTime = r.Time.replace(/^00:/, '');
      if (cleanTime.startsWith('0')) {
        cleanTime = cleanTime.substring(1);
      }

      return {
        ...r,
        seconds: sec,
        DisplayTime: cleanTime,
        paceSeconds: paceSec,                 // Added this so the chart can do math with it
        pace: secondsToTime(paceSec)          // This stays a formatted string for display
      };
    });
  }, [results]);

  // Filter by High School vs Junior High
  const filteredResults = useMemo(() => {
    return processedResults.filter(r => activeTab === 'JH' ? r.JH === 1 : r.JH !== 1);
  }, [activeTab, processedResults]);

  // Available seasons for the dropdown
  const availableSeasons = useMemo(() => {
    return Array.from(new Set(filteredResults.map(r => r.Season))).sort((a, b) => b - a);
  }, [filteredResults]);

  // Ensure selected season is valid if tabs change
  useMemo(() => {
    if (selectedSeason !== 'Career' && !availableSeasons.includes(selectedSeason)) {
      setSelectedSeason('Career');
    }
  }, [activeTab, availableSeasons, selectedSeason]);

  // Data specifically for the chart based on season filter
  const chartData = useMemo(() => {
    if (selectedSeason === 'Career') return filteredResults;
    return filteredResults.filter(r => r.Season === selectedSeason);
  }, [filteredResults, selectedSeason]);

  // Extract Lifetime PRs for the top cards based on the filtered tab
  const lifetimePRs = useMemo(() => {
    const prs: Record<string, ChartableResult> = {};
    filteredResults.filter(r => r.isLifetimePR).forEach(r => {
      prs[r.FormattedDistance] = r;
    });
    return prs;
  }, [filteredResults]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-sky-100 border-4 border-white shadow-lg flex items-center justify-center shrink-0 text-sky-500 overflow-hidden">
           {runner.AvatarURL ? (
             <img src={runner.AvatarURL} alt={runner.Name} className="w-full h-full object-cover" />
           ) : (
             <User size={80} strokeWidth={1.5} className="mt-6" />
           )}
        </div>
        
        <div className="text-center md:text-left flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                {runner.Name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-sky-600 font-medium">
                <span className="flex items-center gap-1 bg-sky-50 px-3 py-1 rounded-full text-sm">
                  <Calendar size={16} /> Grade {runner.Grade}
                </span>
              </div>
            </div>
            
            {/* Level Tabs - Only show if the runner has BOTH levels */}
            {(hasHS && hasJH) && (
              <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('HS')}
                  className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'HS' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  High School
                </button>
                <button 
                  onClick={() => setActiveTab('JH')}
                  className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'JH' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Junior High
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PR Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(lifetimePRs).map(([distance, result]) => (
          <div key={distance} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Map size={14} /> {distance} PR
            </p>
            <h2 className="text-4xl font-extrabold text-sky-500 my-2">{result.DisplayTime}</h2>
            <p className="text-sm text-slate-500 font-medium truncate">{result.MeetName}</p>
            <p className="text-xs text-slate-400 mt-1">{result.Season} Season • Pace: {result.pace}</p>
          </div>
        ))}
        {Object.keys(lifetimePRs).length === 0 && (
          <div className="col-span-3 text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
            No Personal Records found for this level.
          </div>
        )}
      </div>

      {/* Interactive Chart Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                <Activity size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mr-2">Performance Trends</h3>
            </div>
            
            {/* Chart Legend */}
            <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
               <div className="flex items-center gap-1.5">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="#fcd34d" stroke="#d97706" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                 Lifetime PR
               </div>
               <div className="flex items-center gap-1.5">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="#10b981" stroke="#047857" strokeWidth="3"><polygon points="12 2 22 12 12 22 2 12" /></svg>
                 Season PR
               </div>
            </div>
          </div>
          
          <div className="relative w-full md:w-auto">
            <select 
              value={selectedSeason} 
              onChange={(e) => setSelectedSeason(e.target.value === 'Career' ? 'Career' : Number(e.target.value))}
              className="w-full md:w-48 appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer"
            >
              <option value="Career">Career View</option>
              {availableSeasons.map(s => <option key={s} value={s}>{s} Season</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        <PerformanceChart data={chartData} />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Meet Name</th>
                <th className="p-4 font-bold">Distance</th>
                <th className="p-4 font-bold text-right">Time</th>
                <th className="p-4 font-bold text-right">Avg Pace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Reverse so the newest races are at the top of the table */}
              {chartData.slice().reverse().map((result, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm text-slate-600 font-medium">
                    {new Date(result.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
                  </td>
                  <td className="p-4 text-sm text-slate-800 font-bold">
                    {result.MeetName}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {result.FormattedDistance}
                  </td>
                  <td className="p-4 text-sm text-sky-600 font-bold text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {result.isLifetimePR && (
                        <svg title="Lifetime PR" width="14" height="14" viewBox="0 0 24 24" fill="#fcd34d" stroke="#d97706" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                      {result.isSeasonPR && !result.isLifetimePR && (
                        <svg title="Season PR" width="12" height="12" viewBox="0 0 24 24" fill="#10b981" stroke="#047857" strokeWidth="3">
                          <polygon points="12 2 22 12 12 22 2 12" />
                        </svg>
                      )}
                      {result.DisplayTime}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500 text-right">
                    {result.pace} /mi
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}