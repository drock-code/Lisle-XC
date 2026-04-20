import React from 'react';

// 1. Define the exact props this component accepts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'; 
  children: React.ReactNode; // This represents the text/content inside the button
}

export default function Button({ 
  size = 'md', 
  children, 
  className = '', // Allow adding extra custom classes if needed
  ...props 
}: ButtonProps) {
  
  // 2. The core styles that every button gets
  const baseClasses = "bg-lisle-blue text-white rounded-full font-bold uppercase tracking-widest hover:bg-light-blue transition-all duration-300 shadow-lg shadow-lisle-blue/20 cursor-pointer";

  const sizeClasses = {
    sm: "px-6 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>    
  );
}