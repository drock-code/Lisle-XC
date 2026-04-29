import Link from 'next/link';

import RunnerAvatar from '@/components/RunnerAvatar';

import { searchRunners } from '@/lib/queries'; 
import { generateSlug } from '@/lib/utils';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; 
}) {
  const params = await searchParams;
  const query = params.q || '';

  if (!query) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="bg-background backdrop-blur-md rounded-2xl overflow-hidden border-border border shadow-lg">
          <div className="p-8 md:p-12 text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground uppercase tracking-tight mb-4 leading-tight">
              Please enter a search term
            </h2>
            <p className="font-body text-foreground/80 leading-relaxed text-lg">
              Use the search bar in the navigation menu to find what you&apos;re looking for.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const results = await searchRunners(query);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="bg-background backdrop-blur-md rounded-2xl overflow-hidden border-border border-x border-t shadow-lg">
        <div className="p-8 md:p-12">
          
          <div className="flex items-center space-x-2 text-light-blue font-bold tracking-widest uppercase text-xs mb-4">
            <span className="w-8 h-0.5 bg-light-blue"></span>
            <span>Search</span>
          </div>
          
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground uppercase tracking-tight mb-8 leading-tight">
            Results for &quot;{query}&quot;
          </h2>

          {results.length === 0 ? (
            <div className="p-10 bg-black/20 border border-border border-dashed rounded-xl text-center">
              <p className="font-body text-foreground leading-relaxed text-lg">
                No results found matching &quot;{query}&quot;. 
                <br /> Try checking the spelling or using just the first or last name if you are searching for a runner.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((runner) => (
                <Link 
                  key={runner.Key} 
                  href={`/runners/${runner.Key}-${generateSlug(runner.Name)}`}
                  className="group flex flex-col gap-4 p-6 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer bg-lisle-blue text-white shadow-lg shadow-lisle-blue/20 hover:bg-light-blue hover:text-lisle-blue hover:scale-[1.02] border border-transparent hover:border-lisle-blue/10"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar - matches the hover state colors */}
                    <div className="w-14 h-14 rounded-full bg-light-blue-gray flex items-center justify-center border border-border shrink-0 overflow-hidden text-foreground group-hover:bg-lisle-blue/10 group-hover:text-lisle-blue transition-colors">
                      <RunnerAvatar 
                        src={runner.AvatarURL} 
                        name={runner.Name} 
                        size="md" 
                        className="group-hover:bg-lisle-blue/10 group-hover:text-lisle-blue"
                      />
                    </div>
                    
                    {/* Runner Info */}
                    <div className="overflow-hidden">
                      <h3 className="font-heading font-bold text-xl uppercase tracking-tight truncate">
                        {runner.Name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        {/* Badges - matches the hover state colors */}
                        <span className="text-[10px] font-bold tracking-widest bg-white/10 px-2 py-1 rounded-md uppercase group-hover:bg-lisle-blue/10 group-hover:text-lisle-blue transition-colors">
                          Grade {runner.Grade}
                        </span>
                        {runner.Gender && (
                          <span className="text-[10px] font-bold tracking-widest bg-white/10 px-2 py-1 rounded-md uppercase group-hover:bg-lisle-blue/10 group-hover:text-lisle-blue transition-colors">
                            {runner.Gender === 'M' ? 'Boys' : runner.Gender === 'F' ? 'Girls' : runner.Gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}