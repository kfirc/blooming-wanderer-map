import React, { useState, useEffect } from 'react';
import { Calendar, Heart } from 'lucide-react';
import { BloomReport, FlowerPerLocation, Flower } from '../types/BloomReport';
import FlowersList from './FlowersList';
import LocationOrderSelect from './LocationOrderSelect';
import LocationFlowerFilter from './LocationFlowerFilter';
import ImageGallery from './ImageGallery';
import { Badge } from './ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { useDateFormatter } from '../hooks/useDateFormatter';
import './ReportsSection.css';

interface ReportsSectionProps {
  flowersPerLocation: FlowerPerLocation[];
  isLoadingFlowers: boolean;
  flowersError: unknown;
  reports: BloomReport[];
  hasMore: boolean;
  loadingMore: boolean;
  sidebarMode: 'location' | 'info' | 'all';
  locationName?: string;
  locationId?: string;
  flowerIdToName: Record<string, string>;
  allFlowers: Flower[];
  // Filter props from parent
  orderBy: 'date' | 'likes';
  filterFlower: string;
  selectedFlowers: string[];
  dateFilter: string;
  filtersActive: boolean;
  onOrderByChange: (value: 'date' | 'likes') => void;
  onFilterFlowerChange: (value: string) => void;
  onSelectedFlowersChange: (value: string[]) => void;
  onDateFilterChange: (value: string) => void;
  onClearFilters: () => void;
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
  reports,
  hasMore,
  loadingMore,
  sidebarMode,
  locationName,
  locationId,
  flowerIdToName,
  allFlowers,
  // Filter props
  orderBy,
  filterFlower,
  selectedFlowers,
  dateFilter,
  filtersActive,
  onOrderByChange,
  onFilterFlowerChange,
  onSelectedFlowersChange,
  onDateFilterChange,
  onClearFilters,
}) => {
  const { formatDate } = useDateFormatter();
  const [visibleReports, setVisibleReports] = useState<Set<string>>(new Set());

  // Animate reports as they appear
  useEffect(() => {
    if (reports.length === 0) {
      setVisibleReports(new Set());
      return;
    }

    // Clear visible reports when reports change (new filter/location)
    setVisibleReports(new Set());

    // Stagger the animation of each report
    reports.forEach((report, index) => {
      setTimeout(() => {
        setVisibleReports(prev => new Set([...prev, report.id]));
      }, index * 100); // 100ms delay between each report
    });
  }, [reports]);

  // Compute all flower IDs
  const allFlowerIds = flowersPerLocation.map(f => f.flower.id);

  const handleClearSelection = () => {
    onClearFilters();
  };

  // Note: Scroll handling and data fetching is now managed by parent component

  // Compute flower options for filter
  const flowerOptions = React.useMemo(() => {
    if (sidebarMode === 'location') {
      return Array.from(new Set(flowersPerLocation.map(r => ({ id: r.flower.id, name: r.flower.name }))));
    } else {
      return allFlowers.map(f => ({ id: f.id, name: f.name }));
    }
  }, [flowersPerLocation, allFlowers, sidebarMode]);

  return (
    <div className="p-4 border-t border-gray-200 flex-1 flex flex-col overflow-y-auto">
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
            onFilterChange={onSelectedFlowersChange}
          />
          <div className="border-t border-gray-200 my-2" />
        </>
      )}
      {/* Filters: Now below the flower list */}
      <div className="flex flex-row items-center justify-between mb-4 pt-4 pb-2">
        {/* Clear Filters Button on the left */}
        {filtersActive ? (
          <button onClick={handleClearSelection} className="px-3 py-2 rounded-full bg-purple-100 text-purple-700 text-sm h-12">נקה</button>
        ) : (
          <div></div>
        )}
        {/* Filters on the right */}
        <div className="flex flex-row items-center gap-1" dir="rtl">
          <div className="w-24">
            <LocationOrderSelect 
              value={orderBy} 
              onChange={onOrderByChange} 
              selectClassName={`rounded px-2 py-1 text-sm w-24 ${orderBy !== 'date' ? 'border-0 bg-purple-50 focus:ring-0 focus:outline-none' : 'border border-input'}`} 
            />
          </div>
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className={`rounded px-2 py-1 text-sm w-24 ${dateFilter !== 'all' ? 'border-0 bg-purple-50 focus:ring-0 focus:outline-none' : 'border border-input'}`}>
              <SelectValue placeholder="תמיד" />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTERS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sidebarMode !== 'location' && (
            <LocationFlowerFilter 
              value={filterFlower} 
              onChange={onFilterFlowerChange} 
              options={flowerOptions} 
              className={`rounded px-2 py-1 text-sm w-24 ${filterFlower !== '__all__' ? 'border-0 bg-purple-50 focus:ring-0 focus:outline-none' : 'border border-input'}`} 
            />
          )}
        </div>
      </div>
      {/* Reports List */}
      {reports.length === 0 && !loadingMore ? (
        <div className="text-center py-4 text-gray-500 text-sm">לא נמצאו דיווחים</div>
      ) : (
        <div className="reports-container space-y-4">
          {reports.map((report, idx) => (
            <div 
              key={report.id} 
              className={`report-item bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 text-right ${
                visibleReports.has(report.id) ? 'report-visible' : 'report-hidden'
              }`}
              dir="rtl"
              style={{
                transitionDelay: `${idx * 50}ms` // Additional stagger for hover effects
              }}
            >
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
      {loadingMore && reports.length > 0 && (
        <div className="text-center py-4 text-gray-500 loading-more">
          טוען עוד דיווחים...
        </div>
      )}
      {!hasMore && reports.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          הוצגו כל הדיווחים
        </div>
      )}
    </div>
  );
};

export default ReportsSection; 