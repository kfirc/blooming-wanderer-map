import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  width?: string;
  title?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeButtonPosition?: 'inside' | 'outside' | 'responsive';
  backdrop?: boolean;
  backdropBlur?: boolean;
  className?: string;
  children: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  zIndex?: number;
  headerContent?: React.ReactNode; // Custom header content (e.g., Waze button)
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  side = 'right',
  width = 'w-96',
  title,
  showHeader = true,
  showCloseButton = true,
  closeButtonPosition = 'responsive',
  backdrop = true,
  backdropBlur = true,
  className,
  children,
  dir = 'rtl',
  zIndex = 50,
  headerContent,
}) => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle smooth opening/closing animation
  useEffect(() => {
    if (isOpen) {
      setIsPanelVisible(true);
    }
  }, [isOpen]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = () => {
    setIsPanelVisible(false);
    setTimeout(() => onClose(), 300); // Wait for animation to complete
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Determine if we should use inside positioning
  // For responsive positioning: inside on mobile, outside on desktop
  const isFullWidthOnMobile = width.includes('w-full');
  const shouldUseInsidePosition = 
    closeButtonPosition === 'inside' ||
    (closeButtonPosition === 'responsive' && isFullWidthOnMobile && isMobile);

  const sideClasses = {
    left: {
      position: 'left-0',
      transform: isOpen && isPanelVisible ? 'translate-x-0' : '-translate-x-full',
      closeButton: shouldUseInsidePosition ? 'left-4 top-4' : 'right-0 translate-x-full rounded-r-lg',
    },
    right: {
      position: 'right-0', 
      transform: isOpen && isPanelVisible ? 'translate-x-0' : 'translate-x-full',
      closeButton: shouldUseInsidePosition ? 'right-4 top-4' : 'left-0 -translate-x-full rounded-l-lg',
    },
  };

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div 
          className={cn(
            'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out',
            backdropBlur && 'backdrop-blur-sm',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          style={{ zIndex: zIndex - 10 }}
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div 
        className={cn(
          'fixed top-0 h-full bg-white/95 backdrop-blur-md shadow-2xl border-white/20 transform transition-all duration-300 ease-out',
          width,
          sideClasses[side].position,
          sideClasses[side].transform,
          side === 'left' ? 'border-r' : 'border-l',
          className
        )}
        style={{ zIndex }}
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        {/* Close button positioned outside panel edge (only when not using inside position) */}
        {showCloseButton && !shouldUseInsidePosition && isOpen && (
          <button
            onClick={handleClose}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 z-50 w-8 h-16 p-0 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 ease-in-out',
              'flex items-center justify-center',
              sideClasses[side].closeButton
            )}
            aria-label="סגור"
          >
            {side === 'right' ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}

        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-purple-50">
            {/* Custom header content (e.g., Waze button) - pinned to absolute left */}
            <div className="flex-shrink-0">
              {headerContent || <div></div>}
            </div>
            
            {/* Title - centered/right-aligned for RTL */}
            {title && (
              <h2 className="text-xl font-bold text-gray-800 truncate text-right flex-1 min-w-0 mx-4">
                {title}
              </h2>
            )}
            
            {/* Close button positioned inside header */}
            <div className="flex-shrink-0">
              {showCloseButton && shouldUseInsidePosition ? (
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                  aria-label="סגור"
                >
                  {side === 'right' ? (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 h-full overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .slide-panel-content::-webkit-scrollbar {
          width: 6px;
        }

        .slide-panel-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .slide-panel-content::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .slide-panel-content::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
}; 