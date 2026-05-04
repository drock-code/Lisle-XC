"use client";

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import RunnerAvatar from '@/components/RunnerAvatar';
import { YearSelector } from '@/components/YearSelector';
import { generateSlug } from '@/lib/utils';

interface CaptainRow {
  Key?: number;
  Year: number;
  Name: string;
  RunnerKey: number | null;
  AvatarURL: string | null;
}

interface CaptainsContentProps {
  captains: CaptainRow[];
}

export default function CaptainsContent({ captains }: CaptainsContentProps) {
  const searchParams = useSearchParams();

  // Extract unique years from the captains array for the dropdown
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(captains.map(c => c.Year)));
    // Sort descending just in case the SQL query didn't perfectly order them
    return uniqueYears.sort((a, b) => b - a); 
  }, [captains]);

  // Read the year from the URL, or default to the most recent year if none exists
  const yearParam = searchParams.get('year');
  const activeYear = yearParam ? Number(yearParam) : (years[0] || new Date().getFullYear());

  // Filter the captains to only show those for the selected year
  const displayedCaptains = useMemo(() => {
    return captains.filter(c => c.Year === activeYear);
  }, [captains, activeYear]);

  return (
    <div className="space-y-6">
      
      {/* Header Controls: Title + Custom Select Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Team Captains</h2>
        
        <div className="flex items-center space-x-3 bg-light-blue-gray/20 px-4 py-2 rounded-xl">
          <label htmlFor="captain-year-select" className="text-sm font-bold text-foreground">Season:</label>
          <YearSelector 
            years={years} 
            selectedYear={activeYear} 
          />
        </div>
      </div>

      {/* Grid of Captains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {displayedCaptains.map((captain, idx) => {
          const CardContent = (
            <>
              <RunnerAvatar src={captain.AvatarURL} name={captain.Name} size="md" />
              <div>
                <p className={`font-bold text-foreground ${captain.RunnerKey ? 'group-hover:text-lisle-blue transition-colors' : ''}`}>
                  {captain.Name}
                </p>
                <p className="text-sm font-medium text-light-blue mt-0.5">Team Captain</p>
              </div>
            </>
          );

          // If we have a matching Runner Profile, wrap in a Link
          if (captain.RunnerKey) {
            return (
              <Link 
                key={captain.Key || idx} 
                href={`/runners/${captain.RunnerKey}-${generateSlug(captain.Name)}`} 
                className="group flex items-center space-x-4 p-4 rounded-2xl border border-border bg-light-blue-gray/10 hover:bg-light-blue-gray/30 hover:border-light-blue/50 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                {CardContent}
              </Link>
            );
          }

          // Otherwise, render a static card
          return (
            <div key={captain.Key || idx} className="flex items-center space-x-4 p-4 rounded-2xl border border-border bg-light-blue-gray/10 opacity-90">
              {CardContent}
            </div>
          );
        })}
      </div>
      
    </div>
  );
}