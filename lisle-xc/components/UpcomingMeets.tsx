import { Calendar } from "lucide-react";
import Link from "next/link";

import Button from "@/components/Button";
import { getUpcomingMeets } from "@/lib/queries";
import { formatTime } from "@/lib/time";

export default async function UpcomingMeets() {
  const upcomingMeets = await getUpcomingMeets(2);

  return (
    <section className="bg-background backdrop-blur-md rounded-2xl p-8 border-border border-x border-b">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-heading font-bold text-xl text-foreground uppercase tracking-wider">
          Upcoming Meets
        </h3>
        <Calendar className="text-light-blue" size={20} />
      </div>

      <div className="space-y-8">
        {/* Check if we have meets. If yes, map them; if no, show a fallback message. */}
        {upcomingMeets.length > 0 ? (
          upcomingMeets.map((meet) => (
            <div key={meet.ID} className="group cursor-pointer">
              <p className="text-xs font-bold text-light-blue uppercase mb-1">
                {new Date(meet.Date).toLocaleDateString('en-US', { 
                  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' 
                })}
                {meet.Time && ` @ ${formatTime(meet.Time)}`}
              </p>
              {meet.Location ? (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meet.Location)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h4 className="font-body text-lg font-bold text-foreground group-hover:text-light-blue transition-colors">
                    {meet.Meet}
                </h4>
              </a>
              ) : (
            <h4 className="font-body text-lg font-bold text-foreground">
              {meet.Meet}
            </h4>
          )}
  
            <p className="text-sm text-light-gray font-medium">
              {meet.Location || 'Location TBA'}
            </p>
          </div>
          ))
        ) : (
          <div className="text-sm text-light-gray font-medium">
            No upcoming meets are scheduled at this time.
          </div>
        )}
                
        <Button>
          <Link href="/schedule" className="flex items-center justify-center gap-2">
            View Full Schedule
          </Link>
        </Button>
      </div>
    </section>
  );
}