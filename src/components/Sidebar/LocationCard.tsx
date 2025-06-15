import React from 'react';
import { Calendar, Heart, Camera } from 'lucide-react';
import { BloomReport } from '@/types/BloomReport';
import { Badge } from '@/components/ui/badge';
import ImageGallery from '@/components/ImageGallery';
import { useDateFormatter } from '@/hooks/useDateFormatter';

interface LocationCardProps {
  report: BloomReport;
  isDetailed: boolean;
  flowerIdToName?: Record<string, string>;
}

export const LocationCard: React.FC<LocationCardProps> = ({ 
  report, 
  isDetailed, 
  flowerIdToName = {} 
}) => {
  const { formatDate } = useDateFormatter();

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
            {report.flower_ids.map((flowerId) => (
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
            {report.flower_types.map((flower) => (
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