import GenericModal from "@/components/GenericModal";
import Link from "next/link";
import { HelpCircle } from "lucide-react"; 
import { getRandomFAQ } from "@/lib/queries";

export default async function QuickLinks() { 
  const randomFaq = await getRandomFAQ();

  return (
    <section className="bg-lisle-blue/90 backdrop-blur-md rounded-2xl p-8 text-white border border-border">
      <h3 className="font-heading font-bold text-xl uppercase tracking-wider mb-6">
        Resources
      </h3>
      <ul className="space-y-4">
        {/* Static Links */}
        <li className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-2 h-2 bg-light-blue rounded-full group-hover:scale-150 transition-transform shrink-0"></div>
          <span className="font-body font-medium hover:text-light-blue transition-colors"><Link href="/files/athleteHandbook2026.pdf">Athlete Handbook</Link></span>
        </li>
        <li className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-2 h-2 bg-light-blue rounded-full group-hover:scale-150 transition-transform shrink-0"></div>
          <span className="font-body font-medium hover:text-light-blue transition-colors"><Link href="/maps">Course Maps</Link></span>
        </li>
        <li className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-2 h-2 bg-light-blue rounded-full group-hover:scale-150 transition-transform shrink-0"></div>
          <span className="font-body font-medium hover:text-light-blue transition-colors"><Link href="/travel">Travel Info</Link></span>
        </li>
        <hr/>
        {/* Dynamic Random FAQ Link */}
        {randomFaq && (
          <li>
            <GenericModal 
              title={
                <>
                  <HelpCircle className="text-light-blue shrink-0" size={20} />
                  {randomFaq.Title}
                </>
              }
              content={randomFaq.Content}
              trigger={
                <div className="flex items-center space-x-3 w-full text-left">
                  <HelpCircle 
                    size={16} 
                    className="text-light-blue group-hover:scale-125 transition-transform shrink-0" 
                  />
                  <span className="font-body font-medium group-hover:text-light-blue transition-colors line-clamp-1">
                    {randomFaq.Title}
                  </span>
                </div>
              } 
              triggerClassName="group w-full"
            />
            <p>View More Tips on the <Link href="/faq" className="text-light-blue hover:underline">FAQ Page</Link></p>
          </li>
        )}
      </ul>
    </section>
  );
}