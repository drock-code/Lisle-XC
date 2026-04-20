import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function News() {
  return (
    <div className="lg:col-span-2 space-y-8">
      <section className="bg-background backdrop-blur-md rounded-2xl overflow-hidden border-border border-x border-t">
        <div className="p-8 md:p-12">
          <div className="flex items-center space-x-2 text-light-blue font-bold tracking-widest uppercase text-xs mb-4">
            <span className="w-8 h-0.5 bg-light-blue"></span>
            <span>Latest Update</span>
          </div>
          
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground uppercase tracking-tight mb-6 leading-tight">
            The Fastest Team in Lisle Cross Country History!
          </h2>
          <p className="font-body text-foreground leading-relaxed text-lg mb-8">
            While the girls were eating breakfast at Morningside Cafe in Lisle before the drive down to Peoria for State on Friday, a man and his wife came up to the table after finishing their meal. They asked if the girls were the cross country team that had made State...
          </p>
          <button className="bg-lisle-blue text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-light-blue transition-all duration-300 shadow-lg shadow-lisle-blue/20 cursor-pointer">
            Read Full Story
          </button>
        </div>
      </section>

      {/* Pagination - White text with shadow for visibility against dark background */}
      <div className="flex justify-between items-center py-4">
        <button className="flex items-center space-x-2 text-white font-bold uppercase tracking-tighter hover:text-light-blue transition-colors cursor-pointer drop-shadow-md">
          <ChevronLeft size={20} />
          <span>Previous Posts</span>
        </button>
        <button className="flex items-center space-x-2 text-white font-bold uppercase tracking-tighter hover:text-light-blue transition-colors cursor-pointer drop-shadow-md">
          <span>Next Posts</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}