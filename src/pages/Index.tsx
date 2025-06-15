import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Map from '../components/Map';
import { BloomReport, FlowerPerLocation } from '../types/BloomReport';
import { bloomReportsService } from '../services/bloomReportsService';
import MapHeader from '../components/MapHeader';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import { useSidebarState } from '../hooks/useSidebarState';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<BloomReport | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'location' | 'info'>('location');
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [startTransition, setStartTransition] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);
  
  // USING CUSTOM HOOK: Sidebar state management
  const sidebar = useSidebarState(false);

  // Fetch bloom reports using React Query
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['bloom-reports'],
    queryFn: bloomReportsService.getRecentReports,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch flowers for selected location
  const {
    data: flowersPerLocation = [],
    isLoading: flowersLoading,
    error: flowersError,
  } = useQuery<FlowerPerLocation[], unknown>({
    queryKey: ['flowers-per-location', selectedLocation?.location.id],
    queryFn: () => selectedLocation ? bloomReportsService.getFlowersForLocation(selectedLocation.location.id) : Promise.resolve([]),
    enabled: !!selectedLocation && sidebar.isOpen && sidebarMode === 'location',
    staleTime: 5 * 60 * 1000,
  });

  // Handle loading screen animation sequence
  useEffect(() => {
    if (!isLoading && reports.length > 0) {
      // Start the snake animation immediately when loading completes
      setLoadingComplete(true);
      
      // Start the spectacular transition after the circle animation completes + small delay
      const transitionTimer = setTimeout(() => {
        setStartTransition(true);
      }, 2600); // 2s for snake-then-stretch animation + 600ms pause to appreciate the completed circle
      
      // Complete the transition and hide loading screen - wait for full transition
      const hideTimer = setTimeout(() => {
        setTransitionComplete(true);
        setShowLoadingScreen(false);
      }, 4300); // 2s circle + 600ms pause + 1.7s transition (max of 1.5s collapse and 1.3s logo move + buffer)
      
      return () => {
        clearTimeout(transitionTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isLoading, reports.length]);

  const handleLocationClick = (report: BloomReport) => {
    setSelectedLocation(report);
    setSidebarMode('location');
    sidebar.open();
  };

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') sidebar.close();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [sidebar]);

  const handleToggleSidebar = () => {
    sidebar.toggle();
    if (!sidebar.isOpen) {
      // Don't clear selectedLocation when opening
    } else {
      // Clear selectedLocation and reset mode when closing, after animation
      setTimeout(() => {
        setSelectedLocation(null);
        setSidebarMode('location');
      }, 300);
    }
  };

  const handleInfoClick = () => {
    setSidebarMode('info');
    sidebar.open();
  };

  if (error) {
    return (
      <LoadingScreen message="שגיאה בטעינת הדיווחים - אנא נסה לרענן את הדף" />
    );
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-green-50 to-purple-50">
      <div className="h-full w-full relative">
        <Map 
          reports={reports} 
          onLocationClick={handleLocationClick}
          selectedLocation={selectedLocation}
        />
        <Sidebar 
          isOpen={sidebar.isOpen}
          onToggle={handleToggleSidebar}
          reports={selectedLocation ? reports.filter(r => r.location.id === selectedLocation.location.id) : reports}
          selectedLocation={selectedLocation}
          sidebarMode={sidebarMode}
          flowersPerLocation={flowersPerLocation}
          flowersLoading={flowersLoading}
          flowersError={flowersError}
        />
        {/* Only show MapHeader after transition is complete */}
        {!showLoadingScreen && <MapHeader onInfoClick={handleInfoClick} />}
      </div>
      
      {/* Loading screen overlays the map during transition */}
      {showLoadingScreen && (
        <LoadingScreen 
          loadingComplete={loadingComplete} 
          startTransition={startTransition} 
        />
      )}
    </div>
  );
};

export default Index;
