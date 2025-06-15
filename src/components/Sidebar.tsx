import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Heart, Camera, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BloomReport, FlowerPerLocation, Flower } from '../types/BloomReport';
import ImageGallery from './ImageGallery';
import FlowersList from './FlowersList';
import { bloomReportsService } from '../services/bloomReportsService';
import LocationOrderSelect from './LocationOrderSelect';
import LocationFlowerFilter from './LocationFlowerFilter';
import ReportsSection from './ReportsSection';
import { Badge } from './ui/badge';

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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, reports, selectedLocation, sidebarMode, flowersPerLocation, flowersLoading, flowersError }) => {
  const [offset, setOffset] = useState(0);
  const [allReports, setAllReports] = useState<BloomReport[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // New state for order and filter
  const [orderBy, setOrderBy] = useState<'date' | 'likes'>('date');
  const [filterFlower, setFilterFlower] = useState<string>('__all__');

  // Map UI orderBy to DB field
  const orderByField = orderBy === 'date' ? 'post_date' : 'likes_count';

  // Compute available flowers for filter dropdown
  const flowerOptions = React.useMemo(() => {
    const source = selectedLocation ? reports : allReports;
    return Array.from(new Set(source.flatMap(r => r.flower_types)));
  }, [selectedLocation, reports, allReports]);

  // New state for location reports
  const [locationReports, setLocationReports] = useState<BloomReport[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationHasMore, setLocationHasMore] = useState(true);
  const [locationOffset, setLocationOffset] = useState(0);

  // Add state for selectedFlowers
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);

  // When flowersPerLocation changes, reset selectedFlowers to all
  useEffect(() => {
    if (flowersPerLocation && flowersPerLocation.length > 0) {
      setSelectedFlowers(flowersPerLocation.map(f => f.flower.id));
    }
  }, [flowersPerLocation]);

  // Ensure reports are fetched when selectedFlowers changes
  useEffect(() => {
    if (!selectedLocation) {
      setAllReports([]);
      setOffset(0);
      setHasMore(true);
      fetchReports(0, true);
    }
    // eslint-disable-next-line
  }, [orderBy, filterFlower, selectedFlowers]);

  useEffect(() => {
    if (selectedLocation) {
      setLocationReports([]);
      setLocationOffset(0);
      setLocationHasMore(true);
      fetchLocationReports(0, true);
    }
    // eslint-disable-next-line
  }, [selectedLocation, orderBy, filterFlower, selectedFlowers]);

  // Fetch reports with pagination
  const allFlowerIds = flowersPerLocation.map(f => f.flower.id);
  const selectedFlowerFilter = selectedFlowers.length === allFlowerIds.length ? undefined : selectedFlowers;

  const fetchReports = async (startOffset = 0, reset = false) => {
    setLoadingMore(true);
    try {
      const newReports = await bloomReportsService.getReportsWithPagination(
        startOffset,
        5,
        orderByField,
        filterFlower === '__all__' ? '' : filterFlower,
        selectedFlowerFilter
      );
      if (newReports.length < 5) {
        setHasMore(false);
      }
      setAllReports(prev => reset ? newReports : [...prev, ...newReports]);
      setOffset(prev => reset ? 5 : prev + 5);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load more reports with pagination
  const loadMoreReports = useCallback(async () => {
    if (loadingMore || !hasMore || selectedLocation) return;
    await fetchReports(offset);
  }, [offset, loadingMore, hasMore, selectedLocation]);

  // Initialize with first batch
  useEffect(() => {
    if (isOpen && !selectedLocation && allReports.length === 0) {
      fetchReports(0, true);
    }
    // eslint-disable-next-line
  }, [isOpen, selectedLocation]);

  // Fetch reports for selected location from DB when filter/order/selectedLocation changes
  const fetchLocationReports = async (startOffset = 0, reset = false) => {
    if (!selectedLocation) return;
    setLocationLoading(true);
    try {
      const newReports = await bloomReportsService.getReportsForLocationWithPagination(
        selectedLocation.location.id,
        startOffset,
        5,
        orderByField,
        filterFlower === '__all__' ? '' : filterFlower,
        selectedFlowerFilter
      );
      if (newReports.length < 5) {
        setLocationHasMore(false);
      }
      setLocationReports(prev => reset ? newReports : [...prev, ...newReports]);
      setLocationOffset(prev => reset ? 5 : prev + 5);
    } catch (error) {
      console.error('Error loading location reports:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const loadMoreLocationReports = useCallback(async () => {
    if (locationLoading || !locationHasMore || !selectedLocation) return;
    await fetchLocationReports(locationOffset);
  }, [locationOffset, locationLoading, locationHasMore, selectedLocation]);

  // Handle scroll to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (selectedLocation) {
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && locationHasMore && !locationLoading) {
        loadMoreLocationReports();
      }
    } else {
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loadingMore) {
        loadMoreReports();
      }
    }
  }, [hasMore, loadingMore, loadMoreReports, selectedLocation, locationHasMore, locationLoading, loadMoreLocationReports]);

  // For selectedLocation, use locationReports from DB; otherwise use allReports
  const displayedReports = selectedLocation
    ? locationReports
    : allReports;

  // Determine if any filters are active (not default)
  const filtersActive = (
    selectedFlowers.length !== allFlowerIds.length ||
    orderBy !== 'date' ||
    filterFlower !== '__all__'
  );

  const handleClearSelection = () => {
    setSelectedFlowers(allFlowerIds);
    setOrderBy('date');
    setFilterFlower('__all__');
  };

  const [allFlowers, setAllFlowers] = useState<Flower[]>([]);
  useEffect(() => {
    bloomReportsService.getFlowers().then(setAllFlowers);
  }, []);
  // Build flowerIdToName mapping from allFlowers array
  const flowerIdToName: Record<string, string> = allFlowers.reduce((acc, flower) => {
    acc[flower.id] = flower.name;
    return acc;
  }, {} as Record<string, string>);

  const computedSidebarMode = sidebarMode === 'info' ? 'info' : (selectedLocation ? 'location' : 'all');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
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
            {sidebarMode === 'info' ? (
              <div className="p-8 text-center text-gray-700">
                <h2 className="text-xl font-bold mb-4">מידע על הדף</h2>
                <p>כאן יוצג מידע על הדף, מטרותיו, והסבר קצר על השימוש במפה ובדיווחי הפריחה.</p>
              </div>
            ) : (
              <ReportsSection
                flowersPerLocation={computedSidebarMode === 'location' ? flowersPerLocation : []}
                isLoadingFlowers={flowersLoading}
                flowersError={flowersError}
                fetchReports={async ({ offset, reset, orderBy, filterFlower, selectedFlowers, fromDate }) => {
                  if (selectedLocation) {
                    return bloomReportsService.getReportsForLocationWithPagination(
                      selectedLocation.location.id,
                      offset,
                      5,
                      orderBy,
                      filterFlower,
                      selectedFlowers,
                      fromDate
                    );
                  } else {
                    return bloomReportsService.getReportsWithPagination(
                      offset,
                      5,
                      orderBy,
                      filterFlower,
                      selectedFlowers,
                      fromDate
                    );
                  }
                }}
                reports={selectedLocation ? locationReports : allReports}
                hasMore={selectedLocation ? locationHasMore : hasMore}
                loadingMore={selectedLocation ? locationLoading : loadingMore}
                sidebarMode={computedSidebarMode}
                locationName={selectedLocation ? selectedLocation.location.name : undefined}
                locationId={selectedLocation ? selectedLocation.location.id : undefined}
                flowerIdToName={flowerIdToName}
                allFlowers={allFlowers}
              />
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow text-right" dir="rtl">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={report.user.profile_photo_url || `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face`}
            alt={report.user.display_name}
            className="w-10 h-10 rounded-full border-2 border-purple-200"
          />
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-gray-800 mb-1 pr-1">{report.user.display_name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 pr-1">
              <Calendar className="h-4 w-4" />
              <span className="pr-1">{formatDate(report.post_date)}</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>{report.likes_count}</span>
            </div>
          </div>
        </div>

        <h4 className="font-medium text-gray-800 mb-2">{report.title}</h4>
        <p className="text-gray-700 text-sm mb-3">{report.description}</p>

        {/* Flower Types */}
        {report.flower_ids && report.flower_ids.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {report.flower_ids.map((flowerId, index) => (
              flowerIdToName[flowerId] ? (
                <Badge key={flowerId} className="bg-gradient-to-r from-green-100 to-purple-100 text-green-800">
                  {flowerIdToName[flowerId]}
                </Badge>
              ) : null
            ))}
          </div>
        ) : report.flower_types && report.flower_types.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {/* TODO: Remove flower_types after migration */}
            {report.flower_types.map((flower, index) => (
              <Badge key={flower} className="bg-gradient-to-r from-green-100 to-purple-100 text-green-800">
                {flower}
              </Badge>
            ))}
          </div>
        ) : null}
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
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
