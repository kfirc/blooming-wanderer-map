import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Location, FlowerPerLocation, Flower } from '../../types/BloomReport';
import { bloomReportsService } from '../../services/bloomReportsService';
import ReportsSection from '../ReportsSection';
import { useReportsData } from '../../hooks/useReportsData';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import { useFilters } from '../../hooks/useFilters';
import { X, ChevronLeft } from 'lucide-react';
import {
  SidebarContainer,
  SidebarContent,
  SidebarInfoMode,
} from './index';
import { WazeButton } from './WazeButton';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedLocation: Location | null;
  sidebarMode: 'location' | 'info';
  flowersPerLocation: FlowerPerLocation[];
  flowersLoading: boolean;
  flowersError: unknown;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  selectedLocation,
  sidebarMode,
  flowersPerLocation,
  flowersLoading,
  flowersError,
}) => {
  // All flowers for ID mapping
  const [allFlowers, setAllFlowers] = useState<Flower[]>([]);

  // USING CUSTOM HOOKS: Date formatter
  const { formatDate } = useDateFormatter();

  // Memoize computed values
  const allFlowerIds = useMemo(() => 
    flowersPerLocation.map(f => f.flower.id), 
    [flowersPerLocation]
  );

  // USING CUSTOM HOOKS: Filter management
  const filters = useFilters({
    allFlowerIds,
  });

  const flowerIdToName = useMemo(() => 
    allFlowers.reduce((acc, flower) => {
      acc[flower.id] = flower.name;
      return acc;
    }, {} as Record<string, string>),
    [allFlowers]
  );

  const computedSidebarMode = useMemo(() => 
    sidebarMode === 'info' ? 'info' : (selectedLocation ? 'location' : 'all'),
    [sidebarMode, selectedLocation]
  );

  // USING CUSTOM HOOKS: Reports data for all reports
  const allReportsData = useReportsData({
    orderBy: filters.orderByField,
    filterFlower: filters.filterFlower,
    selectedFlowers: filters.selectedFlowerFilter,
    dateRange: filters.dateRange,
    pageSize: 5,
    enabled: isOpen && !selectedLocation, // Only load when sidebar is open and no specific location
  });

  // USING CUSTOM HOOKS: Reports data for location-specific reports
  const locationReportsData = useReportsData({
    selectedLocationId: selectedLocation?.id,
    orderBy: filters.orderByField,
    filterFlower: filters.filterFlower,
    selectedFlowers: filters.selectedFlowerFilter,
    dateRange: filters.dateRange,
    pageSize: 5,
    enabled: isOpen && !!selectedLocation, // Only load when sidebar is open and has location
  });

  // Load flowers when sidebar opens
  useEffect(() => {
    if (isOpen) {
      bloomReportsService.getFlowers()
        .then(setAllFlowers);
    }
  }, [isOpen]);

  // Complete reset when sidebar is closed
  useEffect(() => {
    if (!isOpen) {
      // Complete reset after sidebar close animation completes
      const timeoutId = setTimeout(() => {
        // Clear all filters
        filters.clearFilters();
        
        // Reset reports data by refreshing both hooks
        allReportsData.refresh();
        locationReportsData.refresh();
        
        // Clear local state
        setAllFlowers([]);
      }, 300); // Match the sidebar animation duration

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, filters.clearFilters, allReportsData.refresh, locationReportsData.refresh]);

  // Choose the appropriate reports data based on selected location
  const currentReportsData = selectedLocation ? locationReportsData : allReportsData;

  // Determine header title based on mode and location (same logic as SidebarHeader)
  const headerTitle = useMemo(() => {
    if (sidebarMode === 'info') {
      return 'מידע על הדף';
    }
    return selectedLocation ? selectedLocation.name : 'כל הדיווחים';
  }, [sidebarMode, selectedLocation]);

  // Determine header content (Waze button when appropriate)
  const headerContent = useMemo(() => {
    if (selectedLocation && sidebarMode !== 'info') {
      return <WazeButton location={selectedLocation} />;
    }
    return undefined;
  }, [selectedLocation, sidebarMode]);

  // Handle scroll to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = clientHeight * 1.5;
    
    if (scrollHeight - scrollTop <= threshold && currentReportsData.hasMore && !currentReportsData.loadingMore) {
      currentReportsData.loadMore();
    }
  }, [currentReportsData]);

  // Memoize the fetchReports function passed to ReportsSection
  const reportsFetcher = useCallback(async ({ 
    offset, 
    reset, 
    orderBy, 
    filterFlower, 
    selectedFlowers, 
    fromDate 
  }: {
    offset: number;
    reset: boolean;
    orderBy: string;
    filterFlower: string;
    selectedFlowers?: string[];
    fromDate?: string;
  }) => {
    // Convert orderBy string to the correct type
    const orderByField = orderBy === 'post_date' ? 'post_date' : 'likes_count';
    
    if (selectedLocation) {
      return bloomReportsService.getReportsForLocationWithPagination(
        selectedLocation.id,
        offset,
        5,
        orderByField,
        filterFlower,
        selectedFlowers,
        fromDate
      );
    } else {
      return bloomReportsService.getReportsWithPagination(
        offset,
        5,
        orderByField,
        filterFlower,
        selectedFlowers
      );
    }
  }, [selectedLocation]);

  return (
    <>
      {/* Toggle button to open sidebar */}
      <button
        onClick={onToggle}
        className={`
          fixed top-1/2 -translate-y-1/2 right-0 z-40 w-8 h-16 p-0 
          bg-white shadow-lg border border-gray-200 hover:bg-gray-50 
          transition-all duration-300 ease-in-out rounded-l-lg 
          flex items-center justify-center
          ${!isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-label="פתח סרגל צד"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
      
      <SidebarContainer 
        isOpen={isOpen} 
        onClose={onToggle}
        title={headerTitle}
        headerContent={headerContent}
      >
        <SidebarContent onScroll={handleScroll}>
          {sidebarMode === 'info' ? (
            <SidebarInfoMode />
          ) : (
            <ReportsSection
              flowersPerLocation={flowersPerLocation}
              isLoadingFlowers={flowersLoading}
              flowersError={flowersError}
              reports={currentReportsData.reports}
              hasMore={currentReportsData.hasMore}
              loadingMore={currentReportsData.loadingMore}
              sidebarMode={selectedLocation ? 'location' : 'all'}
              locationName={selectedLocation?.name}
              locationId={selectedLocation?.id}
              flowerIdToName={flowerIdToName}
              allFlowers={allFlowers}
              // Filter props
              orderBy={filters.orderBy}
              filterFlower={filters.filterFlower}
              selectedFlowers={filters.selectedFlowers}
              dateFilter={filters.dateFilter}
              filtersActive={filters.filtersActive}
              onOrderByChange={filters.setOrderBy}
              onFilterFlowerChange={filters.setFilterFlower}
              onSelectedFlowersChange={filters.setSelectedFlowers}
              onDateFilterChange={filters.setDateFilter}
              onClearFilters={filters.clearFilters}
            />
          )}
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 