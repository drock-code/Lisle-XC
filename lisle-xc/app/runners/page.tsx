import { getRoster, getRosterYears, getLatestSeason } from '@/lib/queries';
import { getGradeName } from '@/lib/utils';

import RunnerCard from '@/components/RunnerCard';
import { TabGroup, Tab } from '@/components/Tabs';
import { YearSelector } from '@/components/YearSelector';

type SearchParams = Promise<{ year?: string; level?: string }>;

export default async function RunnersPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  
  const years = await getRosterYears();
  const latestSeason = await getLatestSeason();
  
  const selectedYear = searchParams.year ? parseInt(searchParams.year) : latestSeason;
  const selectedLevel = (searchParams.level as 'HS' | 'JH') || 'HS';

  const roster = await getRoster(selectedYear, selectedLevel);
  const grades = Array.from(new Set(roster.map(r => r.Grade))).sort((a, b) => b - a);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)] mb-2">
            Team Roster
          </h1>
          <p className="font-body text-light-blue drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            The athletes of the {selectedYear} season.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-background border border-border p-2 rounded-2xl shadow-sm">
          <TabGroup className="md:w-auto">
            <Tab 
              label="High School"
              isActive={selectedLevel === 'HS'}
              href={`/runners?year=${selectedYear}&level=HS`}
            />
            <Tab 
              label="Junior High"
              isActive={selectedLevel === 'JH'}
              href={`/runners?year=${selectedYear}&level=JH`}
            />
          </TabGroup>
          <div className="hidden md:block h-8 w-px bg-border mx-1" />
          <YearSelector 
            years={years} 
            selectedYear={selectedYear}
          />
        </div>
      </header>

      {roster.length > 0 ? (
        <div className="space-y-16">
          {grades.map(grade => (
            <section key={grade}>
              {/* Grade Header */}
              <div className="relative flex items-center mb-8">
                <div className="bg-background/75 border border-border px-6 py-2 rounded-full">
                  <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                    {getGradeName(grade)}
                  </h2>
                </div>
                <div className="grow h-px bg-white ml-4" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {roster
                  .filter(r => r.Grade === grade)
                  .map(runner => (
                    <RunnerCard key={runner.Key} runner={runner} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <p className="text-muted-foreground font-medium">No runners found for this selection.</p>
        </div>
      )}
    </main>
  );
}