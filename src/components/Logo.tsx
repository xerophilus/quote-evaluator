import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4"
        className="text-blue-600"
      />
      
      {/* Inner background circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="35" 
        fill="currentColor"
        className="text-blue-600"
      />
      
      {/* Document background */}
      <rect 
        x="35" 
        y="28" 
        width="30" 
        height="36" 
        rx="3" 
        fill="white"
      />
      
      {/* Document lines */}
      <line x1="40" y1="35" x2="55" y2="35" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="60" y2="40" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="45" x2="58" y2="45" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Checkmark */}
      <path 
        d="m42 52 3 3 8-8" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-blue-600"
      />
    </svg>
  );
};

export default Logo; 