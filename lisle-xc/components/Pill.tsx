import React from "react";

interface PillProps {
  title: string;
  icon?: React.ReactNode; 
  href?: string;          // If provided, the pill acts as a link
  onClick?: () => void;   // If provided, the pill acts as a button
  className?: string;
}

export default function Pill({ 
  title, 
  icon, 
  href, 
  onClick, 
  className = "" 
}: PillProps) {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 bg-light-blue/10 text-light-blue hover:bg-light-blue hover:text-white border border-light-blue rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm";
  const combinedClasses = `${baseClasses} ${className}`.trim();

  // If it's a link (like a PDF file), render an anchor tag
  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={combinedClasses}
      >
        {icon}
        {title}
      </a>
    );
  }

  // Otherwise, render a standard button
  return (
    <button 
      onClick={onClick} 
      className={combinedClasses}
    >
      {icon}
      {title}
    </button>
  );
}