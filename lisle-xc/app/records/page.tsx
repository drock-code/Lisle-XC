import { TabGroup, Tab } from '@/components/Tabs';
import AwardsSection from '@/components/records/AwardsSection';
import CaptainsSection from '@/components/records/CaptainsSection';
import LeaderboardsSection from '@/components/records/LeaderboardsSection';
import CourseRecordsSection from '@/components/records/CourseRecordsSection';

interface RecordsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type SafeParams = {
  tab?: string;
  year?: string;
  gender?: string;
  distance?: string;
  course?: string;
  grade?: string;
  page?: string;
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const rawParams = await searchParams;
  
  // Narrow the types securely right here, before you declare your currentTab
  const safeParams: SafeParams = {
    tab: typeof rawParams.tab === 'string' ? rawParams.tab : undefined,
    year: typeof rawParams.year === 'string' ? rawParams.year : undefined,
    gender: typeof rawParams.gender === 'string' ? rawParams.gender : undefined,
    distance: typeof rawParams.distance === 'string' ? rawParams.distance : undefined,
    course: typeof rawParams.course === 'string' ? rawParams.course : undefined,
    grade: typeof rawParams.grade === 'string' ? rawParams.grade : undefined,
    page: typeof rawParams.page === 'string' ? rawParams.page : undefined,
  };
  
  // Default to the 'awards' tab if no tab is specified in the URL using our safe object
  const currentTab = safeParams.tab || 'awards';

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-1.5 p-4 md:p-0">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)]">
            Team History & Records
          </h1>
          <p className="font-body text-light-blue mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Explore the legacy of our runners through season awards, team captains, historical leaderboards, and course records.
          </p>
        </div>
      </div>

      {/* SEO-Friendly Tab Navigation */}
      <TabGroup className="flex-wrap md:flex-nowrap w-full">
        <Tab 
          href="/records?tab=awards" 
          label="Awards" 
          isActive={currentTab === 'awards'} 
          className="flex-1 py-3 px-4"
        />
        <Tab 
          href="/records?tab=captains" 
          label="Team Captains" 
          isActive={currentTab === 'captains'} 
          className="flex-1 py-3 px-4"
        />
        <Tab 
          href="/records?tab=leaderboards" 
          label="Leaderboards" 
          isActive={currentTab === 'leaderboards'} 
          className="flex-1 py-3 px-4"
        />
        <Tab 
          href="/records?tab=records" 
          label="Course Records" 
          isActive={currentTab === 'records'} 
          className="flex-1 py-3 px-4"
        />
      </TabGroup>

      {/* Content Rendering Area */}
      <div className="min-h-100">
        {/* Pass the resolved year from the safe params */}
        {currentTab === 'awards' && <AwardsSection year={safeParams.year} />}
        {currentTab === 'captains' && <CaptainsSection />}
        
        {/*Pass the safeParams into the LeaderboardsSection so the filters work */}
        {currentTab === 'leaderboards' && <LeaderboardsSection searchParams={safeParams} />}
        
        {currentTab === 'records' && <CourseRecordsSection />}
      </div>
    </div>
  );
}