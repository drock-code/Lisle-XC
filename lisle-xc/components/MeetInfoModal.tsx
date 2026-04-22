"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function MeetInfoModal({ info, meetName }: { info: string; meetName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure this only runs on the client so we have access to document.body
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* The Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="cursor-pointer font-bold text-foreground text-left hover:text-light-blue transition-colors block w-full"
      >
        {meetName}
      </button>

      {/* The Popup Modal (Portaled to document.body) */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          
          {/* We add an onClick to the backdrop so clicking outside the modal closes it, 
              but stop propagation on the inner div so clicking the modal itself doesn't close it! */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 z-10">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-heading font-bold text-lg text-lisle-blue">
                {meetName} Info
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div 
                className="text-sm text-slate-700 leading-relaxed space-y-3 [&_a]:text-light-blue [&_a]:underline hover:[&_a]:text-lisle-blue"
                dangerouslySetInnerHTML={{ __html: info }}
              />
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  );
}