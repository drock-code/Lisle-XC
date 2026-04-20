import { Calendar } from "lucide-react";

export default function UpcomingMeets() {
  return (
    <section className="bg-background backdrop-blur-md rounded-2xl p-8 border-border border-x border-b">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-heading font-bold text-xl text-foreground uppercase tracking-wider">
          Upcoming Meets
        </h3>
        <Calendar className="text-light-blue" size={20} />
      </div>

      <div className="space-y-8">
        <div className="group cursor-pointer">
          <p className="text-xs font-bold text-light-blue uppercase mb-1">Aug 29, 2026</p>
          <h4 className="font-body text-lg font-bold text-foreground group-hover:text-light-blue transition-colors">
            Sea Dragon Invite
          </h4>
          <p className="text-sm text-light-gray font-medium">Portage Park, Chicago</p>
        </div>

        <div className="group cursor-pointer">
          <p className="text-xs font-bold text-light-blue uppercase mb-1">Sep 04, 2026</p>
          <h4 className="font-body text-lg font-bold text-foreground group-hover:text-light-blue transition-colors">
            Twilight In The Woods
          </h4>
          <p className="text-sm text-light-gray font-medium">Seneca High School</p>
        </div>
                
        <button className="w-full py-3 border-2 border-light-gray text-foreground font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-[#aec5db]/20 transition-all cursor-pointer">
          View Full Schedule
        </button>
      </div>
    </section>
  );
}