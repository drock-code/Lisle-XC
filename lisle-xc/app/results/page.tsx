"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { timeToSeconds, secondsToTime } from '@/lib/utils';

// Strict typing for our frontend state
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

type SortColumn = 'Runner' | 'Grade' | 'Time' | null;
type SortDirection = 'asc' | 'desc';

export default function ResultsPage() {
  const [activeView, setActiveView] = useState<'Meet' | 'Runner' | 'Table'>('Meet');
  const [activeLevel, setActiveLevel] = useState<'HS' | 'JH'>('HS');
  
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination and Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDirection }>({
    key: null,
    direction: 'asc'
  });

  // Options for our dropdowns
  const [options, setOptions] = useState<{
    runners: RunnerOption[];
    routes: RouteOption[];
    distances: DistanceOption[];
  }>({ runners: [], routes: [], distances: [] });

  // Search Form State
  const [searchForm, setSearchForm] = useState({
    startDate: '', endDate: '', athleteId: '', gender: '', grade: '',
    routeId: '', distance: '', minTime: '', maxTime: '', prStatus: ''
  });

  // 1. Fetch dropdown options on initial load
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

  // 2. Fetch results whenever the level changes or a search is submitted
  const fetchResults = async (overrideFilters: FilterPayload | null = null) => {
    setIsLoading(true);
    try {
      const payload = overrideFilters || { ...searchForm, level: activeLevel };
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data: ResultItem[] = await res.json();
      
      let finalData = data;
      if (searchForm.prStatus === 'Lifetime') finalData = finalData.filter(r => r.isLifetimePR);
      if (searchForm.prStatus === 'Season') finalData = finalData.filter(r => r.isSeasonPR);
      
      setResults(finalData);
      setCurrentPage(1); // Reset to first page on new fetch
    } catch (error) {
      console.error("Failed to load results", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Initial load defaults to current season for the active level
  useEffect(() => {
    fetchResults({ level: activeLevel });
  }, [activeLevel]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchForm({ ...searchForm, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
    setActiveView('Table'); // Automatically switch to the flat table on search
  };

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
    if (!sortConfig.key) return 0;
    
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;

    if (sortConfig.key === 'Runner') return a.Runner.localeCompare(b.Runner) * modifier;
    if (sortConfig.key === 'Grade') return (a.Grade - b.Grade) * modifier;
    
    // CHANGED: Compare actual seconds instead of strings
    if (sortConfig.key === 'Time') return (timeToSeconds(a.Time) - timeToSeconds(b.Time)) * modifier; 
    
    if (sortConfig.key === 'MeetName') return a.MeetName.localeCompare(b.MeetName) * modifier;
    
    if (sortConfig.key === 'Date') {
      const dateA = new Date(a.Date).getTime();
      const dateB = new Date(b.Date).getTime();
      return (dateA - dateB) * modifier;
    }
    
    if (sortConfig.key === 'FormattedDistance') {
      return (parseFloat(a.FormattedDistance) - parseFloat(b.FormattedDistance)) * modifier;
    }
    
    return 0;
  });

  // Apply Pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group data for Meet View
  const groupedByMeet = results.reduce((acc, result) => {
    if (!acc[result.MeetName]) acc[result.MeetName] = [];
    acc[result.MeetName].push(result);
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
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
      <form onSubmit={handleSearchSubmit} className="bg-background border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-heading text-xl font-bold text-lisle-blue border-b border-light-blue-gray pb-2 mb-4">Search Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
          
          <input type="date" name="startDate" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background" title="Start Date" />
          <input type="date" name="endDate" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background" title="End Date" />
          
          <select name="athleteId" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
            <option value="">Any Athlete</option>
            {options.runners.map(r => (
              <option key={r.Key} value={r.Key}>{r.Name}</option>
            ))}
          </select>

          <select name="routeId" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
            <option value="">Any Route</option>
            {options.routes?.map(r => (
              <option key={r.RouteKey} value={r.RouteKey}>{r.Name}</option>
            ))}
          </select>

          <select name="distance" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
            <option value="">Any Distance</option>
            {options.distances.map((d, idx) => (
              <option key={idx} value={`${d.Distance}-${d.DistanceUnit}`}>
                {d.Distance} {d.DistanceUnit}
              </option>
            ))}
          </select>
          
          <select name="gender" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
            <option value="">Any Gender</option>
            <option value="M">Boys</option>
            <option value="F">Girls</option>
          </select>
          
          <select name="grade" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
            <option value="">Any Grade</option>
            <option value="9">Freshman</option>
            <option value="10">Sophomore</option>
            <option value="11">Junior</option>
            <option value="12">Senior</option>
            <option value="8">8th Grade</option>
            <option value="7">7th Grade</option>
            <option value="6">6th Grade</option>
          </select>

          <div className="flex space-x-2">
            <input type="time" step="1" name="minTime" onChange={handleSearchChange} className="w-1/2 p-2 border border-border rounded text-foreground bg-background" title="Min Time" />
            <input type="time" step="1" name="maxTime" onChange={handleSearchChange} className="w-1/2 p-2 border border-border rounded text-foreground bg-background" title="Max Time" />
          </div>

          <select name="prStatus" onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
            <option value="">Any Result</option>
            <option value="Lifetime">Lifetime PRs Only</option>
            <option value="Season">Season PRs Only</option>
          </select>

        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" className="bg-lisle-blue text-background font-bold py-2 px-6 rounded hover:bg-light-blue transition-colors">
            Search Results
          </button>
        </div>
      </form>

      {/* RESULTS DISPLAY */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="text-center py-12 text-light-gray font-bold animate-pulse">Loading Results...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-light-gray font-bold">No results found for these filters.</div>
        ) : activeView === 'Table' ? (
          /* --- SINGLE TABLE VIEW --- */
          <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="bg-background text-light-gray font-bold uppercase border-b border-light-blue-gray select-none">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:text-lisle-blue transition-colors" onClick={() => handleSort('Runner')}>
                      Runner {getSortIcon('Runner')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-lisle-blue transition-colors" onClick={() => handleSort('Grade')}>
                      Grade {getSortIcon('Grade')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-lisle-blue transition-colors" onClick={() => handleSort('Time')}>
                      Time {getSortIcon('Time')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-lisle-blue transition-colors" onClick={() => handleSort('MeetName')}>
                      Meet {getSortIcon('MeetName')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-lisle-blue transition-colors" onClick={() => handleSort('Date')}>
                      Date {getSortIcon('Date')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-lisle-blue transition-colors" onClick={() => handleSort('FormattedDistance')}>
                      Distance {getSortIcon('FormattedDistance')}
                    </th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((r, idx) => (
                    <tr key={idx} className="border-b border-light-blue-gray/30 hover:bg-light-blue-gray/10 transition-colors">
                      <td className="px-4 py-3 flex items-center space-x-3">
                        <Link href={`/roster/${r.RunnerID}`} className="flex items-center space-x-3 hover:text-light-blue transition-colors text-foreground font-bold">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-light-blue-gray shrink-0 border border-border">
                            {r.AvatarURL ? (
                              <img src={r.AvatarURL} alt={r.Runner} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lisle-blue font-bold text-xs">{r.Runner.charAt(0)}</div>
                            )}
                          </div>
                          <span>{r.Runner}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-foreground">{r.Grade}</td>
                      <td className="px-4 py-3 font-bold text-lisle-blue">
  {secondsToTime(timeToSeconds(r.Time))}
</td>
                      <td className="px-4 py-3 text-foreground">{r.MeetName}</td>
                      <td className="px-4 py-3 text-foreground">{new Date(r.Date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                      <td className="px-4 py-3 text-foreground">{r.FormattedDistance}</td>
                      <td className="px-4 py-3">
                        {r.isLifetimePR && <span className="text-xs bg-lisle-blue text-background px-2 py-1 rounded font-bold uppercase mr-2">PR</span>}
                        {r.isSeasonPR && !r.isLifetimePR && <span className="text-xs bg-light-blue text-lisle-blue px-2 py-1 rounded font-bold uppercase">SR</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-light-blue-gray/20 border-t border-border p-4 flex justify-between items-center text-sm font-bold text-lisle-blue">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-1 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-light-blue'}`}
                >
                  <ChevronLeft size={16} /> <span>Previous</span>
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-1 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-light-blue'}`}
                >
                  <span>Next</span> <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : activeView === 'Meet' ? (
          /* --- MEET VIEW --- */
          Object.entries(groupedByMeet).map(([meetName, meetResults]) => (
            <div key={meetName} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-light-blue-gray p-4 border-b border-border">
                <h3 className="font-heading font-bold text-xl text-lisle-blue">{meetName}</h3>
                <p className="text-sm text-lisle-blue">{new Date(meetResults[0].Date).toLocaleDateString()} • {meetResults[0].FormattedDistance}</p>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="bg-background text-light-gray font-bold uppercase border-b border-light-blue-gray">
                    <tr>
                      <th className="px-4 py-3">Runner</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetResults.map((r, idx) => (
                      <tr key={idx} className="border-b border-light-blue-gray/30 hover:bg-light-blue-gray/10 transition-colors">
                        <td className="px-4 py-3 flex items-center space-x-3">
                          <Link href={`/roster/${r.RunnerID}`} className="flex items-center space-x-3 hover:text-light-blue transition-colors text-foreground font-bold">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-light-blue-gray shrink-0 border border-border">
                              {r.AvatarURL ? (
                                <img src={r.AvatarURL} alt={r.Runner} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lisle-blue font-bold text-xs">{r.Runner.charAt(0)}</div>
                              )}
                            </div>
                            <span>{r.Runner}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-foreground">{r.Grade}</td>
                        <td className="px-4 py-3 font-bold text-lisle-blue">
  {secondsToTime(timeToSeconds(r.Time))}
</td>
                        <td className="px-4 py-3">
                          {r.isLifetimePR && <span className="text-xs bg-lisle-blue text-background px-2 py-1 rounded font-bold uppercase mr-2">PR</span>}
                          {r.isSeasonPR && !r.isLifetimePR && <span className="text-xs bg-light-blue text-lisle-blue px-2 py-1 rounded font-bold uppercase">SR</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          /* --- RUNNER VIEW --- */
          Object.entries(groupedByRunner).map(([runnerName, runnerResults]) => (
            <div key={runnerName} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
               <div className="bg-light-blue-gray p-4 border-b border-border flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-background shrink-0 border-2 border-lisle-blue">
                    {runnerResults[0].AvatarURL ? (
                      <img src={runnerResults[0].AvatarURL} alt={runnerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lisle-blue font-bold text-lg">{runnerName.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-xl text-lisle-blue">{runnerName}</h3>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="bg-background text-light-gray font-bold uppercase border-b border-light-blue-gray">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Meet</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runnerResults.map((r, idx) => (
                      <tr key={idx} className="border-b border-light-blue-gray/30 hover:bg-light-blue-gray/10 transition-colors">
                        <td className="px-4 py-3 text-foreground">{new Date(r.Date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                        <td className="px-4 py-3 text-foreground font-bold">{r.MeetName}</td>
                        <td className="px-4 py-3 text-foreground">{r.FormattedDistance}</td>
                        <td className="px-4 py-3 font-bold text-lisle-blue">
  {secondsToTime(timeToSeconds(r.Time))}
</td>
                        <td className="px-4 py-3">
                          {r.isLifetimePR && <span className="text-xs bg-lisle-blue text-background px-2 py-1 rounded font-bold uppercase mr-2">PR</span>}
                          {r.isSeasonPR && !r.isLifetimePR && <span className="text-xs bg-light-blue text-lisle-blue px-2 py-1 rounded font-bold uppercase">SR</span>}
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
    </div>
  );
}