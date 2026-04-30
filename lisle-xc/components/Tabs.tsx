import Link from 'next/link';

interface TabGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function TabGroup({ children, className = '' }: TabGroupProps) {
  return (
    <div className={`flex bg-light-blue-gray rounded-xl p-1 shadow-inner shrink-0 w-full ${className}`}>
      {children}
    </div>
  );
}

interface TabProps {
  label: string;
  isActive: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function Tab({ 
  label, 
  isActive, 
  onClick, 
  href, 
  className = 'px-4 py-2.5 flex-1 md:flex-none'
}: TabProps) {
  
  const baseStyles = `text-sm font-bold rounded-lg transition-all text-center ${className}`;
  const activeStyles = isActive 
    ? 'bg-background text-foreground shadow-sm' 
    : 'text-lisle-blue hover:text-background cursor-pointer';

  const combinedStyles = `${baseStyles} ${activeStyles}`;

  // If an href is provided, render a Next.js Link (Server-side / SEO friendly)
  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {label}
      </Link>
    );
  }

  // Otherwise, render a standard button (Client-side state)
  return (
    <button onClick={onClick} className={combinedStyles}>
      {label}
    </button>
  );
}