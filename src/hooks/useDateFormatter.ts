import { useCallback } from 'react';

export const useDateFormatter = () => {
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'היום';
    if (diffDays === 2) return 'אתמול';
    if (diffDays <= 7) return `לפני ${diffDays} ימים`;
    return date.toLocaleDateString('he-IL');
  }, []);

  return { formatDate };
}; 