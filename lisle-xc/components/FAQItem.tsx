"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import RichTextContent from "@/components/RichTextContent";

interface FAQ {
  Key: number;
  Title: string;
  Content: string;
}

export default function FAQItem({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  // Intercept clicks on the container
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Find if the clicked element (or its parent) is an <a> tag
    const link = target.closest('a'); 

    if (link) {
      const href = link.getAttribute('href');
      
      // Check if it's an external link or a missing-protocol "www" link
      if (href && (href.startsWith('http') || href.startsWith('www.'))) {
        e.preventDefault(); // Stop the browser from navigating in the current tab
        
        // Fix "www" links on the fly, otherwise use the normal href
        const finalHref = href.startsWith('www.') ? `https://${href}` : href;
        
        // Open safely in a new tab!
        window.open(finalHref, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div 
          key={faq.Key} 
          className="border border-border rounded-2xl bg-background overflow-hidden shadow-sm transition-all"
        >
          <button
            onClick={() => toggle(faq.Key)}
            className="w-full flex justify-between items-center p-5 text-left cursor-pointer hover:bg-light-blue transition-colors focus:outline-none"
          >
            <span className="font-heading font-bold text-lg text-foreground">
              {faq.Title}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-foreground shrink-0 transition-transform duration-300 ${
                openId === faq.Key ? "rotate-180" : ""
              }`}
            />
          </button>
          
          <div 
            className={`grid transition-all duration-300 ease-in-out ${
              openId === faq.Key 
                ? "grid-rows-[1fr] opacity-100" 
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              {/* Attach the click listener to the wrapper div */}
              <div 
                className="p-5 pt-0 text-foreground leading-relaxed text-sm border-t border-border [&_a]:text-light-blue [&_a]:underline space-y-3"
                onClick={handleContentClick}
              >
                <RichTextContent content={faq.Content} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}