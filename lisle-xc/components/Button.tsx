import React, { ElementType, ComponentPropsWithoutRef } from 'react';

interface ButtonBaseProps {
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  children: React.ReactNode;
  className?: string; 
}

type ButtonProps<T extends ElementType> = ButtonBaseProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof ButtonBaseProps | 'as'>;

export default function Button<T extends ElementType = 'button'>({
  size = 'md',
  isActive = false,
  children,
  className = '', 
  as,
  ...props
}: ButtonProps<T>) {
  
  const Tag: ElementType = as || 'button';

  const baseClasses = "rounded-full font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer inline-flex items-center justify-center text-center";

  const sizeClasses = {
    sm: "px-6 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  const colorClasses = isActive 
    ? "bg-white text-lisle-blue scale-105 shadow-md hover:bg-blue-50 hover:shadow-lg" 
    : "bg-lisle-blue text-white hover:bg-light-blue shadow-lg shadow-lisle-blue/20";

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${colorClasses} ${className}`;

  return (
    <Tag 
      className={combinedClasses}
      {...props}
    >
      {children}
    </Tag>    
  );
}