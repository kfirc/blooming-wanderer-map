
import React from 'react';
import { X, Calendar, Heart, Camera, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BloomReport } from '../types/BloomReport';
import ImageGallery from './ImageGallery';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  reports: BloomReport[];
  selectedLocation: BloomReport | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, reports, selectedLocation }) => {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        ${!isOpen && !selectedLocation ? 'md:w-0 md:overflow-hidden' : ''}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedLocation ? 'פרטי מיקום' : 'דיווחי פריחה'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedLocation ? (
              /* Single Location View */
              <div className="p-4">
                <LocationCard report={selectedLocation} isDetailed={true} />
              </div>
            ) : (
              /* All Reports List */
              <div className="p-4 space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  מציג {reports.length} דיווחים מהשבוע האחרון
                </div>
                {reports.map((report) => (
                  <LocationCard key={report.id} report={report} isDetailed={false} />
                ))}
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
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={report.reporterPhoto} 
            alt={report.reporterName}
            className="w-10 h-10 rounded-full border-2 border-purple-200"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{report.reporterName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(report.postDate)}</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>{report.likes}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-3">{report.description}</p>

        {/* Flower Types */}
        <div className="flex flex-wrap gap-2 mb-3">
          {report.flowerTypes.map((flower, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gradient-to-r from-green-100 to-purple-100 text-green-800 text-xs rounded-full"
            >
              {flower}
            </span>
          ))}
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={report.images} isDetailed={isDetailed} />

      {/* Actions */}
      <div className="p-4 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Camera className="h-4 w-4" />
            <span>{report.images.length} תמונות</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {report.wazeUrl && (
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs"
                onClick={() => window.open(report.wazeUrl, '_blank')}
              >
                <Navigation className="h-3 w-3 mr-1" />
                Waze
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs"
              onClick={() => window.open('#', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              פייסבוק
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
