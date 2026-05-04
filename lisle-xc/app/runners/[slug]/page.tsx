import { notFound } from 'next/navigation';
import { getRunnerProfile } from '@/lib/queries';
import { processRunnerResults } from '@/lib/runner-utils';
import RunnerDashboard from '@/components/RunnerDashboard';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const idStr = resolvedParams.slug.split('-')[0];
  const runnerId = parseInt(idStr, 10);
  
  if (isNaN(runnerId)) return { title: 'Runner Not Found' };
  
  const data = await getRunnerProfile(runnerId);
  if (!data) return { title: 'Runner Not Found' };
  
  return { 
    title: `${data.runner.Name} - Cross Country Profile`,
    description: `View ${data.runner.Name}'s cross country race history, personal records, and season trends.`
  };
}

export default async function RunnerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // Extract the ID from the URL (e.g., "7-dani-erickson" -> 7)
  const idStr = resolvedParams.slug.split('-')[0];
  const runnerId = parseInt(idStr, 10);

  if (isNaN(runnerId)) notFound();

  const data = await getRunnerProfile(runnerId);
  if (!data) notFound();

  // Run the results through the PR calculator logic
  const processedResults = processRunnerResults(data.results);

  return (
      <RunnerDashboard 
      runner={data.runner} 
      results={processedResults} 
      awards={data.awards}             
      captains={data.captains}         
      courseRecords={data.courseRecords} 
    />
  );
}