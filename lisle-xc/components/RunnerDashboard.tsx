"use client";

import { useState, useMemo } from 'react';
import { Calendar, Map, Activity, ChevronDown } from 'lucide-react';

import { PerformanceChart } from '@/components/PerformanceChart';
import { TabGroup, Tab } from '@/components/Tabs';
import { LifetimePRIcon, SeasonPRIcon } from '@/components/Icons';
import RunnerAvatar from '@/components/RunnerAvatar';
import {Select} from '@/components/Select';

import type { RunnerProfileRow } from '@/lib/queries';
import { timeToSeconds, secondsToTime, getDistanceInMiles } from '@/lib/utils';
import type { ProcessedResult } from '@/lib/runner-utils';

interface RunnerDashboardProps {
  runner: RunnerProfileRow;
  results: ProcessedResult[];
}

interface ChartableResult extends ProcessedResult {
  JH?: number; 
  seconds: number;
  paceSeconds: number; 
  pace: string;
  DisplayTime: string;
}

export default function RunnerDashboard({ runner, results }: RunnerDashboardProps) {
  // Check if the runner has records for each level
  const hasHS = results.some(r => r.JH !== 1);
  const hasJH = results.some(r => r.JH === 1);

  // Default to HS if they have it, otherwise default to JH
  const [activeTab, setActiveTab] = useState<'HS' | 'JH'>(hasHS ? 'HS' : 'JH');
  const [selectedSeason, setSelectedSeason] = useState<number | 'Career'>('Career');

  // Process data for charts and PRs
  const processedResults = useMemo<ChartableResult[]>(() => {
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
      paceSeconds: paceSec,                 
      pace: secondsToTime(paceSec)          
    } as ChartableResult;
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

  // Calculate the valid season on the fly (replaces the useEffect!)
  const displaySeason = (selectedSeason !== 'Career' && !availableSeasons.includes(selectedSeason)) 
    ? 'Career' 
    : selectedSeason;

  // Data specifically for the chart based on season filter
  const chartData = useMemo(() => {
    if (displaySeason === 'Career') return filteredResults;
    return filteredResults.filter(r => r.Season === displaySeason);
  }, [filteredResults, displaySeason]);

  // Extract Lifetime PRs for the top cards based on the filtered tab
  const lifetimePRs = useMemo(() => {
    const prs: Record<string, ChartableResult> = {};
    filteredResults.filter(r => r.isLifetimePR).forEach(r => {
      prs[r.FormattedDistance] = r;
    });
    return prs;
  }, [filteredResults]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-1.5">
      
      {/* Header Section */}
      <div className="bg-background rounded-4xl p-6 md:p-10 shadow-sm border border-border flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <RunnerAvatar 
          src={runner.AvatarURL} 
          name={runner.Name} 
          size="lg" 
        />
        
        <div className="text-center md:text-left flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                {runner.Name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-lisle-blue font-medium">
                <span className="flex items-center gap-1 bg-light-blue-gray px-3 py-1 rounded-full text-sm">
                  <Calendar size={16} /> Grade {runner.Grade}
                </span>
              </div>
            </div>
            
            {/* Level Tabs - Only show if the runner has BOTH levels */}
            {(hasHS && hasJH) && (
              <TabGroup className="md:w-auto">
                <Tab 
                  onClick={() => setActiveTab('HS')} 
                  label="High School" 
                  isActive={activeTab === 'HS'} 
                  className="px-6 py-2.5 flex-1 md:flex-none" 
                />
                <Tab 
                  onClick={() => setActiveTab('JH')} 
                  label="Junior High" 
                  isActive={activeTab === 'JH'} 
                  className="px-6 py-2.5 flex-1 md:flex-none" 
                />
              </TabGroup>
            )}
          </div>
        </div>
      </div>

      {/* PR Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(lifetimePRs).map(([distance, result]) => (
          <div key={distance} className="bg-background rounded-2xl p-6 border border-border shadow-sm relative overflow-hidden group">
            <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
              <Map size={14} /> {distance} PR
            </p>
            <h2 className="text-4xl font-extrabold text-light-blue my-2">{result.DisplayTime}</h2>
            <p className="text-sm text-foreground font-medium truncate">{result.MeetName}</p>
            <p className="text-xs text-foreground mt-1">{result.Season} Season • Pace: {result.pace}</p>
          </div>
        ))}
        {Object.keys(lifetimePRs).length === 0 && (
          <div className="col-span-3 text-center py-8 text-foreground bg-background rounded-2xl border border-border border-dashed">
            No Personal Records found for this level.
          </div>
        )}
      </div>

      {/* Interactive Chart Section */}
      <div className="bg-background rounded-3xl p-6 md:p-8 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 text-foreground rounded-lg">
                <Activity size={24} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mr-2">Performance Trends</h3>
            </div>
            
            {/* Chart Legend */}
            <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-lisle-blue bg-light-blue-gray px-3 py-1.5 rounded-full border border-border">
              <div className="flex items-center gap-1.5">
                <LifetimePRIcon width="12" height="12" />
                  Lifetime PR
              </div>
              <div className="flex items-center gap-1.5">
                <SeasonPRIcon width="10" height="10" />
                  Season PR
                </div>
              </div>
            </div>
          
          <div className="relative w-full md:w-auto">
            <Select 
              value={displaySeason} 
              onChange={(e) => setSelectedSeason(e.target.value === 'Career' ? 'Career' : Number(e.target.value))}
              wrapperClassName="w-full md:w-48"
              className="py-2.5 pl-4 rounded-xl"
            >
              <option value="Career">Career View</option>
              {availableSeasons.map(s => <option key={s} value={s}>{s} Season</option>)}
            </Select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground pointer-events-none" size={16} />
          </div>
        </div>

        <PerformanceChart data={chartData} />
      </div>

      {/* Data Table */}
      <div className="bg-background rounded-3xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-foreground text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Meet Name</th>
                <th className="p-4 font-bold">Distance</th>
                <th className="p-4 font-bold text-right">Time</th>
                <th className="p-4 font-bold text-right">Avg Pace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Reverse so the newest races are at the top of the table */}
              {chartData.slice().reverse().map((result, idx) => (
                <tr 
                  key={idx} 
                  className="text-foreground odd:bg-background even:bg-background/75"
                >
                  <td className="p-4 text-sm font-medium">
                    {new Date(result.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
                  </td>
                  <td className="p-4 text-sm font-bold">
                    {result.MeetName}
                  </td>
                  <td className="p-4 text-sm">
                    {result.FormattedDistance}
                  </td>
                  <td className="p-4 text-sm font-bold text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {result.isLifetimePR && <LifetimePRIcon />}
                      {result.isSeasonPR && !result.isLifetimePR && <SeasonPRIcon />}
                      {result.DisplayTime}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-right">
                    {result.pace}/mi
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