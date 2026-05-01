import { getAwardYears, getAwardsByYear } from '@/lib/queries';
import AwardsContent from './AwardsContent';

export default async function AwardsSection({ year }: { year?: string }) {
  // Fetch available years for the dropdown
  const years = await getAwardYears();
  
  if (!years || years.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No awards data found.</div>;
  }

  // Determine the active year (URL parameter or most recent year)
  const activeYear = year ? parseInt(year, 10) : years[0];

  // Fetch the data for that specific year
  const { teamAwards, runnerAwards } = await getAwardsByYear(activeYear);

  return (
    <div className="bg-background rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <AwardsContent 
        years={years} 
        activeYear={activeYear} 
        teamAwards={teamAwards} 
        runnerAwards={runnerAwards} 
      />
    </div>
  );
}