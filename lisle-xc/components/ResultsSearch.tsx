'use client';

import React, { useState } from 'react';
import { LifetimePRIcon, SeasonPRIcon } from '@/components/Icons';
import Button  from '@/components/Button'

export interface SearchFormState {
  startDate: string;
  endDate: string;
  athleteId: string;
  routeId: string;
  distance: string;
  gender: string;
  grade: string;
  minTime: string;
  maxTime: string;
  prStatus: string;
  level?: "HS" | "JH";
}

interface RunnerOption {
  Key: string | number;
  Name: string;
}

interface RouteOption {
  RouteKey: string | number;
  Name: string;
}

interface DistanceOption {
  Distance: string | number;
  DistanceUnit: string;
}

interface ResultsSearchProps {
  options: {
    runners: RunnerOption[];
    routes: RouteOption[];
    distances: DistanceOption[];
  };
  activeLevel: "HS" | "JH";
  onSearch: (filters: SearchFormState) => void;
}

export default function ResultsSearch({ options, activeLevel, onSearch }: ResultsSearchProps) {
  const initialFormState: SearchFormState = {
    startDate: '',
    endDate: '',
    athleteId: '',
    routeId: '',
    distance: '',
    gender: '',
    grade: '',
    minTime: '',
    maxTime: '',
    prStatus: '',
    level: activeLevel,
  };

  const [searchForm, setSearchForm] = useState<SearchFormState>(initialFormState);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setSearchForm(initialFormState);
    // Directly passing the cleared state + current level
    onSearch({ ...initialFormState, level: activeLevel });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({ ...searchForm, level: activeLevel });
  };

  return (
    <form onSubmit={handleSearchSubmit} className="bg-background border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="font-heading text-xl font-bold text-foreground border-b border-light-blue-gray pb-2 mb-4">
        Search Filters
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
        {/* Date Filters */}
        <input 
          type="date" 
          name="startDate" 
          value={searchForm.startDate} 
          onChange={handleSearchChange} 
          className="p-2 border border-border rounded text-foreground bg-background" 
          title="Start Date" 
        />
        <input 
          type="date" 
          name="endDate" 
          value={searchForm.endDate} 
          onChange={handleSearchChange} 
          className="p-2 border border-border rounded text-foreground bg-background" 
          title="End Date" 
        />
        
        {/* Athlete Select */}
        <select name="athleteId" value={searchForm.athleteId} onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
          <option value="">Any Athlete</option>
          {options.runners.map(r => (
            <option key={r.Key} value={r.Key.toString()}>{r.Name}</option>
          ))}
        </select>

        {/* Route Select */}
        <select name="routeId" value={searchForm.routeId} onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
          <option value="">Any Route</option>
          {options.routes?.map(r => (
            <option key={r.RouteKey} value={r.RouteKey.toString()}>{r.Name}</option>
          ))}
        </select>

        {/* Distance Select */}
        <select name="distance" value={searchForm.distance} onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
          <option value="">Any Distance</option>
          {options.distances.map((d, idx) => (
            <option key={idx} value={`${d.Distance}-${d.DistanceUnit}`}>
              {d.Distance} {d.DistanceUnit}
            </option>
          ))}
        </select>
        
        {/* Gender Select */}
        <select name="gender" value={searchForm.gender} onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
          <option value="">Any Gender</option>
          <option value="M">Boys</option>
          <option value="F">Girls</option>
        </select>
        
        {/* Grade Select */}
        <select name="grade" value={searchForm.grade} onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
          <option value="">Any Grade</option>
          <option value="12">Senior</option>
          <option value="11">Junior</option>
          <option value="10">Sophomore</option>
          <option value="9">Freshman</option>
          <option value="8">8th Grade</option>
          <option value="7">7th Grade</option>
          <option value="6">6th Grade</option>
        </select>

        {/* Time Inputs */}
        <div className="flex space-x-2">
          <input 
            type="text" 
            name="minTime" 
            placeholder="Slower than" 
            value={searchForm.minTime} 
            onChange={handleSearchChange} 
            className="w-1/2 p-2 border border-border rounded text-foreground bg-background" 
          />
          <input 
            type="text" 
            name="maxTime" 
            placeholder="Faster than" 
            value={searchForm.maxTime} 
            onChange={handleSearchChange} 
            className="w-1/2 p-2 border border-border rounded text-foreground bg-background" 
          />
        </div>

        {/* PR Status Select */}
        <select name="prStatus" value={searchForm.prStatus} onChange={handleSearchChange} className="p-2 border border-border rounded text-foreground bg-background">
          <option value="">Any Result</option>
          <option value="Lifetime">Lifetime PRs Only</option>
          <option value="Season">Season PRs Only</option>
        </select>
      </div>

      {/* Form Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-light-blue-gray/50 pt-4">
        
        {/* PR Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-lisle-blue bg-light-blue-gray px-4 py-2 rounded-full border border-border shadow-sm">
          <div className="flex items-center gap-1.5">
            <LifetimePRIcon width="12" height="12" />
            <span>Lifetime PR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <SeasonPRIcon width="10" height="10" />
            <span>Season PR</span>
          </div>
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          {/* Clear Filters */}
          <Button 
            type="button" 
            size="md"
            isActive={true}
            onClick={handleClearFilters}
            className="flex-1 sm:flex-none"
          >
            Clear Filters
          </Button>

          {/* Search Results */}
          <Button 
            type="submit" 
            size="md"
            isActive={false}
            className="flex-1 sm:flex-none"
          >
            Search Results
          </Button>
        </div>
      </div>
    </form>
  );
}