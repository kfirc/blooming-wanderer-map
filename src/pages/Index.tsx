
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Map from '../components/Map';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { BloomReport } from '../types/BloomReport';
import { bloomReportsService } from '../services/bloomReportsService';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<BloomReport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch bloom reports using React Query
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['bloom-reports'],
    queryFn: bloomReportsService.getRecentReports,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const handleLocationClick = (report: BloomReport) => {
    setSelectedLocation(report);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedLocation(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-purple-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>טוען דיווחי פריחה...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-purple-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <p className="mb-2">שגיאה בטעינת הדיווחים</p>
            <p className="text-sm">אנא נסה לרענן את הדף</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-purple-50">
      <Header />
      <div className="flex-1 flex relative">
        <Map 
          reports={reports} 
          onLocationClick={handleLocationClick}
          selectedLocation={selectedLocation}
        />
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          reports={selectedLocation ? [selectedLocation] : reports}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
};

export default Index;
