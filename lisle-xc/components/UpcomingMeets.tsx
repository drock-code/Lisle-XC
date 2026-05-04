import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";

import Button from "@/components/Button";
import GenericModal from "@/components/GenericModal";
import { getUpcomingMeets } from "@/lib/queries";
import { formatTime } from "@/lib/time";

export default async function UpcomingMeets() {
  const upcomingMeets = await getUpcomingMeets(2);

  return (
    <section className="bg-background backdrop-blur-md rounded-2xl p-8 border border-border">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-heading font-bold text-xl text-foreground uppercase tracking-wider">
          Upcoming Meets
        </h3>
        <a href="https://calendar.google.com/calendar/u/3?cid=Y180YzljNTkyYTE3YmI4ZWVlZmQ4MmMwY2I4NzhlYjI3YmFkZjllY2M2NjA2MWZjZDE0NjJiMTNkYjE1Zjk5OTFmQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20" target="_blank" rel="noopener noreferrer">
          <Calendar className="text-light-blue" size={20} />
        </a>
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
                  <GenericModal 
                  title={`${meet.Meet} Info`}
                  content={meet.Info}
                  trigger={meet.Meet}
                  triggerClassName="font-bold text-foreground hover:text-light-blue transition-colors block w-full"
                />
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