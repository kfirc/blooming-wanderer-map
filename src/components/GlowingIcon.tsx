
import React from 'react';
import { Flower2 } from 'lucide-react';

interface GlowingIconProps {
  isInSeason: boolean;
  className?: string;
}

const GlowingIcon: React.FC<GlowingIconProps> = ({ isInSeason, className = '' }) => {
  if (!isInSeason) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75"></div>
      <div className="relative flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
        <Flower2 className="h-3 w-3 text-white" />
      </div>
    </div>
  );
};

export default GlowingIcon;
