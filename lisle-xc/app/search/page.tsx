import Link from 'next/link';

import RunnerAvatar from '@/components/RunnerAvatar';

import { searchAll } from '@/lib/queries'; 
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

  const { runners, notes } = await searchAll(query);
  const hasNoResults = runners.length === 0 && notes.length === 0;

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

          {hasNoResults ? (
            <div className="p-10 bg-black/20 border border-border border-dashed rounded-xl text-center">
              <p className="font-body text-foreground leading-relaxed text-lg">
                No results found matching &quot;{query}&quot;. 
                <br /> Try checking the spelling or using different keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* RUNNERS SECTION */}
              {runners.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground uppercase tracking-widest mb-6 border-b border-border pb-2">
                    Runners
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {runners.map((runner) => (
                      <Link 
                        key={runner.Key} 
                        href={`/runners/${runner.Key}-${generateSlug(runner.Name)}`}
                        className="group flex flex-col gap-4 p-6 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer bg-lisle-blue text-white shadow-lg shadow-lisle-blue/20 hover:bg-light-blue hover:text-lisle-blue hover:scale-[1.02] border border-transparent hover:border-lisle-blue/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-light-blue-gray flex items-center justify-center border border-border shrink-0 overflow-hidden text-foreground group-hover:bg-lisle-blue/10 group-hover:text-lisle-blue transition-colors">
                            <RunnerAvatar 
                              src={runner.AvatarURL} 
                              name={runner.Name} 
                              size="md" 
                              className="group-hover:bg-lisle-blue/10 group-hover:text-lisle-blue"
                            />
                          </div>
                          
                          <div className="overflow-hidden">
                            <h3 className="font-heading font-bold text-xl uppercase tracking-tight truncate">
                              {runner.Name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
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
                </div>
              )}

              {/* NOTES SECTION */}
              {notes.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground uppercase tracking-widest mb-6 border-b border-border pb-2">
                    Notes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {notes.map((note) => (
                      <Link 
                        key={note.Key} 
                        href={`/notes/${note.Key}-${generateSlug(note.Title)}`}
                        className="group flex flex-col p-6 rounded-xl bg-background border border-border shadow-md transition-all duration-300 hover:border-light-blue hover:shadow-lg hover:scale-[1.01]"
                      >
                        <h4 className="font-heading font-bold text-xl text-foreground group-hover:text-light-blue transition-colors mb-2">
                          {note.Title}
                        </h4>
                        <div className="text-[11px] font-bold text-light-blue uppercase tracking-widest mb-3">
                          {new Date(note.Date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
                        </div>
                        {/* line-clamp-2 automatically truncates the note after 2 lines with an ellipsis */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.Note.replace(/<[^>]+>/g, '')}
                        </p>
                        <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest text-light-blue">
                          Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </section>
    </div>
  );
}