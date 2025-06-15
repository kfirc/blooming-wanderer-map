import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BloomReport, FlowerPerLocation, Flower } from '../../types/BloomReport';
import { bloomReportsService } from '../../services/bloomReportsService';
import ReportsSection from '../ReportsSection';
import { useReportsData } from '../../hooks/useReportsData';
import { useDateFormatter } from '../../hooks/useDateFormatter';
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
  reports: BloomReport[];
  selectedLocation: BloomReport | null;
  sidebarMode: 'location' | 'info';
  flowersPerLocation: FlowerPerLocation[];
  flowersLoading: boolean;
  flowersError: unknown;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  reports,
  selectedLocation,
  sidebarMode,
  flowersPerLocation,
  flowersLoading,
  flowersError
}) => {
  // Filter state - still managed locally as it affects both hooks
  const [orderBy, setOrderBy] = useState<'date' | 'likes'>('date');
  const [filterFlower, setFilterFlower] = useState<string>('__all__');
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);

  // All flowers for ID mapping
  const [allFlowers, setAllFlowers] = useState<Flower[]>([]);

  // USING CUSTOM HOOKS: Date formatter
  const { formatDate } = useDateFormatter();

  // Memoize computed values
  const orderByField = useMemo(() => 
    orderBy === 'date' ? 'post_date' : 'likes_count', 
    [orderBy]
  );

  const allFlowerIds = useMemo(() => 
    flowersPerLocation.map(f => f.flower.id), 
    [flowersPerLocation]
  );

  const selectedFlowerFilter = useMemo(() => 
    selectedFlowers.length === allFlowerIds.length ? undefined : selectedFlowers,
    [selectedFlowers, allFlowerIds]
  );

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
    orderBy: orderByField,
    filterFlower,
    selectedFlowers: selectedFlowerFilter,
    pageSize: 5,
  });

  // USING CUSTOM HOOKS: Reports data for location-specific reports
  const locationReportsData = useReportsData({
    selectedLocationId: selectedLocation?.location.id,
    orderBy: orderByField,
    filterFlower,
    selectedFlowers: selectedFlowerFilter,
    pageSize: 5,
  });

  // Load flowers on mount
  useEffect(() => {
    bloomReportsService.getFlowers().then(setAllFlowers);
  }, []);

  // When flowersPerLocation changes, reset selectedFlowers to all
  useEffect(() => {
    if (flowersPerLocation && flowersPerLocation.length > 0) {
      setSelectedFlowers(flowersPerLocation.map(f => f.flower.id));
    }
  }, [flowersPerLocation]);

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
        selectedLocation.location.id,
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
          selectedLocation={selectedLocation ? selectedLocation.location : null}
        />
        
        <SidebarContent onScroll={handleScroll}>
          {sidebarMode === 'info' ? (
            <SidebarInfoMode />
          ) : (
            <ReportsSection
              flowersPerLocation={computedSidebarMode === 'location' ? flowersPerLocation : []}
              isLoadingFlowers={flowersLoading}
              flowersError={flowersError}
              fetchReports={reportsFetcher}
              reports={currentReportsData.reports}
              hasMore={currentReportsData.hasMore}
              loadingMore={currentReportsData.loadingMore}
              sidebarMode={computedSidebarMode}
              locationName={selectedLocation ? selectedLocation.location.name : undefined}
              locationId={selectedLocation ? selectedLocation.location.id : undefined}
              flowerIdToName={flowerIdToName}
              allFlowers={allFlowers}
            />
          )}
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 