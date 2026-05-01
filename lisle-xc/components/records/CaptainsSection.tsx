import { getCaptains } from '@/lib/queries';
import CaptainsContent from './CaptainsContent';

export default async function CaptainsSection() {
  const captains = await getCaptains();

  if (!captains || captains.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No team captains found.</div>;
  }

  return (
    <div className="bg-background rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <CaptainsContent captains={captains} />
    </div>
  );
}