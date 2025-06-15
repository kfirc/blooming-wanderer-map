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
        rounded-l-lg rounded-r-none shadow-lg w-8 h-16 p-0
        ${isOpen ? 'right-96 md:right-96' : 'right-0'}
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