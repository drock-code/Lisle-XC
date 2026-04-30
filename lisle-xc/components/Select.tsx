import { SelectHTMLAttributes } from 'react';
import { DropdownArrowIcon } from '@/components/Icons';

// We extend the native select props, and add a custom wrapperClassName 
// just in case we need to control the width of the outer container.
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  wrapperClassName?: string;
}

export function Select({ className = '', wrapperClassName = '', children, ...props }: SelectProps) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        className={`w-full appearance-none bg-background border border-border text-foreground font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent cursor-pointer pr-10 transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      
      {/* Custom Dropdown Arrow Component */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-lisle-blue">
        <DropdownArrowIcon className="h-4 w-4 fill-current" />
      </div>
    </div>
  );
}