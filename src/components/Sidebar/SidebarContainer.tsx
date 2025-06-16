import React from 'react';
import { SlidePanel } from '../ui/slide-panel';

interface SidebarContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  headerContent?: React.ReactNode;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  headerContent 
}) => {
  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width="w-full md:w-96"
      title={title}
      headerContent={headerContent}
      showHeader={true}
      showCloseButton={true}
      closeButtonPosition="outside"
      backdrop={true}
      backdropBlur={true}
      zIndex={40}
      className="shadow-xl"
    >
      <div className="h-full flex flex-col">
        {children}
      </div>
    </SlidePanel>
  );
}; 