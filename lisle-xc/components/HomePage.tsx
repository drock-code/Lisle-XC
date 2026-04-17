"use client";

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Background } from '@/components/Background';

export default function HomePage() {
    return (
        <div className="relative min-h-screen flex flex-col font-body overflow-x-hidden">
            <Background />

            {/* CONTENT LAYER */}
            {/* relative z-10 ensures all this content sits ABOVE the fixed background */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-grow max-w-5xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 py-12">
          
          {/* News Column */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden border-b-8 border-[#183760] border-x border-t border-white/20">
              <div className="p-8 md:p-12">
                <div className="flex items-center space-x-2 text-[#96C0E6] font-bold tracking-widest uppercase text-xs mb-4">
                  <span className="w-8 h-[2px] bg-[#96C0E6]"></span>
                  <span>Latest Update</span>
                </div>
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-[#183760] uppercase tracking-tight mb-6 leading-tight">
                  The Fastest Team in Lisle Cross Country History!
                </h2>
                <p className="font-body text-gray-700 leading-relaxed text-lg mb-8">
                  While the girls were eating breakfast at Morningside Cafe in Lisle before the drive down to Peoria for State on Friday, a man and his wife came up to the table after finishing their meal. They asked if the girls were the cross country team that had made State...
                </p>
                <button className="bg-[#183760] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#96C0E6] transition-all duration-300 shadow-lg shadow-[#183760]/20 cursor-pointer">
                  Read Full Story
                </button>
              </div>
            </section>

            {/* Pagination - White text with shadow for visibility against dark background */}
            <div className="flex justify-between items-center py-4">
              <button className="flex items-center space-x-2 text-white font-bold uppercase tracking-tighter hover:text-[#96C0E6] transition-colors cursor-pointer drop-shadow-md">
                <ChevronLeft size={20} />
                <span>Previous Posts</span>
              </button>
              <button className="flex items-center space-x-2 text-white font-bold uppercase tracking-tighter hover:text-[#96C0E6] transition-colors cursor-pointer drop-shadow-md">
                <span>Next Posts</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
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

            {/* Quick Links Card */}
            <section className="bg-[#183760]/90 backdrop-blur-md rounded-2xl p-8 text-white border border-white/10">
              <h3 className="font-heading font-bold text-xl uppercase tracking-wider mb-6">
                Resources
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3 group cursor-pointer">
                  <div className="w-2 h-2 bg-[#96C0E6] rounded-full group-hover:scale-150 transition-transform"></div>
                  <span className="font-body font-medium hover:text-[#96C0E6] transition-colors">Athlete Handbook</span>
                </li>
                <li className="flex items-center space-x-3 group cursor-pointer">
                  <div className="w-2 h-2 bg-[#96C0E6] rounded-full group-hover:scale-150 transition-transform"></div>
                  <span className="font-body font-medium hover:text-[#96C0E6] transition-colors">Course Maps</span>
                </li>
                <li className="flex items-center space-x-3 group cursor-pointer">
                  <div className="w-2 h-2 bg-[#96C0E6] rounded-full group-hover:scale-150 transition-transform"></div>
                  <span className="font-body font-medium hover:text-[#96C0E6] transition-colors">Travel Info</span>
                </li>
              </ul>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}