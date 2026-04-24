import { notFound } from 'next/navigation';
import { getRunnerProfile } from '@/lib/queries';
import { processRunnerResults } from '@/lib/runner-utils';
import RunnerDashboard from '@/components/RunnerDashboard';

// Generate dynamic metadata for SEO
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

  // Fetch the data
  const data = await getRunnerProfile(runnerId);
  if (!data) notFound();

  // Run the results through your new PR calculator logic
  const processedResults = processRunnerResults(data.results);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      <RunnerDashboard runner={data.runner} results={processedResults} />
    </div>
  );
}