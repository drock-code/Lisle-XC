import { Calendar } from "lucide-react";

export default function UpcomingMeets() {
    return (
        <section className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border-t-8 border-[#96C0E6] border-x border-b border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading font-bold text-xl text-[#183760] uppercase tracking-wider">
                  Upcoming Meets
                </h3>
                <Calendar className="text-[#96C0E6]" size={20} />
              </div>

              <div className="space-y-8">
                <div className="group cursor-pointer">
                  <p className="text-xs font-bold text-[#96C0E6] uppercase mb-1">Aug 29, 2026</p>
                  <h4 className="font-body text-lg font-bold text-[#183760] group-hover:text-[#96C0E6] transition-colors">
                    Sea Dragon Invite
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">Lisle Community Park</p>
                </div>

                <div className="group cursor-pointer">
                  <p className="text-xs font-bold text-[#96C0E6] uppercase mb-1">Sep 04, 2026</p>
                  <h4 className="font-body text-lg font-bold text-[#183760] group-hover:text-[#96C0E6] transition-colors">
                    Twilight In The Woods
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">Seneca High School</p>
                </div>
                
                <button className="w-full py-3 border-2 border-[#aec5db] text-[#183760] font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-[#aec5db]/20 transition-all cursor-pointer">
                  View Full Schedule
                </button>
              </div>
            </section>
            
    );
}