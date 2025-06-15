import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spin' | 'pulse' | 'bounce' | 'dots' | 'bars' | 'ring';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorClasses = {
  primary: 'text-purple-600',
  secondary: 'text-green-600',
  accent: 'text-blue-600',
  muted: 'text-gray-400',
};

const SpinVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <svg
    className={cn('animate-spin', size, color)}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const PulseVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn('animate-pulse rounded-full', size, `bg-current ${color}`)} />
);

const BounceVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn('flex space-x-1', color)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'rounded-full bg-current animate-bounce',
          size === 'w-4 h-4' ? 'w-2 h-2' : 
          size === 'w-6 h-6' ? 'w-3 h-3' :
          size === 'w-8 h-8' ? 'w-4 h-4' :
          size === 'w-12 h-12' ? 'w-6 h-6' : 'w-8 h-8'
        )}
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

const DotsVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn('flex space-x-1', color)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'rounded-full bg-current animate-pulse',
          size === 'w-4 h-4' ? 'w-1 h-1' : 
          size === 'w-6 h-6' ? 'w-2 h-2' :
          size === 'w-8 h-8' ? 'w-2 h-2' :
          size === 'w-12 h-12' ? 'w-3 h-3' : 'w-4 h-4'
        )}
        style={{
          animationDelay: `${i * 0.16}s`,
        }}
      />
    ))}
  </div>
);

const BarsVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn('flex space-x-1 items-end', color)}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={cn(
          'bg-current animate-pulse',
          size === 'w-4 h-4' ? 'w-1' : 
          size === 'w-6 h-6' ? 'w-1' :
          size === 'w-8 h-8' ? 'w-1' :
          size === 'w-12 h-12' ? 'w-2' : 'w-2'
        )}
        style={{
          height: size === 'w-4 h-4' ? '16px' : 
                  size === 'w-6 h-6' ? '24px' :
                  size === 'w-8 h-8' ? '32px' :
                  size === 'w-12 h-12' ? '48px' : '64px',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

const RingVariant: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={cn('relative', size)}>
    <div className={cn('absolute border-4 border-gray-200 rounded-full', size)} />
    <div
      className={cn(
        'absolute border-4 border-transparent rounded-full animate-spin',
        size,
        color.replace('text-', 'border-t-')
      )}
    />
  </div>
);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spin',
  color = 'primary',
  className,
  message,
  fullScreen = false,
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  const renderSpinner = () => {
    switch (variant) {
      case 'spin':
        return <SpinVariant size={sizeClass} color={colorClass} />;
      case 'pulse':
        return <PulseVariant size={sizeClass} color={colorClass} />;
      case 'bounce':
        return <BounceVariant size={sizeClass} color={colorClass} />;
      case 'dots':
        return <DotsVariant size={sizeClass} color={colorClass} />;
      case 'bars':
        return <BarsVariant size={sizeClass} color={colorClass} />;
      case 'ring':
        return <RingVariant size={sizeClass} color={colorClass} />;
      default:
        return <SpinVariant size={sizeClass} color={colorClass} />;
    }
  };

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        fullScreen ? 'min-h-screen' : '',
        className
      )}
    >
      {renderSpinner()}
      {message && (
        <p className="text-sm text-gray-600 animate-pulse" dir="rtl">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}; 