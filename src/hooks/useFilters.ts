import { useState, useCallback, useMemo } from 'react';

export interface UseFiltersProps {
  initialOrderBy?: 'date' | 'likes';
  initialFilterFlower?: string;
  initialSelectedFlowers?: string[];
  initialDateFilter?: string;
  allFlowerIds?: string[];
}

export interface UseFiltersReturn {
  // Current filter values
  orderBy: 'date' | 'likes';
  filterFlower: string;
  selectedFlowers: string[];
  dateFilter: string;
  
  // Setters
  setOrderBy: (value: 'date' | 'likes') => void;
  setFilterFlower: (value: string) => void;
  setSelectedFlowers: (value: string[]) => void;
  setDateFilter: (value: string) => void;
  
  // Computed values
  orderByField: 'post_date' | 'likes_count';
  selectedFlowerFilter: string[] | undefined;
  filtersActive: boolean;
  dateRange: Date | null;
  
  // Actions
  clearFilters: () => void;
  resetToDefaults: (allFlowerIds?: string[]) => void;
}

export const useFilters = ({
  initialOrderBy = 'date',
  initialFilterFlower = '__all__',
  initialSelectedFlowers = [],
  initialDateFilter = 'all',
  allFlowerIds = [],
}: UseFiltersProps = {}): UseFiltersReturn => {
  const [orderBy, setOrderBy] = useState<'date' | 'likes'>(initialOrderBy);
  const [filterFlower, setFilterFlower] = useState<string>(initialFilterFlower);
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>(initialSelectedFlowers);
  const [dateFilter, setDateFilter] = useState<string>(initialDateFilter);

  // Convert UI orderBy to database field
  const orderByField = useMemo(() => 
    orderBy === 'date' ? 'post_date' : 'likes_count', 
    [orderBy]
  );

  // Convert selectedFlowers to filter format (undefined if all selected)
  const selectedFlowerFilter = useMemo(() => 
    selectedFlowers.length === allFlowerIds.length ? undefined : selectedFlowers,
    [selectedFlowers, allFlowerIds]
  );

  // Check if any filters are active (not default values)
  const filtersActive = useMemo(() => (
    selectedFlowers.length !== allFlowerIds.length ||
    orderBy !== 'date' ||
    filterFlower !== '__all__' ||
    dateFilter !== 'all'
  ), [selectedFlowers, allFlowerIds, orderBy, filterFlower, dateFilter]);

  // Compute date range for filter
  const dateRange = useMemo(() => {
    const now = new Date();
    let from: Date | null = null;
    switch (dateFilter) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from = new Date(now);
        from.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        from = new Date(now);
        from.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        from = null;
    }
    return from;
  }, [dateFilter]);

  // Clear all filters to default values
  const clearFilters = useCallback(() => {
    setOrderBy('date');
    setFilterFlower('__all__');
    setDateFilter('all');
    setSelectedFlowers(allFlowerIds);
  }, [allFlowerIds]);

  // Reset to defaults with optional new allFlowerIds
  const resetToDefaults = useCallback((newAllFlowerIds?: string[]) => {
    const flowerIds = newAllFlowerIds || allFlowerIds;
    setOrderBy('date');
    setFilterFlower('__all__');
    setDateFilter('all');
    setSelectedFlowers(flowerIds);
  }, [allFlowerIds]);

  return {
    // Current values
    orderBy,
    filterFlower,
    selectedFlowers,
    dateFilter,
    
    // Setters
    setOrderBy,
    setFilterFlower,
    setSelectedFlowers,
    setDateFilter,
    
    // Computed values
    orderByField,
    selectedFlowerFilter,
    filtersActive,
    dateRange,
    
    // Actions
    clearFilters,
    resetToDefaults,
  };
}; 