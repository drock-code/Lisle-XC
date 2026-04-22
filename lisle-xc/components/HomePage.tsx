import News from '@/components/News';
import UpcomingMeets from '@/components/UpcomingMeets';
import QuickLinks from '@/components/QuickLinks';

export default function HomePage() {
    return (
        <div className="grow max-w-5xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 py-12">
            <News />

            <div className="space-y-8">
                <UpcomingMeets/>
                <QuickLinks/>            
          </div>
        </div>
  );
}