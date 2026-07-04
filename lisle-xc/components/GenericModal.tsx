"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import RichTextContent from "@/components/RichTextContent";

interface GenericModalProps {
  title: React.ReactNode;
  content?: string;             
  children?: React.ReactNode;   
  trigger: React.ReactNode;
  triggerClassName?: string;
  maxWidthClass?: string;       
  bodyClassName?: string;       
}

export default function GenericModal({ 
  title, 
  content, 
  children,
  trigger, 
  triggerClassName = "",
  maxWidthClass = "max-w-lg",         // Defaults to your original size
  bodyClassName = "p-6 max-h-[70vh]"  // Defaults to your original padding
}: GenericModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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

          <div className={`relative bg-background rounded-2xl shadow-2xl w-full ${maxWidthClass} overflow-hidden animate-in fade-in zoom-in duration-200 z-10 flex flex-col`}>
            
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
            <div className={`overflow-y-auto ${bodyClassName}`}>
              {/* If children are passed (like our Map), render them. Otherwise, render RichText. */}
              {children ? children : (
                <div className="text-sm text-foreground leading-relaxed space-y-3 [&_a]:text-light-blue [&_a]:underline [&_a:hover]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_h5]:text-foreground [&_h6]:text-foreground transition-colors">
                  {content && <RichTextContent content={content} />}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}