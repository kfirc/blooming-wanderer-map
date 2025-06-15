import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Heart, Camera, Loader2 } from 'lucide-react';
import { BloomReport, FlowerPerLocation, Flower } from '../types/BloomReport';
import FlowersList from './FlowersList';
import LocationOrderSelect from './LocationOrderSelect';
import LocationFlowerFilter from './LocationFlowerFilter';
import ImageGallery from './ImageGallery';
import { Badge } from './ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from './ui/drawer';

interface ReportsSectionProps {
  flowersPerLocation: FlowerPerLocation[];
  isLoadingFlowers: boolean;
  flowersError: unknown;
  fetchReports: (args: { offset: number, reset: boolean, orderBy: string, filterFlower: string, selectedFlowers?: string[], fromDate?: string }) => Promise<BloomReport[]>;
  reports: BloomReport[];
  hasMore: boolean;
  loadingMore: boolean;
  sidebarMode: 'location' | 'info' | 'all';
  locationName?: string;
  locationId?: string;
  flowerIdToName: Record<string, string>;
  allFlowers: Flower[];
}

const DATE_FILTERS = [
  { label: 'היום', value: 'today' },
  { label: 'השבוע', value: 'week' },
  { label: 'החודש', value: 'month' },
  { label: 'השנה', value: 'year' },
  { label: 'תמיד', value: 'all' },
];

const ReportsSection: React.FC<ReportsSectionProps> = ({
  flowersPerLocation,
  isLoadingFlowers,
  flowersError,
  fetchReports,
  reports,
  hasMore,
  loadingMore,
  sidebarMode,
  locationName,
  locationId,
  flowerIdToName,
  allFlowers,
}) => {
  // Filter state
  const [orderBy, setOrderBy] = useState<'date' | 'likes'>('date');
  const [filterFlower, setFilterFlower] = useState<string>('__all__');
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [internalHasMore, setInternalHasMore] = useState(hasMore);
  const [internalLoadingMore, setInternalLoadingMore] = useState(loadingMore);
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Compute all flower IDs
  const allFlowerIds = flowersPerLocation.map(f => f.flower.id);

  // Reset selectedFlowers when flowersPerLocation changes
  useEffect(() => {
    if (flowersPerLocation && flowersPerLocation.length > 0) {
      setSelectedFlowers(flowersPerLocation.map(f => f.flower.id));
    }
  }, [flowersPerLocation]);

  // Determine if any filters are active (not default)
  const filtersActive = (
    selectedFlowers.length !== allFlowerIds.length ||
    orderBy !== 'date' ||
    filterFlower !== '__all__' ||
    dateFilter !== 'all'
  );

  const handleClearSelection = () => {
    setOrderBy('date');
    setFilterFlower('__all__');
    setDateFilter('all');
    if (sidebarMode === 'location') {
      setSelectedFlowers(allFlowerIds);
    } else {
      setSelectedFlowers([]);
    }
  };

  // Compute date range for filter
  const getDateRange = () => {
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
  };

  // Fetch reports when filters change
  useEffect(() => {
    setOffset(0);
    setInternalHasMore(true);
    fetchMoreReports(0, true);
    // eslint-disable-next-line
  }, [orderBy, filterFlower, selectedFlowers, dateFilter]);

  // In ReportsSection, map orderBy UI value to DB value before calling fetchReports
  const orderByField = orderBy === 'date' ? 'post_date' : 'likes_count';

  const fetchMoreReports = useCallback(async (startOffset = 0, reset = false) => {
    setInternalLoadingMore(true);
    const selectedFlowerFilter = selectedFlowers.length === allFlowerIds.length ? undefined : selectedFlowers;
    const fromDate = getDateRange();
    try {
      const newReports = await fetchReports({
        offset: startOffset,
        reset,
        orderBy: orderByField,
        filterFlower: filterFlower === '__all__' ? '' : filterFlower,
        selectedFlowers: selectedFlowerFilter,
        fromDate: fromDate ? fromDate.toISOString() : undefined,
      });
      if (newReports.length < 5) {
        setInternalHasMore(false);
      }
      setOffset(prev => reset ? 5 : prev + 5);
    } catch (error) {
      // handle error
    } finally {
      setInternalLoadingMore(false);
    }
  }, [orderByField, filterFlower, selectedFlowers, fetchReports, allFlowerIds, dateFilter]);

  // Handle scroll to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && internalHasMore && !internalLoadingMore) {
      fetchMoreReports(offset);
    }
  }, [offset, internalHasMore, internalLoadingMore, fetchMoreReports]);

  // Compute flower options for filter
  const flowerOptions = React.useMemo(() => {
    if (sidebarMode === 'location') {
      return Array.from(new Set(flowersPerLocation.map(r => ({ id: r.flower.id, name: r.flower.name }))));
    } else {
      return allFlowers.map(f => ({ id: f.id, name: f.name }));
    }
  }, [flowersPerLocation, allFlowers, sidebarMode]);

  // Add formatDate function for human-readable dates
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

  return (
    <div className="p-4 border-t border-gray-200 flex-1 flex flex-col overflow-y-auto" onScroll={handleScroll}>
      {/* Flower List */}
      {sidebarMode === 'location' && (
        <>
          <FlowersList
            locationId={locationId || ''}
            locationName={locationName || ''}
            flowersPerLocation={flowersPerLocation}
            isLoading={isLoadingFlowers}
            error={flowersError}
            selectedFlowers={selectedFlowers}
            onFilterChange={setSelectedFlowers}
          />
          <div className="border-t border-gray-200 my-2" />
        </>
      )}
      {/* Filters: Now below the flower list */}
      <div className="flex flex-row items-center gap-3 mb-4 pt-4 pb-2 justify-end" dir="rtl">
        {/* Clear Filters Button on the left (visually) */}
        {filtersActive && (
          <button onClick={handleClearSelection} className="px-3 py-2 rounded-full bg-purple-100 text-purple-700 text-sm h-12">נקה</button>
        )}
        {/* Filters */}
        <div className="flex flex-row items-center gap-1">
          <div className="w-24">
            <LocationOrderSelect value={orderBy} onChange={setOrderBy} selectClassName="border rounded px-2 py-1 text-sm w-24" />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="border rounded px-2 py-1 text-sm w-24">
              <SelectValue placeholder="תמיד" />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTERS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sidebarMode !== 'location' && (
            <LocationFlowerFilter value={filterFlower} onChange={setFilterFlower} options={flowerOptions} className="w-24" />
          )}
        </div>
      </div>
      {/* Reports List */}
      {reports.length === 0 && !loadingMore ? (
        <div className="text-center text-gray-500 py-8">לא נמצאו דיווחים</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, idx) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow text-right" dir="rtl">
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
              {report.images && report.images.length > 0 && (
                <ImageGallery images={report.images} isDetailed={true} />
              )}
              {/* Actions, etc. can be added here */}
            </div>
          ))}
        </div>
      )}
      {internalLoadingMore && reports.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          טוען עוד דיווחים...
        </div>
      )}
      {!internalHasMore && reports.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          הוצגו כל הדיווחים
        </div>
      )}
    </div>
  );
};

export default ReportsSection; 