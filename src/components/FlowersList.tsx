import React, { useState, useEffect } from 'react';
import { Flower2 } from 'lucide-react';
import GlowingIcon from './GlowingIcon';
import MonthlyIntensityChart from './MonthlyIntensityChart';
import { Flower, FlowerPerLocation } from '../types/BloomReport';

interface FlowersListProps {
  locationId: string;
  locationName: string;
  flowersPerLocation: FlowerPerLocation[];
  isLoading: boolean;
  error: unknown;
  selectedFlowers: string[];
  onFilterChange: (selected: string[]) => void;
}

/**
 * Creates curved text SVG for flower names (adapted from MarkerIcon)
 * Positioned closer to flower icon with proper curved arc
 */
const createFlowerTextSVG = (flowerName: string): string => {
  // Create unique ID for each flower to avoid conflicts
  const uniqueId = `flowerArc-${flowerName.replace(/\s+/g, '-').toLowerCase()}`;
  
  return `
    <svg width="90" height="35" viewBox="0 0 90 35" style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); pointer-events: none; transition: all 0.3s ease;">
      <defs>
        <path id="${uniqueId}" d="M 15,25 Q 45,10 75,25" fill="none" />
      </defs>
              <text font-size="11" font-weight="bold" fill="black" text-anchor="start" font-family="Helvetica" stroke="white" stroke-width="2" paint-order="stroke">
          <textPath href="#${uniqueId}" startOffset="60%">
            ${flowerName}
          </textPath>
        </text>
        <text font-size="11" font-weight="bold" fill="black" text-anchor="start" font-family="Helvetica">
          <textPath href="#${uniqueId}" startOffset="60%">
            ${flowerName}
          </textPath>
        </text>
    </svg>
  `;
};

const FlowersList: React.FC<FlowersListProps> = ({ 
  locationId, 
  locationName, 
  flowersPerLocation, 
  isLoading, 
  error, 
  selectedFlowers, 
  onFilterChange 
}) => {
  const [hoveredFlowerId, setHoveredFlowerId] = useState<string | null>(null);

  // Generate sample monthly data based on bloom season (simplified version)
  const generateMonthlyData = (flower: Flower, intensity: number) => {
    const data = new Array(12).fill(0);
    if (flower.bloom_start_month && flower.bloom_end_month) {
      const start = flower.bloom_start_month - 1;
      const end = flower.bloom_end_month - 1;
      
      for (let i = 0; i < 12; i++) {
        if (start <= end) {
          if (i >= start && i <= end) {
            const progress = (i - start) / (end - start);
            data[i] = Math.sin(progress * Math.PI) * intensity;
          }
        } else {
          if (i >= start || i <= end) {
            let progress;
            if (i >= start) {
              progress = (i - start) / (12 - start + end + 1);
            } else {
              progress = (12 - start + i) / (12 - start + end + 1);
            }
            data[i] = Math.sin(progress * Math.PI) * intensity;
          }
        }
      }
    }
    return data;
  };

  const isFlowerInSeason = (flower: Flower) => {
    if (!flower.bloom_start_month || !flower.bloom_end_month) return false;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    
    if (flower.bloom_start_month <= flower.bloom_end_month) {
      return currentMonth >= flower.bloom_start_month && currentMonth <= flower.bloom_end_month;
    } else {
      return currentMonth >= flower.bloom_start_month || currentMonth <= flower.bloom_end_month;
    }
  };

  // Handle selection logic (unchanged from original)
  const handleFlowerClick = (flowerId: string) => {
    const allFlowerIds = flowersPerLocation.map(f => f.flower.id);
    const allSelected = allFlowerIds.length === selectedFlowers.length && 
                       allFlowerIds.every(id => selectedFlowers.includes(id));
    
    let newSelected: string[];
    
    if (allSelected) {
      newSelected = [flowerId];
    } else if (selectedFlowers.includes(flowerId)) {
      newSelected = selectedFlowers.filter(id => id !== flowerId);
      if (newSelected.length === 0) {
        newSelected = allFlowerIds;
      }
    } else {
      newSelected = [...selectedFlowers, flowerId];
    }
    onFilterChange(newSelected);
  };

  // Find the flower to show in the top chart
  const chartFlowerData = flowersPerLocation.find(f => f.flower.id === hoveredFlowerId) || flowersPerLocation[0];
  const chartMonthlyData = chartFlowerData ? generateMonthlyData(chartFlowerData.flower, chartFlowerData.intensity) : new Array(12).fill(0);

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>שגיאה בטעינת פרחים</p>
      </div>
    );
  }

  if (flowersPerLocation.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        <Flower2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>אין מידע על פרחים במיקום זה</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      {/* Always show the intensity chart at the top */}
      <div className="mb-10 flex justify-center">
        <MonthlyIntensityChart
          monthlyData={chartMonthlyData}
          bloomStartMonth={chartFlowerData?.flower.bloom_start_month}
          bloomEndMonth={chartFlowerData?.flower.bloom_end_month}
        />
      </div>
      
      {/* Redesigned flower grid with wrapping rows */}
      <div className="flex flex-wrap gap-8 justify-center">
        {flowersPerLocation.map((flowerData) => {
          const isSelected = selectedFlowers.includes(flowerData.flower.id);
          const inSeason = isFlowerInSeason(flowerData.flower);

          return (
            <div
              key={flowerData.id}
              className="relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105"
              onMouseEnter={() => setHoveredFlowerId(flowerData.flower.id)}
              onMouseLeave={() => setHoveredFlowerId(null)}
              onClick={() => handleFlowerClick(flowerData.flower.id)}
            >
              {/* Curved text label above flower icon */}
              <div 
                className="relative mb-2"
                dangerouslySetInnerHTML={{ __html: createFlowerTextSVG(flowerData.flower.name) }}
              />
              
              {/* Flower icon container with selection circle */}
              <div className={`relative transition-all duration-300 ${isSelected ? 'ring-4 ring-purple-400 ring-offset-2' : ''} rounded-full`}>
                <div className="relative">
                  {flowerData.flower.icon_url ? (
                    <img
                      src={flowerData.flower.icon_url}
                      alt={flowerData.flower.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-purple-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-purple-400 flex items-center justify-center shadow-lg">
                      <Flower2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                  
                  {/* In-season glowing indicator */}
                  <GlowingIcon
                    isInSeason={inSeason}
                    className="absolute -top-1 -right-1"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlowersList;
