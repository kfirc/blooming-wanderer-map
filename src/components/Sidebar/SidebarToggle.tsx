import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onToggle}
      className={`
        fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out
        shadow-lg w-8 h-16 p-0
        ${isOpen 
          ? 'left-0 rounded-l-none rounded-r-lg md:right-96 md:left-auto md:rounded-l-lg md:rounded-r-none' 
          : 'right-0 rounded-l-lg rounded-r-none'
        }
      `}
      aria-label={`${isOpen ? 'סגור' : 'פתח'} סרגל צד`}
    >
      {isOpen ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  );
}; 