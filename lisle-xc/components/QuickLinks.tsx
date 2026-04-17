export default function QuickLinks() {
    return (
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
    );
}