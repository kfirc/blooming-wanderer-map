import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Heart, Camera, Navigation, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BloomReport } from '../types/BloomReport';
import ImageGallery from './ImageGallery';
import FlowersList from './FlowersList';
import { useQuery } from '@tanstack/react-query';
import { bloomReportsService } from '../services/bloomReportsService';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  reports: BloomReport[];
  selectedLocation: BloomReport | null;
}

// Move formatDate function outside of component scope so it can be accessed by LocationCard
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'היום';
  if (diffDays === 2) return 'אתמול';
  if (diffDays <= 7) return `לפני ${diffDays} ימים`;
  return date.toLocaleDateString('he-IL');
};

const LocationDrawerHeader: React.FC<{ selectedLocation: BloomReport['location'] | null }> = ({ selectedLocation }) => {
  if (selectedLocation) {
    return (
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-purple-50">
        <h2 className="text-xl font-bold text-gray-800 truncate">{selectedLocation.name}</h2>
        <button
          onClick={() => window.open(selectedLocation.waze_url || `https://waze.com/ul?ll=${selectedLocation.latitude},${selectedLocation.longitude}`, '_blank')}
          className="focus:outline-none hover:scale-110 transition-transform ml-4"
          title="נווט עם Waze"
        >
          <img src="/waze.svg" alt="Waze" className="h-8 w-8" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-purple-50">
      <h2 className="text-xl font-bold text-gray-800">דיווחי פריחה</h2>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, reports, selectedLocation }) => {
  const [offset, setOffset] = useState(0);
  const [allReports, setAllReports] = useState<BloomReport[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load more reports with pagination
  const loadMoreReports = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const newReports = await bloomReportsService.getReportsWithPagination(offset, 5);
      if (newReports.length < 5) {
        setHasMore(false);
      }
      setAllReports(prev => [...prev, ...newReports]);
      setOffset(prev => prev + 5);
    } catch (error) {
      console.error('Error loading more reports:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [offset, loadingMore, hasMore]);

  // Initialize with first batch
  useEffect(() => {
    if (isOpen && !selectedLocation && allReports.length === 0) {
      loadMoreReports();
    }
  }, [isOpen, selectedLocation, allReports.length, loadMoreReports]);

  // Handle scroll to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loadingMore) {
      loadMoreReports();
    }
  }, [hasMore, loadingMore, loadMoreReports]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Collapsible Toggle Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggle}
        className={`
          fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out
          rounded-l-lg rounded-r-none shadow-lg w-8 h-16 p-0
          ${isOpen ? 'right-96 md:right-96' : 'right-0'}
        `}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <LocationDrawerHeader selectedLocation={selectedLocation ? selectedLocation.location : null} />

          {/* Content */}
          <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            {selectedLocation ? (
              /* Single Location View */
              <div>
                {/* Flowers Section */}
                <FlowersList 
                  locationId={selectedLocation.location.id} 
                  locationName={selectedLocation.location.name}
                />
                
                {/* Reports Section - Always shown */}
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-4">
                    {reports.filter(report => report.location.id === selectedLocation.location.id).length > 0 ? (
                      reports
                        .filter(report => report.location.id === selectedLocation.location.id)
                        .map((report) => (
                          <LocationCard key={report.id} report={report} isDetailed={true} />
                        ))
                    ) : (
                      <div className="text-center text-gray-600 py-8">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>אין דיווחים עבור מיקום זה</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* All Reports List */
              <div className="p-4 space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  מציג דיווחי פריחה אחרונים
                </div>
                {allReports.map((report) => (
                  <LocationCard key={report.id} report={report} isDetailed={false} />
                ))}
                {loadingMore && (
                  <div className="text-center py-4 text-gray-500">
                    טוען עוד דיווחים...
                  </div>
                )}
                {!hasMore && allReports.length > 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    הוצגו כל הדיווחים
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface LocationCardProps {
  report: BloomReport;
  isDetailed: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({ report, isDetailed }) => {
  const generateWazeUrl = (lat: number, lng: number) => {
    return `https://waze.com/ul?ll=${lat},${lng}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={report.user.profile_photo_url || `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face`}
            alt={report.user.display_name}
            className="w-10 h-10 rounded-full border-2 border-purple-200"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{report.user.display_name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(report.post_date)}</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>{report.likes_count}</span>
            </div>
          </div>
        </div>

        <h4 className="font-medium text-gray-800 mb-2">{report.title}</h4>
        <p className="text-gray-700 text-sm mb-3">{report.description}</p>

        {/* Flower Types */}
        {report.flower_types.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {report.flower_types.map((flower, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gradient-to-r from-green-100 to-purple-100 text-green-800 text-xs rounded-full"
              >
                {flower}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image Gallery */}
      {report.images.length > 0 && (
        <ImageGallery images={report.images} isDetailed={isDetailed} />
      )}

      {/* Actions */}
      <div className="p-4 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Camera className="h-4 w-4" />
            <span>{report.images.length} תמונות</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs flex items-center space-x-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => window.open(generateWazeUrl(report.location.latitude, report.location.longitude), '_blank')}
            >
              <img src="/waze.svg" alt="Waze" className="h-4 w-4" />
              <span>Waze</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs flex items-center space-x-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => window.open(report.facebook_post_url, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
              <span>פייסבוק</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
