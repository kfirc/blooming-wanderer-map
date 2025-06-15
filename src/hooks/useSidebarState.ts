import { useState } from 'react';

export interface UseSidebarStateReturn {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarState = (initialOpen = false): UseSidebarStateReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    toggle,
    open,
    close,
  };
}; 