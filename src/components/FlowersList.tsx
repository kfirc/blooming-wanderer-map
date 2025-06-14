import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bloomReportsService } from '../services/bloomReportsService';
import { Flower2, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SignalStrength from './SignalStrength';
import GlowingIcon from './GlowingIcon';
import MonthlyIntensityChart from './MonthlyIntensityChart';
import { Flower } from '../types/BloomReport';

interface FlowersListProps {
  locationId: string;
  locationName: string;
}

const FlowersList: React.FC<FlowersListProps> = ({ locationId, locationName }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reactingFlowers, setReactingFlowers] = useState<Set<string>>(new Set());
  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);

  const { data: flowers = [], isLoading, error } = useQuery({
    queryKey: ['flowers-per-location', locationId],
    queryFn: () => bloomReportsService.getFlowersForLocation(locationId),
    enabled: !!locationId,
  });

  // Fetch reactions for all flowers
  const { data: reactionsData = {} } = useQuery({
    queryKey: ['flower-reactions', locationId],
    queryFn: async () => {
      const reactions: Record<string, {likes: number, dislikes: number, userReaction?: 'like' | 'dislike'}> = {};
      for (const flowerData of flowers) {
        reactions[flowerData.flower.id] = await bloomReportsService.getFlowerReactions(flowerData.flower.id, locationId);
      }
      return reactions;
    },
    enabled: flowers.length > 0,
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ flowerId, reactionType }: { flowerId: string, reactionType: 'like' | 'dislike' }) => {
      await bloomReportsService.addFlowerReaction(flowerId, locationId, reactionType);
    },
    onMutate: ({ flowerId }) => {
      setReactingFlowers(prev => new Set(prev).add(flowerId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flower-reactions', locationId] });
      queryClient.invalidateQueries({ queryKey: ['flowers-per-location', locationId] });
      toast({
        title: "תגובה נשמרה",
        description: "תגובתך נשמרה בהצלחה!",
      });
    },
    onError: (error) => {
      console.error('Error submitting reaction:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת התגובה",
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      setReactingFlowers(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.flowerId);
        return newSet;
      });
    },
  });

  const handleReaction = (flowerId: string, reactionType: 'like' | 'dislike') => {
    reactionMutation.mutate({ flowerId, reactionType });
  };

  // Generate sample monthly data based on bloom season
  const generateMonthlyData = (flower: Flower, intensity: number) => {
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
            data[i] = Math.sin(progress * Math.PI) * intensity;
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
            data[i] = Math.sin(progress * Math.PI) * intensity;
          }
        }
      }
    }
    return data;
  };

  const formatBloomSeason = (flower: Flower) => {
    if (flower.bloom_start_month && flower.bloom_end_month) {
      const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
      ];
      
      const startMonth = monthNames[flower.bloom_start_month - 1];
      const endMonth = monthNames[flower.bloom_end_month - 1];
      
      if (flower.bloom_start_month === flower.bloom_end_month) {
        return startMonth;
      }
      return `${startMonth} - ${endMonth}`;
    }
    return flower.bloom_season;
  };

  const isFlowerInSeason = (flower: Flower) => {
    if (!flower.bloom_start_month || !flower.bloom_end_month) return false;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = now.getDate();
    
    // Simple check for bloom season
    if (flower.bloom_start_month <= flower.bloom_end_month) {
      // Same year blooming
      if (currentMonth >= flower.bloom_start_month && currentMonth <= flower.bloom_end_month) {
        // If we have specific days, check them too
        if (flower.bloom_start_day && flower.bloom_end_day) {
          if (currentMonth === flower.bloom_start_month && currentDay < flower.bloom_start_day) return false;
          if (currentMonth === flower.bloom_end_month && currentDay > flower.bloom_end_day) return false;
        }
        return true;
      }
    } else {
      // Cross-year blooming (e.g., November to March)
      if (currentMonth >= flower.bloom_start_month || currentMonth <= flower.bloom_end_month) {
        return true;
      }
    }
    
    return false;
  };

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

  // Find selected flower (default to first)
  const selectedFlowerData = flowers.find(f => f.flower.id === selectedFlowerId) || flowers[0];
  const selectedMonthlyData = selectedFlowerData ? generateMonthlyData(selectedFlowerData.flower, selectedFlowerData.intensity) : new Array(12).fill(0);

  return (
    <div className="p-4">
      {/* Single MonthlyIntensityChart at the top */}
      <div className="mb-6 flex justify-center">
        <MonthlyIntensityChart
          monthlyData={selectedMonthlyData}
          bloomStartMonth={selectedFlowerData?.flower.bloom_start_month}
          bloomEndMonth={selectedFlowerData?.flower.bloom_end_month}
        />
      </div>
      <div className="space-y-4">
        {flowers.map((flowerData) => {
          const reactions = reactionsData[flowerData.flower.id] || { likes: 0, dislikes: 0 };
          const isReacting = reactingFlowers.has(flowerData.flower.id);
          const inSeason = isFlowerInSeason(flowerData.flower);
          // const monthlyData = generateMonthlyData(flowerData.flower, flowerData.intensity); // No longer needed here

          return (
            <div
              key={flowerData.id}
              className={`p-3 bg-gray-50 rounded-lg border border-gray-200 text-right flex items-center gap-x-3 transition-colors duration-150 ${selectedFlowerId === flowerData.flower.id ? 'ring-2 ring-purple-400' : ''}`}
              onMouseEnter={() => setSelectedFlowerId(flowerData.flower.id)}
              onClick={() => setSelectedFlowerId(flowerData.flower.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Flower icon */}
              <div className="relative">
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
                <GlowingIcon
                  isInSeason={inSeason}
                  className="absolute -top-1 -right-1"
                />
              </div>
              {/* Flower name and in-season badge */}
              <div className="flex flex-col items-end flex-1 min-w-0">
                <span className="font-medium text-gray-800 truncate max-w-[120px]">{flowerData.flower.name}</span>
                {inSeason && (
                  <span className="text-xs text-green-600 font-medium">פורח כעת</span>
                )}
              </div>
              {/* Like/Dislike buttons */}
              <div className="flex flex-row-reverse items-center gap-x-2">
                <Button
                  variant={reactions.userReaction === 'like' ? 'default' : 'outline'}
                  size="sm"
                  onClick={e => { e.stopPropagation(); handleReaction(flowerData.flower.id, 'like'); }}
                  disabled={isReacting}
                  className="flex items-center space-x-1 text-xs"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>{reactions.likes}</span>
                </Button>
                <Button
                  variant={reactions.userReaction === 'dislike' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={e => { e.stopPropagation(); handleReaction(flowerData.flower.id, 'dislike'); }}
                  disabled={isReacting}
                  className="flex items-center space-x-1 text-xs"
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span>{reactions.dislikes}</span>
                </Button>
                {isReacting && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlowersList;
