import React from 'react';

interface SidebarContentProps {
  children: React.ReactNode;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({ children, onScroll }) => {
  return (
    <div 
      className="flex-1 overflow-y-auto" 
      onScroll={onScroll}
    >
      {children}
    </div>
  );
}; 