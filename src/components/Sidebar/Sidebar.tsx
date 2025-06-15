import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Location, FlowerPerLocation, Flower } from '../../types/BloomReport';
import { bloomReportsService } from '../../services/bloomReportsService';
import ReportsSection from '../ReportsSection';
import { useReportsData } from '../../hooks/useReportsData';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import { useFilters } from '../../hooks/useFilters';
import {
  SidebarContainer,
  SidebarHeader,
  SidebarContent,
  SidebarOverlay,
  SidebarToggle,
  SidebarInfoMode,
} from './index';

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
  flowersError
}) => {
  // All flowers for ID mapping
  const [allFlowers, setAllFlowers] = useState<Flower[]>([]);
  const [allFlowersLoading, setAllFlowersLoading] = useState(false);
  const [shouldLoadReports, setShouldLoadReports] = useState(false);

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

  // USING CUSTOM HOOKS: Reports data for all reports - only load when shouldLoadReports is true
  const allReportsData = useReportsData({
    orderBy: filters.orderByField,
    filterFlower: filters.filterFlower,
    selectedFlowers: filters.selectedFlowerFilter,
    dateRange: filters.dateRange,
    pageSize: 5,
    enabled: shouldLoadReports && !selectedLocation, // Only load when enabled and no specific location
  });

  // USING CUSTOM HOOKS: Reports data for location-specific reports - only load when shouldLoadReports is true
  const locationReportsData = useReportsData({
    selectedLocationId: selectedLocation?.id,
    orderBy: filters.orderByField,
    filterFlower: filters.filterFlower,
    selectedFlowers: filters.selectedFlowerFilter,
    dateRange: filters.dateRange,
    pageSize: 5,
    enabled: shouldLoadReports && !!selectedLocation, // Only load when enabled and has location
  });

  // Load flowers when sidebar opens or on mount
  useEffect(() => {
    if (isOpen) {
      setAllFlowersLoading(true);
      setShouldLoadReports(false); // Reset reports loading
      bloomReportsService.getFlowers()
        .then(setAllFlowers)
        .finally(() => setAllFlowersLoading(false));
    }
  }, [isOpen]);

  // Enable reports loading only after all other data has finished loading
  useEffect(() => {
    if (isOpen && !allFlowersLoading && !flowersLoading) {
      // Add a small delay to ensure everything else is rendered first
      const timer = setTimeout(() => {
        setShouldLoadReports(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldLoadReports(false);
    }
  }, [isOpen, allFlowersLoading, flowersLoading]);

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
        setShouldLoadReports(false);
      }, 300); // Match the sidebar animation duration

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, filters.clearFilters, allReportsData.refresh, locationReportsData.refresh]);

  // Choose the appropriate reports data based on selected location
  const currentReportsData = selectedLocation ? locationReportsData : allReportsData;

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
      <SidebarOverlay isOpen={isOpen} onClose={onToggle} />
      <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
      
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader 
          selectedLocation={selectedLocation}
          sidebarMode={sidebarMode}
        />
        
        <SidebarContent onScroll={handleScroll}>
          {sidebarMode === 'info' ? (
            <SidebarInfoMode />
          ) : (
            <ReportsSection
              flowersPerLocation={computedSidebarMode === 'location' ? flowersPerLocation : []}
              isLoadingFlowers={flowersLoading}
              flowersError={flowersError}
              reports={currentReportsData.reports}
              hasMore={currentReportsData.hasMore}
              loadingMore={currentReportsData.loadingMore}
              sidebarMode={computedSidebarMode}
              locationName={selectedLocation ? selectedLocation.name : undefined}
              locationId={selectedLocation ? selectedLocation.id : undefined}
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