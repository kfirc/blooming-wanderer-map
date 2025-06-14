
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowerPerLocation } from '../types/BloomReport';
import MonthlyIntensityChart from './MonthlyIntensityChart';

interface FlowerListItemProps {
  flowerData: FlowerPerLocation;
  onReaction: (flowerId: string, reactionType: 'like' | 'dislike') => void;
  reactions: {likes: number, dislikes: number, userReaction?: 'like' | 'dislike'};
}

const FlowerListItem: React.FC<FlowerListItemProps> = ({ 
  flowerData, 
  onReaction, 
  reactions 
}) => {
  const { flower } = flowerData;
  
  // Generate sample monthly data based on bloom season
  // This should ideally come from your database
  const generateMonthlyData = () => {
    const data = new Array(12).fill(0);
    if (flower.bloom_start_month && flower.bloom_end_month) {
      const start = flower.bloom_start_month - 1; // Convert to 0-based index
      const end = flower.bloom_end_month - 1;
      
      // Create intensity curve during bloom period
      for (let i = 0; i < 12; i++) {
        if (start <= end) {
          // Normal case (e.g., March to August)
          if (i >= start && i <= end) {
            const progress = (i - start) / (end - start);
            // Bell curve: peak in the middle of bloom season
            data[i] = Math.sin(progress * Math.PI) * flowerData.intensity;
          }
        } else {
          // Cross-year case (e.g., November to February)
          if (i >= start || i <= end) {
            let progress;
            if (i >= start) {
              progress = (i - start) / (12 - start + end + 1);
            } else {
              progress = (12 - start + i) / (12 - start + end + 1);
            }
            data[i] = Math.sin(progress * Math.PI) * flowerData.intensity;
          }
        }
      }
    }
    return data;
  };

  const monthlyData = generateMonthlyData();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {/* Flower Info */}
      <div className="flex items-center space-x-3">
        {flower.icon_url && (
          <img 
            src={flower.icon_url} 
            alt={flower.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{flower.name}</h4>
          {flower.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{flower.description}</p>
          )}
        </div>
      </div>

      {/* Monthly Intensity Chart */}
      <div className="flex justify-center">
        <MonthlyIntensityChart 
          monthlyData={monthlyData}
          bloomStartMonth={flower.bloom_start_month}
          bloomEndMonth={flower.bloom_end_month}
        />
      </div>

      {/* Reactions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            variant={reactions.userReaction === 'like' ? 'default' : 'outline'}
            onClick={() => onReaction(flower.id, 'like')}
            className="flex items-center space-x-1 text-xs"
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{reactions.likes}</span>
          </Button>
          
          <Button
            size="sm"
            variant={reactions.userReaction === 'dislike' ? 'destructive' : 'outline'}
            onClick={() => onReaction(flower.id, 'dislike')}
            className="flex items-center space-x-1 text-xs"
          >
            <ThumbsDown className="h-3 w-3" />
            <span>{reactions.dislikes}</span>
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          עוצמה: {Math.round(flowerData.intensity * 100)}%
        </div>
      </div>
    </div>
  );
};

export default FlowerListItem;
