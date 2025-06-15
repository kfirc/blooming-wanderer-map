import React from 'react';

interface SidebarContainerProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({ isOpen, children }) => {
  return (
    <div className={`
      fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-40
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}; 