import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'; 
  isActive?: boolean;
  children: React.ReactNode; 
}

export default function Button({ 
  size = 'md', 
  isActive = false,
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  
  // Base classes (Layout, sizing, and transitions only - no colors!)
  const baseClasses = "rounded-full font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer";

  const sizeClasses = {
    sm: "px-6 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  // Apply colors strictly based on whether the button is active
  const colorClasses = isActive 
    ? "bg-white text-lisle-blue scale-105 shadow-md" 
    : "bg-lisle-blue text-white hover:bg-light-blue shadow-lg shadow-lisle-blue/20";

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${className}`}
      {...props}
    >
      {children}
    </button>    
  );
}