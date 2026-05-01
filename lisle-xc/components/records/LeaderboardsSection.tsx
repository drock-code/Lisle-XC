import { getDynamicLeaderboard, getLeaderboardOptions } from '@/lib/queries';
import LeaderboardsContent from './LeaderboardsContent';

interface LeaderboardsSectionProps {
  searchParams?: {
    gender?: string;
    distance?: string;
    course?: string;
    grade?: string;
    page?: string;
  };
}

export default async function LeaderboardsSection({ searchParams = {} }: LeaderboardsSectionProps) {
  const defaultGender = Math.random() > 0.5 ? 'M' : 'F';
  
  const gender = searchParams.gender || defaultGender;
  
  // If it's missing, default to '3'. If they explicitly chose 'any', use an empty string so the SQL ignores it.
  const rawDistance = searchParams.distance || '3'; 
  const distance = rawDistance === 'any' ? '' : rawDistance; 
  
  const course = searchParams.course || '';
  const grade = searchParams.grade || '';
  
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 25;
  const offset = (page - 1) * limit;

  const [leaderboardData, options] = await Promise.all([
    getDynamicLeaderboard({ gender, distance, course, grade, limit, offset }),
    getLeaderboardOptions()
  ]);

  return (
    <div className="bg-background rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <LeaderboardsContent 
        results={leaderboardData.results} 
        totalCount={leaderboardData.totalCount}
        options={options}
        // Pass rawDistance down so the Select dropdown shows "3" or "any" correctly
        currentParams={{ gender, distance: rawDistance, course, grade, page }} 
        limit={limit}
      />
    </div>
  );
}