// components/PRIcons.tsx
import React from 'react';

export const LifetimePRIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="#fcd34d" 
    stroke="#d97706" 
    strokeWidth="2" 
    {...props}
  >
    <title>Lifetime PR</title>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const SeasonPRIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="#10b981" 
    stroke="#047857" 
    strokeWidth="3" 
    {...props}
  >
    <title>Season PR</title>
    <polygon points="12 2 22 12 12 22 2 12" />
  </svg>
);

export const DataPointCircle = (props: React.SVGProps<SVGCircleElement>) => (
  <circle 
    stroke="#0ea5e9" 
    strokeWidth="3" 
    {...props} 
  />
);