"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Select } from '@/components/Select';
import RunnerAvatar from '@/components/RunnerAvatar';
import { generateSlug, formatRaceTime } from '@/lib/utils';

import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

export interface LeaderboardResultRow {
  RunnerKey: number;
  Name: string;
  AvatarURL: string | null;
  Time: string;
  Course: string;
  Date: Date | string;
}

export interface LeaderboardOptions {
  distances: { value: string; label: string }[]; 
  courses: string[];
}

export interface CurrentParams {
  gender: string;
  distance: string;
  course: string;
  grade: string;
  page: number;
}

interface LeaderboardsContentProps {
  results: LeaderboardResultRow[];
  totalCount: number;
  options: LeaderboardOptions;
  currentParams: CurrentParams;
  limit: number;
}

export default function LeaderboardsContent({ 
  results, 
  totalCount, 
  options, 
  currentParams, 
  limit 
}: LeaderboardsContentProps) {
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / limit);

  const handleFilterChange = (key: keyof CurrentParams, value: string) => {
    const params = new URLSearchParams(window.location.search);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    //  Make Course and Distance mutually exclusive
    if (key === 'course' && value) {
      // Explicitly set distance to "any" so the server doesn't default back to "3"
      params.set('distance', 'any');
    } else if (key === 'distance' && value !== 'any') {
      params.delete('course');
    }

    params.set('page', '1');
    params.set('tab', 'leaderboards');
    router.push(`/records?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    params.set('tab', 'leaderboards');
    router.push(`/records?${params.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    router.push('/records?tab=leaderboards', { scroll: false });
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Team Leaderboards</h2>
        <Button size="sm" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-light-blue-gray/10 p-4 rounded-2xl border border-border">
        <Select 
          value={currentParams.gender} 
          onChange={(e) => handleFilterChange('gender', e.target.value)}
        >
          <option value="M">Boys</option>
          <option value="F">Girls</option>
        </Select>

        <Select 
          value={currentParams.distance || 'any'} 
          onChange={(e) => handleFilterChange('distance', e.target.value)}
        >
          <option value="any">Any Distance</option>
          {options.distances.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </Select>

        <Select 
          value={currentParams.course || ''} 
          onChange={(e) => handleFilterChange('course', e.target.value)}
        >
          <option value="">Any Course</option>
          {options.courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select 
          value={currentParams.grade || ''} 
          onChange={(e) => handleFilterChange('grade', e.target.value)}
        >
          <option value="">Any Grade</option>
          <option value="12">Senior</option>
          <option value="11">Junior</option>
          <option value="10">Sophomore</option>
          <option value="9">Freshman</option>
          <option value="8">8th Grade</option>
          <option value="7">7th Grade</option>
          <option value="6">6th Grade</option>
        </Select>
      </div>

      {/* Results List */}
      <div className="space-y-3 mt-6">
        {results.length > 0 ? results.map((row, idx) => {
          const rank = ((currentParams.page - 1) * limit) + idx + 1;
          const dateStr = new Date(row.Date).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });

          return (
            <Link 
              key={row.RunnerKey} 
              href={`/runners/${row.RunnerKey}-${generateSlug(row.Name)}`}
              className="group flex items-center justify-between p-4 rounded-2xl border border-border bg-background hover:bg-light-blue-gray/10 hover:border-light-blue/50 transition-all shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <span className="font-heading text-2xl font-black text-light-blue/40 w-8 text-right group-hover:text-light-blue transition-colors">
                  {rank}
                </span>
                <RunnerAvatar src={row.AvatarURL} name={row.Name} size="md" />
                <div>
                  <p className="font-bold text-foreground group-hover:text-light-blue transition-colors">
                    {row.Name}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    {!currentParams.course && <span className="mr-2">{row.Course}</span>}
                    {dateStr}
                  </p>
                </div>
              </div>
              <div className="font-heading text-xl font-extrabold text-foreground">
                {formatRaceTime(row.Time)}
              </div>
            </Link>
          );
        }) : (
          <div className="text-center py-12 bg-background rounded-2xl border border-border shadow-sm">
            <p className="text-muted-foreground font-medium">No performances found for these criteria.</p>
            <Button size="sm" onClick={handleResetFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="mt-6 rounded-2xl overflow-hidden border border-border">
          <Pagination 
            currentPage={currentParams.page} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}
    </div>
  );
}