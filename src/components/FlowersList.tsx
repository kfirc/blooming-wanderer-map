
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { bloomReportsService } from '../services/bloomReportsService';
import { Flower2, Loader2 } from 'lucide-react';

interface FlowersListProps {
  locationId: string;
  locationName: string;
}

const FlowersList: React.FC<FlowersListProps> = ({ locationId, locationName }) => {
  const { data: flowers = [], isLoading, error } = useQuery({
    queryKey: ['flowers-per-location', locationId],
    queryFn: () => bloomReportsService.getFlowersForLocation(locationId),
    enabled: !!locationId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">טוען פרחים...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>שגיאה בטעינת פרחים</p>
      </div>
    );
  }

  if (flowers.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        <Flower2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>אין מידע על פרחים במיקום זה</p>
      </div>
    );
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity > 0.7) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getIntensityText = (intensity: number) => {
    if (intensity > 0.7) return 'עזה';
    if (intensity > 0.4) return 'בינונית';
    return 'חלשה';
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{locationName}</h3>
        <p className="text-sm text-gray-600">פרחים פורחים כעת</p>
      </div>
      
      <div className="space-y-3">
        {flowers.map((flowerData) => (
          <div 
            key={flowerData.id} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              {flowerData.flower.icon_url ? (
                <img 
                  src={flowerData.flower.icon_url} 
                  alt={flowerData.flower.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-purple-400 flex items-center justify-center">
                  <Flower2 className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-800">{flowerData.flower.name}</h4>
                {flowerData.flower.description && (
                  <p className="text-xs text-gray-600">{flowerData.flower.description}</p>
                )}
                {flowerData.flower.bloom_season && (
                  <p className="text-xs text-purple-600">{flowerData.flower.bloom_season}</p>
                )}
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full ${getIntensityColor(flowerData.intensity)}`}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {getIntensityText(flowerData.intensity)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(flowerData.intensity * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowersList;
