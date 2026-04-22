"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface GenericModalProps {
  title: React.ReactNode;      // The title in the modal header (allows text or icons)
  content: string;             // The raw HTML string to display inside
  trigger: React.ReactNode;    // What the user clicks on to open the modal
  triggerClassName?: string;   // Optional custom styling for the trigger button
}

export default function GenericModal({ 
  title, 
  content, 
  trigger, 
  triggerClassName = "" 
}: GenericModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* The Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className={`cursor-pointer appearance-none bg-transparent border-none p-0 text-left w-full focus:outline-none ${triggerClassName}`}
      >
        {trigger}
      </button>

      {/* The Popup Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          
          {/* Backdrop Click-to-Close */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 z-10">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                {title}
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-foreground hover:text-light-blue transition-colors p-1 cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div 
                className="text-sm text-foreground leading-relaxed space-y-3 [&_a]:text-light-blue [&_a]:underline [&_a:hover]:text-foreground transition-colors"
                dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}