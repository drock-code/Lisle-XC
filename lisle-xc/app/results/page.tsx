"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

import ResultsSearch from '@/components/ResultsSearch';
import Pagination from '@/components/Pagination';

import { timeToSeconds, formatRaceTime, generateSlug } from '@/lib/utils';
import {LifetimePRIcon, SeasonPRIcon} from '@/components/Icons';
import RunnerAvatar from '@/components/RunnerAvatar';

interface RunnerOption { Key: number; Name: string; }
interface RouteOption { RouteKey: number; Name: string; }
interface DistanceOption { Distance: string; DistanceUnit: string; }

interface ResultItem {
  Runner: string;
  RunnerID: number;
  Grade: number;
  Time: string;
  isLifetimePR: boolean;
  isSeasonPR: boolean;
  MeetName: string;
  Date: string;
  FormattedDistance: string;
  AvatarURL: string | null;
  Gender: string;
}

interface FilterPayload {
  startDate?: string;
  endDate?: string;
  athleteId?: string;
  gender?: string;
  grade?: string;
  routeId?: string;
  distance?: string;
  minTime?: string;
  maxTime?: string;
  prStatus?: string;
  level?: 'HS' | 'JH';
}

type SortColumn = 'Runner' | 'Grade' | 'Time' | 'Date' | 'MeetName' | 'FormattedDistance' |null;
type SortDirection = 'asc' | 'desc';

export default function ResultsPage() {
  const [activeView, setActiveView] = useState<'Meet' | 'Runner' | 'Table'>('Meet');
  const [activeLevel, setActiveLevel] = useState<'HS' | 'JH'>('HS');
  
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInput, setPageInput] = useState('1');

  // Pagination and Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDirection }>({
    key: 'Date',      // Default to Date
    direction: 'desc' // Default to Most Recent First
  });

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setCurrentPage(val);
      } else {
        setPageInput(currentPage.toString()); // Reset on invalid input
      }
    }
  };

  // Options for dropdowns
  const [options, setOptions] = useState<{
    runners: RunnerOption[];
    routes: RouteOption[];
    distances: DistanceOption[];
  }>({ runners: [], routes: [], distances: [] });

  // Search Form State
  const [searchForm] = useState({
    startDate: '', endDate: '', athleteId: '', gender: '', grade: '',
    routeId: '', distance: '', minTime: '', maxTime: '', prStatus: ''
  });

  // Fetch dropdown options on initial load
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch('/api/results/options');
        const data = await res.json();
        setOptions(data);
      } catch (error) {
        console.error("Failed to load options", error);
      }
    };
    fetchOptions();
  }, []);

  // Fetch results whenever the level changes or a search is submitted
  const fetchResults = useCallback(async (overrideFilters: FilterPayload | null = null) => {
    setIsLoading(true);
    try {
      // If no override provided, use current form state + active level
      const payload = overrideFilters || { ...searchForm, level: activeLevel };
      
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Network response was not ok');
      
      const data: ResultItem[] = await res.json();
      
      setResults(data);
      setCurrentPage(1); 
    } catch (error) {
      console.error("Failed to load results", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchForm, activeLevel]); 

  useEffect(() => {
    // We pass the level specifically to ensure the initial load is correct even if the form hasn't been touched.
    fetchResults({ ...searchForm, level: activeLevel });
}, [activeLevel, fetchResults, searchForm]);

  // Sorting Handler
  const handleSort = (key: SortColumn) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Apply Sorting
  const sortedResults = [...results].sort((a, b) => {
    let primaryDiff = 0;

    // 1. Calculate the primary difference based on the clicked column
    if (sortConfig.key === 'Runner') {
      primaryDiff = a.Runner.localeCompare(b.Runner);
    } else if (sortConfig.key === 'Grade') {
      primaryDiff = a.Grade - b.Grade;
    } else if (sortConfig.key === 'Time') {
      primaryDiff = timeToSeconds(a.Time) - timeToSeconds(b.Time);
    } else if (sortConfig.key === 'MeetName') {
      primaryDiff = a.MeetName.localeCompare(b.MeetName);
    } else if (sortConfig.key === 'Date') {
      primaryDiff = new Date(a.Date).getTime() - new Date(b.Date).getTime();
    } else if (sortConfig.key === 'FormattedDistance') {
      primaryDiff = parseFloat(a.FormattedDistance) - parseFloat(b.FormattedDistance);
    }

    // 2. If the primary values are identical, ALWAYS tie-break by Runner Name (A-Z)
    if (primaryDiff === 0 && sortConfig.key !== 'Runner') {
      return a.Runner.localeCompare(b.Runner);
    }

    // 3. Apply the Ascending/Descending modifier to the primary sort
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    return primaryDiff * modifier;
  });

  // Apply Pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group by a unique string that includes the Date
  const groupedByMeet = results.reduce((acc, result) => {
    // e.g., "Ken Jakalski Mane Event|2024-10-05"
    const uniqueMeetKey = `${result.MeetName}|${result.Date}`; 
    
    if (!acc[uniqueMeetKey]) acc[uniqueMeetKey] = [];
    acc[uniqueMeetKey].push(result);
    return acc;
  }, {} as Record<string, ResultItem[]>);

  // Group data for Runner View
  const groupedByRunner = results.reduce((acc, result) => {
    if (!acc[result.Runner]) acc[result.Runner] = [];
    acc[result.Runner].push(result);
    return acc;
  }, {} as Record<string, ResultItem[]>);

  // Sort Indicator Icon
  const getSortIcon = (column: SortColumn) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)]">
        Race Results
      </h1>

      {/* TOP CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-background p-4 rounded-2xl border border-border">
        {/* View Toggle */}
        <div className="flex bg-light-blue-gray rounded-xl p-1 shadow-inner shrink-0 w-full md:w-auto">
          <button 
            onClick={() => setActiveView('Meet')}
            className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === 'Meet' ? 'bg-background text-foreground shadow-sm' : 'text-lisle-blue hover:text-background cursor-pointer'}`}
          >
            By Meet
          </button>
          <button 
            onClick={() => setActiveView('Runner')}
            className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === 'Runner' ? 'bg-background text-foreground shadow-sm' : 'text-lisle-blue hover:text-background cursor-pointer'}`}
          >
            By Runner
          </button>
          <button 
            onClick={() => setActiveView('Table')}
            className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeView === 'Table' ? 'bg-background text-foreground shadow-sm' : 'text-lisle-blue hover:text-background cursor-pointer'}`}
          >
            All Results
          </button>
        </div>

        {/* HS vs JH Toggle */}
        <div className="flex bg-light-blue-gray rounded-xl p-1 shadow-inner shrink-0 w-full md:w-auto">
          <button 
            onClick={() => setActiveLevel('HS')}
            className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeLevel === 'HS' ? 'bg-background text-foreground shadow-sm' : 'text-lisle-blue hover:text-background cursor-pointer'}`}
          >
            High School
          </button>
          <button 
            onClick={() => setActiveLevel('JH')}
            className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeLevel === 'JH' ? 'bg-background text-foreground shadow-sm' : 'text-lisle-blue hover:text-background cursor-pointer'}`}
          >
            Junior High
          </button>
        </div>
      </div>

      {/* SEARCH FORM */}
      <ResultsSearch 
        key={activeLevel}
        options={options} 
        activeLevel={activeLevel} 
        onSearch={(filters) => {
          setCurrentPage(1); 
          fetchResults(filters); 
        }} 
      />

      {/* RESULTS DISPLAY */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="text-center py-12 text-light-gray bg-background font-bold border border-border rounded-2xl overflow-hidden shadow-sm animate-pulse">Loading Results...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-light-gray bg-background font-bold border border-border rounded-2xl overflow-hidden shadow-sm">No results found for these filters.</div>
        ) : activeView === 'Table' ? (
          /* --- SINGLE TABLE VIEW --- */
          <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-175">
                <thead className="bg-background text-foreground font-bold uppercase border-b border-light-blue-gray select-none">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:text-light-blue transition-colors" onClick={() => handleSort('Runner')}>
                      Runner {getSortIcon('Runner')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-light-blue transition-colors" onClick={() => handleSort('Grade')}>
                      Grade {getSortIcon('Grade')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-light-blue transition-colors" onClick={() => handleSort('Time')}>
                      Time {getSortIcon('Time')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-light-blue transition-colors" onClick={() => handleSort('MeetName')}>
                      Meet {getSortIcon('MeetName')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-light-blue transition-colors" onClick={() => handleSort('Date')}>
                      Date {getSortIcon('Date')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-light-blue transition-colors" onClick={() => handleSort('FormattedDistance')}>
                      Distance {getSortIcon('FormattedDistance')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((r, idx) => (
                    <tr key={idx} className="border-b border-light-blue-gray/30 hover:bg-light-blue-gray/10 transition-colors">
                      <td className="px-4 py-3 flex items-center space-x-3">
                        <Link 
                          href={`/runners/${r.RunnerID}-${generateSlug(r.Runner)}`} 
                          className="flex items-center space-x-3 hover:text-light-blue transition-colors text-foreground font-bold group"
                        >
                          <RunnerAvatar 
                            src={r.AvatarURL} 
                            name={r.Runner} 
                            size="sm" 
                            className="group-hover:scale-105" 
                          />
                          <span>{r.Runner}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-foreground">{r.Grade}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">
                            {formatRaceTime(r.Time)}
                          </span>
                          {/* PR Icons */}
                          {r.isLifetimePR ? (
                            <LifetimePRIcon className="shrink-0" />
                          ) : r.isSeasonPR ? (
                            <SeasonPRIcon className="shrink-0" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{r.MeetName}</td>
                      <td className="px-4 py-3 text-foreground">{new Date(r.Date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                      <td className="px-4 py-3 text-foreground">{r.FormattedDistance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
       ) : activeView === 'Meet' ? (
          /* --- MEET VIEW --- */
          Object.entries(groupedByMeet).map(([uniqueMeetKey, meetResults]) => {
            // Extract the actual display name from the first result in the group
            const displayMeetName = meetResults[0].MeetName;
            
            return (
              <div key={uniqueMeetKey} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-light-blue-gray p-4 border-b border-border">
                  <h3 className="font-heading font-bold text-xl text-lisle-blue">{displayMeetName}</h3>
                  <p className="text-sm text-lisle-blue">{new Date(meetResults[0].Date).toLocaleDateString()} • {meetResults[0].FormattedDistance}</p>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-125">
                    <thead className="bg-background text-foreground font-bold uppercase border-b border-light-blue-gray">
                      <tr>
                        <th className="px-4 py-3">Runner</th>
                        <th className="px-4 py-3">Grade</th>
                        <th className="px-4 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetResults.map((r, idx) => (
                        <tr key={idx} className="border-b border-light-blue-gray/30 hover:bg-light-blue-gray/10 transition-colors">
                          <td className="px-4 py-3 flex items-center space-x-3">
                            <Link 
                              href={`/runners/${r.RunnerID}-${generateSlug(r.Runner)}`} 
                              className="flex items-center space-x-3 hover:text-light-blue transition-colors text-foreground font-bold group"
                            >
                              <RunnerAvatar 
                                src={r.AvatarURL} 
                                name={r.Runner} 
                                size="sm" 
                                className="group-hover:scale-105" 
                              />
                              <span>{r.Runner}</span>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-foreground">{r.Grade}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-foreground">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">
                                {formatRaceTime(r.Time)}
                              </span>
                              {/* PR Icons */}
                              {r.isLifetimePR ? (
                                <LifetimePRIcon className="shrink-0" />
                              ) : r.isSeasonPR ? (
                                <SeasonPRIcon className="shrink-0" />
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        ) : (
          
          /* --- RUNNER VIEW --- */
          Object.entries(groupedByRunner)
            .sort(([runnerA], [runnerB]) => runnerA.localeCompare(runnerB))
            .map(([runnerName, runnerResults]) => (
            <div key={runnerName} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
               <div className="bg-light-blue-gray p-4 border-b border-border flex items-center space-x-4">
                  <RunnerAvatar 
                      src={runnerResults[0].AvatarURL} 
                      name={runnerName} 
                      size="md" 
                  />
                  <h3 className="text-lg font-bold text-lisle-blue">
                    <Link 
                      href={`/runners/${runnerResults[0].RunnerID}-${generateSlug(runnerName)}`}
                      className="hover:underline cursor-pointer"
                    >
                      {runnerName}
                    </Link>
                  </h3>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-125">
                  <thead className="bg-background text-foreground font-bold uppercase border-b border-light-blue-gray">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Meet</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runnerResults.map((r, idx) => (
                      <tr key={idx} className="border-b border-light-blue-gray/30 hover:bg-light-blue-gray/10 transition-colors">
                        <td className="px-4 py-3 text-foreground">{new Date(r.Date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                        <td className="px-4 py-3 text-foreground font-bold">{r.MeetName}</td>
                        <td className="px-4 py-3 text-foreground">{r.FormattedDistance}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-foreground">
                            <span className="font-bold">
                              {formatRaceTime(r.Time)}
                            </span>
                            {/* PR Icons */}
                            {r.isLifetimePR ? (
                              <LifetimePRIcon className="shrink-0" />
                            ) : r.isSeasonPR ? (
                              <SeasonPRIcon className="shrink-0" />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}