import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';

import { getScheduleByYear, getAvailableYears, type MeetResult } from '@/lib/queries';
import { formatTime } from '@/lib/time';

import GenericModal from '@/components/GenericModal';
import Button from '@/components/Button';
import Pill from '@/components/Pill';

export const metadata = {
  title: 'Season Schedule',
};

export default async function SchedulePage({searchParams}: {
    searchParams: Promise<{ year?: string }>;
}) 
  {
    const resolvedParams = await searchParams;
    const years = await getAvailableYears();
    const activeYear = resolvedParams.year || (years.length > 0 ? years[0] : '2026');
    const currentMeets = await getScheduleByYear(activeYear);

    return (
        <div className="p-4 md:p-8">
            <main className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)]">Season Schedule</h1>
                        <p className="font-body text-light-blue t-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">View upcoming meets and historical results.</p>
                    </div>
          
                {/* The Wrapper */}
                <div className="relative w-full md:w-auto md:max-w-md lg:max-w-xl overflow-hidden flex items-center">
                    {/* The Track */}
                    <div className="flex gap-2 overflow-x-auto py-4 px-1 w-full snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden items-center">
                        {years.map((year) => (
                            <Link
                                key={year}
                                href={`/schedule?year=${year}`}
                                className="shrink-0 snap-start"
                            >
                                <Button
                                  size="sm"
                                  isActive={activeYear === year}
                                  className={activeYear !== year ? 'shadow-sm' : ''}
                                >
                                  {year}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {/* Visual Gradient Cues */}
                    {years.length > 4 && (
                        <>
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white/90 to-transparent pointer-events-none rounded-r-xl" />
                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-white/90 to-transparent pointer-events-none rounded-l-xl" />
                        </>
                    )}
                </div>
            </div>

        {/* The Responsive Data Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          
          {/* DESKTOP VIEW: Traditional Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-foreground text-sm">
                  <th className="p-4 font-semibold uppercase tracking-wider">Meet</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Date & Time</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Level</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Location</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentMeets.map((meet) => (
                  <tr key={meet.ID} className="bg-background text-foreground">
                    <td className="p-4 align-top">
                      {meet.Info ? (
                        <GenericModal 
                          title={`${meet.Meet} Info`}
                          content={meet.Info}
                          trigger={meet.Meet}
                          triggerClassName="font-bold text-foreground hover:text-light-blue transition-colors block w-full"
                        />
                      ) : (
                        <span className="block">{meet.Meet}</span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center text-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-light-blue" />
                        {new Date(meet.Date).toLocaleDateString('en-US', { 
                          month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' 
                        })}
                      </div>
                      {meet.Time && (
                        <div className="flex items-center text-sm mt-1">
                          <Clock className="w-4 h-4 mr-2 text-light-blue" />
                          {formatTime(meet.Time)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {meet.Level || <span className="text-light-gray">All Runners</span>}
                    </td>
                    <td className="p-4 align-top">
                      {meet.Location ? (
                         <a 
                           href={`https://maps.google.com/?q=${encodeURIComponent(meet.Location)}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center text-sm hover:text-light-blue hover:underline transition-colors"
                         >
                           <MapPin className="w-4 h-4 mr-2 text-light-blue shrink-0" />
                           {meet.Location}
                         </a>
                      ) : (
                        <span className="text-light-gray text-sm">TBA</span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {meet.Results && meet.Results.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {meet.Results.map((result: MeetResult) => (
                            result.Title && result.File ? (
                              <Pill 
                                key={result.ID} 
                                title={result.Title} 
                                href={result.File} 
                                icon={<Trophy size={12} />} 
                              />
                            ) : null
                          ))}
                        </div>
                      ) : (
                        <span className="text-light-gray text-sm">-</span>
                      )}
                    </td>
                  </tr>
                  
                ))}
                
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW: Card Stack */}
          <div className="md:hidden divide-y divide-border">
            {currentMeets.length > 0 ? currentMeets.map((meet) => (
              <div key={meet.ID} className="p-4 space-y-3 bg-background text-foreground">
                
                <h3 className="text-lg leading-tight block">
                  {meet.Info ? (
                    <GenericModal 
                      title={`${meet.Meet} Info`}
                      content={meet.Info}
                      trigger={meet.Meet}
                      triggerClassName="font-bold text-foreground hover:text-light-blue transition-colors block w-full"
                    />
                  ) : (
                    <span className="block">{meet.Meet}</span>
                  )}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-light-blue shrink-0" />
                    <span>
                      {new Date(meet.Date).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', timeZone: 'UTC' 
                      })}
                    </span>
                  </div>
                  {meet.Time && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-light-blue shrink-0" />
                      <span>{formatTime(meet.Time)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm">
                    Level: <strong>{meet.Level || 'All Runners'}</strong>
                  </span>
                  
                  {meet.Location && (
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(meet.Location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold hover:text-light-blue hover:underline transition-colors max-w-[60%] text-right justify-end"
                    >
                      <MapPin className="w-3 h-3 mr-1 text-light-blue shrink-0" />
                      <span className="truncate">{meet.Location}</span>
                    </a>
                  )}
                </div>

                {/* MOBILE RESULTS ROW */}
                {meet.Results && meet.Results.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-border">
                    <span className="text-xs font-bold text-light-gray uppercase tracking-wider">
                      Results:
                    </span>
                    {meet.Results.map((result: MeetResult) => (
                      result.Title && result.File ? (
                        <Pill 
                          key={result.ID} 
                          title={result.Title} 
                          href={result.File} 
                          icon={<Trophy size={12} />} 
                        />
                      ) : null
                    ))}
                  </div>
                )}

              </div>
            )) : (
              <div className="p-8 text-center text-light-gray">
                No meets scheduled for this year yet.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}