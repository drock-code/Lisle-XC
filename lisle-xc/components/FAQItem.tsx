"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  Key: number;
  Title: string;
  Content: string;
}

export default function FAQItem({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    // If clicking the one that's already open, close it. Otherwise, open the new one.
    setOpenId(openId === id ? null : id);
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
          
          {/* We use a CSS grid trick to animate the accordion expanding! 
            When open, the grid-template-rows becomes 1fr, opening the container.
          */}
          <div 
            className={`grid transition-all duration-300 ease-in-out ${
              openId === faq.Key 
                ? "grid-rows-[1fr] opacity-100" 
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div 
                className="p-5 pt-0 text-foreground leading-relaxed text-sm border-t border-border [&_a]:text-light-blue [&_a]:underline space-y-3"
                dangerouslySetInnerHTML={{ __html: faq.Content }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}