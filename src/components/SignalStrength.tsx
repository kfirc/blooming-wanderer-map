
import React from 'react';

interface SignalStrengthProps {
  intensity: number;
  className?: string;
}

const SignalStrength: React.FC<SignalStrengthProps> = ({ intensity, className = '' }) => {
  const bars = 4;
  const filledBars = Math.ceil(intensity * bars);

  return (
    <div className={`flex items-end space-x-0.5 ${className}`}>
      {Array.from({ length: bars }, (_, index) => (
        <div
          key={index}
          className={`w-1 transition-colors duration-200 ${
            index < filledBars 
              ? intensity > 0.7 
                ? 'bg-red-500' 
                : intensity > 0.4 
                  ? 'bg-orange-500' 
                  : 'bg-yellow-500'
              : 'bg-gray-300'
          }`}
          style={{ height: `${(index + 1) * 3 + 2}px` }}
        />
      ))}
    </div>
  );
};

export default SignalStrength;
