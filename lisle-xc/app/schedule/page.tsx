import Link from 'next/link';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import { getScheduleByYear, getAvailableYears } from '@/lib/queries';

export const metadata = {
  title: 'Season Schedule',
};

// Next.js passes searchParams automatically so we can read the URL (?year=2025)
export default async function SchedulePage({searchParams}: {
    searchParams: { year?: string };
}) 
{
    const years = await getAvailableYears();
    const activeYear = searchParams.year || (years.length > 0 ? years[0] : '2026');
    const currentMeets = await getScheduleByYear(activeYear);

    return (
        <div className="p-4 md:p-8">
            <main className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)]">Season Schedule</h1>
                        <p className="font-body text-light-blue t-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">View upcoming meets and historical results.</p>
                    </div>
          
                {/* The Wrapper creates the boundary and the fade effect when there are more years than can be displayed */}
                <div className="relative w-full md:w-auto md:max-w-md lg:max-w-xl overflow-hidden flex items-center">
                    {/* The Track allows horizontal scrolling but hides the scrollbar */}
                    <div className="flex gap-2 overflow-x-auto py-2 px-1 w-full snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {years.map((year) => (
                            <Link
                                key={year}
                                href={`/schedule?year=${year}`}
                                className={`shrink-0 snap-start px-5 py-2 rounded-full text-sm font-bold transition-all ${
                                    activeYear === year 
                                    ? 'bg-lisle-blue text-white shadow-md scale-105' 
                                    : 'bg-white text-slate-600 border border-border shadow-sm hover:border-light-blue hover:text-lisle-blue'
        }`}
      >
        {year}
      </Link>
    ))}
  </div>

  {/* Visual Gradient Cues */}
       {years.length > 4 && (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/90 to-transparent pointer-events-none rounded-r-xl" />
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent pointer-events-none rounded-l-xl" />
              </>
            )}
          </div>


        </div>

        {/* The Responsive Data Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* DESKTOP VIEW: Traditional Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 font-semibold uppercase tracking-wider">Meet</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Date & Time</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Level</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Info / Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentMeets.map((meet) => (
                  <tr key={meet.ID} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <span className="font-bold text-lisle-blue">{meet.Meet}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-slate-700">
                        <Calendar className="w-4 h-4 mr-2 text-light-blue" />
                        {new Date(meet.Date).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' 
                        })}
                      </div>
                      {meet.Time && (
                        <div className="flex items-center text-slate-500 text-sm mt-1">
                          <Clock className="w-4 h-4 mr-2 text-slate-400" />
                          {meet.Time}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      {meet.Level || <span className="text-slate-300 italic">TBD</span>}
                    </td>
                    <td className="p-4">
                      {meet.Location ? (
                         <div className="flex items-center text-sm text-slate-600">
                           <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                           {meet.Location}
                         </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">TBA</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW: Card Stack */}
          <div className="md:hidden divide-y divide-slate-100">
            {currentMeets.length > 0 ? currentMeets.map((meet) => (
              <div key={meet.ID} className="p-4 space-y-3">
                <h3 className="font-bold text-lisle-blue text-lg leading-tight">{meet.Meet}</h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-light-blue shrink-0" />
                    <span>
                      {new Date(meet.Date).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', timeZone: 'UTC' 
                      })}
                    </span>
                  </div>
                  {meet.Time && (
                    <div className="flex items-center text-slate-600">
                      <Clock className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                      <span>{meet.Time}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-sm text-slate-500">
                    Level: <strong className="text-slate-700">{meet.Level || 'TBD'}</strong>
                  </span>
                  
                  {meet.Location && (
                    <span className="inline-flex items-center text-xs font-semibold text-slate-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {meet.Location}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                No meets scheduled for this year yet.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}