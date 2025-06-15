import React from 'react';

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarOverlay: React.FC<SidebarOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 z-40"
      onClick={onClose}
      aria-label="סגור סרגל צד"
    />
  );
}; 