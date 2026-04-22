import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";

import Button from "@/components/Button";
import MeetInfoModal from "@/components/MeetInfoModal";
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
            <div key={meet.ID} className="flex flex-col gap-1">
              <p className="text-xs font-bold text-light-blue uppercase">
                {new Date(meet.Date).toLocaleDateString('en-US', { 
                  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' 
                })}
                {meet.Time && ` @ ${formatTime(meet.Time)}`}
              </p>
              
              {/* MEET TITLE: Triggers Modal if Info exists */}
              <h4 className="font-body text-lg text-foreground transition-colors">
                {meet.Info ? (
                  <MeetInfoModal info={meet.Info} meetName={meet.Meet} />
                ) : (
                  meet.Meet
                )}
              </h4>
      
              {/* LOCATION: Links to Google Maps if Location exists */}
              <div className="text-sm font-medium">
                {meet.Location ? (
                  <a 
  href={`https://maps.google.com/?q=${encodeURIComponent(meet.Location)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center text-light-gray hover:text-light-blue hover:underline transition-colors"
>
  <MapPin className="w-4 h-4 mr-1 shrink-0" />
  {meet.Location}
</a>
                ) : (
                  <span className="text-light-gray">Location TBA</span>
                )}
              </div>
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