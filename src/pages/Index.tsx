import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Map from '../components/Map';
import { BloomReport, FlowerPerLocation } from '../types/BloomReport';
import { bloomReportsService } from '../services/bloomReportsService';
import { Loader2 } from 'lucide-react';
import MapHeader from '../components/MapHeader';
import Sidebar from '../components/Sidebar';
import { useSidebarState } from '../hooks/useSidebarState';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<BloomReport | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'location' | 'info'>('location');
  
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-purple-50">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>טוען דיווחי פריחה...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-purple-50">
        <div className="text-center text-gray-600">
          <p className="mb-2">שגיאה בטעינת הדיווחים</p>
          <p className="text-sm">אנא נסה לרענן את הדף</p>
        </div>
      </div>
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
        <MapHeader onInfoClick={handleInfoClick} />
      </div>
    </div>
  );
};

export default Index;
