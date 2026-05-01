"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { TabGroup, Tab } from '@/components/Tabs';
import RunnerAvatar from '@/components/RunnerAvatar';
import { Select } from '@/components/Select';

import { TeamAwardRow, RunnerAwardRow } from '@/lib/queries';
import { generateSlug } from '@/lib/utils';

interface AwardsContentProps {
  years: number[];
  activeYear: number;
  teamAwards: TeamAwardRow[];
  runnerAwards: RunnerAwardRow[];
}

export default function AwardsContent({ years, activeYear, teamAwards, runnerAwards }: AwardsContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'individual' | 'team'>('individual');

  // When the user changes the year, we update the URL. 
  // The server will automatically re-fetch and pass down the new data
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    router.push(`/records?tab=awards&year=${newYear}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls: Title + Year Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Season Awards</h2>
        
        <div className="flex items-center space-x-3 bg-light-blue-gray/20 px-4 py-2 rounded-xl">
          <label htmlFor="year-select" className="text-sm font-bold text-foreground">Season:</label>
          <Select 
            id="year-select"
            value={activeYear} 
            onChange={handleYearChange}
            className="text-sm px-3 py-1.5"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Sub-Tabs for Team vs Individual */}
      <div className="flex justify-center">
        <TabGroup className="w-full sm:w-auto">
          <Tab 
            onClick={() => setActiveTab('individual')} 
            label="Individual Awards" 
            isActive={activeTab === 'individual'} 
            className="px-6 py-2.5 flex-1 sm:flex-none"
          />
          <Tab 
            onClick={() => setActiveTab('team')} 
            label="Team Awards" 
            isActive={activeTab === 'team'} 
            className="px-6 py-2.5 flex-1 sm:flex-none"
          />
        </TabGroup>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {runnerAwards.length > 0 ? (
              runnerAwards.map((award) => {
                // The visual contents of the card
                const CardContent = (
                  <>
                    <RunnerAvatar src={award.AvatarURL} name={award.Name} size="md" />
                    <div>
                      <p className={`font-bold text-foreground ${award.RunnerKey ? 'group-hover:text-lisle-blue transition-colors' : ''}`}>
                        {award.Name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-medium text-light-blue">{award.Award}</p>
                        {!!award.IsJH && (
                          <span className="bg-lisle-blue text-light-blue text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            JH
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );

                // If we have a matching Runner Profile, wrap the whole card in a Link
                if (award.RunnerKey) {
                  return (
                    <Link 
                      key={award.Key} 
                      href={`/runners/${award.RunnerKey}-${generateSlug(award.Name)}`} 
                      className="group flex items-center space-x-4 p-4 rounded-2xl border border-border bg-light-blue-gray/10 hover:bg-light-blue-gray/30 hover:border-light-blue/50 transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      {CardContent}
                    </Link>
                  );
                }

                // If no matching profile exists yet, render a standard static div
                return (
                  <div key={award.Key} className="flex items-center space-x-4 p-4 rounded-2xl border border-border bg-light-blue-gray/10 opacity-90">
                    {CardContent}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No individual awards recorded for this season.</p>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamAwards.length > 0 ? (
              teamAwards.map((award) => (
                <div key={award.ID} className="flex flex-col justify-center p-5 rounded-2xl border border-border bg-light-blue-gray/10 hover:bg-light-blue-gray/20 transition-colors">
                  <h3 className="font-bold text-lg text-foreground mb-1">{award.TeamName}</h3>
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">{award.Award}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No team awards recorded for this season.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}