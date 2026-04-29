import Image from 'next/image';
import { User } from 'lucide-react';

interface RunnerAvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RunnerAvatar({ 
  src, 
  name, 
  size = 'md', 
  className = '' // Default to empty string to avoid "undefined" in class list
}: RunnerAvatarProps) {
  
  // 1. Sizing Maps
  const containerSizes = {
    sm: "w-8 h-8 border",
    md: "w-14 h-14 border",
    lg: "w-32 h-32 md:w-40 md:h-40 border-4",
  };

  const imageSizes = {
    sm: "32px",
    md: "56px",
    lg: "(max-width: 768px) 128px, 160px",
  };

  const styles = {
    sm: "bg-light-blue-gray border-lisle-blue/20 shadow-sm",
    md: "bg-light-blue-gray border-border",
    lg: "bg-light-blue-gray border-foreground shadow-lg",
  };

  // 2. Base constant classes
  const baseClasses = "relative rounded-full overflow-hidden shrink-0 flex items-center justify-center transition-all duration-300";

  return (
    <div 
      className={`${baseClasses} ${containerSizes[size]} ${styles[size]} ${className}`.trim()}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={imageSizes[size]}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center select-none">
          {size === 'sm' ? (
            <span className="text-lisle-blue font-bold text-[10px] uppercase tracking-tighter">
              {name.charAt(0)}
            </span>
          ) : (
            <User 
              size={size === 'lg' ? 120 : 80} 
              strokeWidth={1.5} 
              className={`text-inherit opacity-40 ${size === 'lg' ? "mt-10" : "mt-6"}`} 
            />
          )}
        </div>
      )}
    </div>
  );
}