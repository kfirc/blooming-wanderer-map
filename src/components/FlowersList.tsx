import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bloomReportsService } from '../services/bloomReportsService';
import { Flower2, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SignalStrength from './SignalStrength';
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

const FlowersList: React.FC<FlowersListProps> = ({ locationId, locationName, flowersPerLocation, isLoading, error, selectedFlowers, onFilterChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reactingFlowers, setReactingFlowers] = useState<Set<string>>(new Set());
  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);
  const [hoveredFlowerId, setHoveredFlowerId] = useState<string | null>(null);

  // Fetch reactions for all flowers
  const { data: reactionsData = {} } = useQuery({
    queryKey: ['flower-reactions', locationId],
    queryFn: async () => {
      const reactions: Record<string, {likes: number, dislikes: number, userReaction?: 'like' | 'dislike'}> = {};
      for (const flowerData of flowersPerLocation) {
        reactions[flowerData.flower.id] = await bloomReportsService.getFlowerReactions(flowerData.flower.id, locationId);
      }
      return reactions;
    },
    enabled: flowersPerLocation.length > 0,
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ flowerId, reactionType }: { flowerId: string, reactionType: 'like' | 'dislike' }) => {
      await bloomReportsService.addFlowerReaction(flowerId, locationId, reactionType);
    },
    onMutate: ({ flowerId, reactionType }) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ['flower-reactions', locationId],
        (oldData: Record<string, {likes: number, dislikes: number, userReaction?: 'like' | 'dislike'}> | undefined) => {
          if (!oldData) return oldData;
          const updated = { ...oldData };
          const prev = updated[flowerId];
          if (prev) {
            let likes = prev.likes;
            let dislikes = prev.dislikes;
            // Remove previous reaction
            if (prev.userReaction === 'like') likes = Math.max(0, likes - 1);
            if (prev.userReaction === 'dislike') dislikes = Math.max(0, dislikes - 1);
            // Add new reaction
            if (reactionType === 'like') likes += 1;
            if (reactionType === 'dislike') dislikes += 1;
            updated[flowerId] = {
              ...prev,
              likes,
              dislikes,
              userReaction: reactionType,
            };
          }
          return updated;
        }
      );
    },
    onError: (error, { flowerId, reactionType }, context) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['flower-reactions', locationId] });
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת התגובה",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers-per-location', locationId] });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async (flowerId: string) => {
      await bloomReportsService.removeFlowerReaction(flowerId, locationId);
    },
    onMutate: (flowerId) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ['flower-reactions', locationId],
        (oldData: Record<string, {likes: number, dislikes: number, userReaction?: 'like' | 'dislike'}> | undefined) => {
          if (!oldData) return oldData;
          const updated = { ...oldData };
          const prev = updated[flowerId];
          if (prev) {
            if (prev.userReaction === 'like') {
              updated[flowerId] = {
                ...prev,
                likes: Math.max(0, prev.likes - 1),
                userReaction: undefined,
              };
            } else if (prev.userReaction === 'dislike') {
              updated[flowerId] = {
                ...prev,
                dislikes: Math.max(0, prev.dislikes - 1),
                userReaction: undefined,
              };
            }
          }
          return updated;
        }
      );
    },
    onError: (error, flowerId, context) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['flower-reactions', locationId] });
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהסרת התגובה",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers-per-location', locationId] });
    },
  });

  const handleReaction = (flowerId: string, reactionType: 'like' | 'dislike') => {
    const currentReaction = reactionsData[flowerId]?.userReaction;
    if (currentReaction === reactionType) {
      removeReactionMutation.mutate(flowerId);
    } else {
      reactionMutation.mutate({ flowerId, reactionType });
    }
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

  // Handle selection logic
  const handleFlowerClick = (flowerId: string) => {
    let newSelected: string[];
    if (selectedFlowers.includes(flowerId)) {
      // Deselect
      newSelected = selectedFlowers.filter(id => id !== flowerId);
      // If all are deselected, revert to all selected
      if (newSelected.length === 0) {
        newSelected = flowersPerLocation.map(f => f.flower.id);
      }
    } else {
      // Select
      newSelected = [...selectedFlowers, flowerId];
    }
    onFilterChange(newSelected);
  };

  // Clear selection (select all)
  const handleClearSelection = () => {
    onFilterChange(flowersPerLocation.map(f => f.flower.id));
  };

  // Find the flower to show in the top chart
  const chartFlowerData = flowersPerLocation.find(f => f.flower.id === hoveredFlowerId) || flowersPerLocation[0];
  const chartMonthlyData = chartFlowerData ? generateMonthlyData(chartFlowerData.flower, chartFlowerData.intensity) : new Array(12).fill(0);

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

  if (flowersPerLocation.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        <Flower2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>אין מידע על פרחים במיקום זה</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Always show the intensity chart at the top */}
      <div className="mb-6 flex justify-center">
        <MonthlyIntensityChart
          monthlyData={chartMonthlyData}
          bloomStartMonth={chartFlowerData?.flower.bloom_start_month}
          bloomEndMonth={chartFlowerData?.flower.bloom_end_month}
        />
      </div>
      <div className="space-y-4">
        {flowersPerLocation.map((flowerData) => {
          const reactions = reactionsData[flowerData.flower.id] || { likes: 0, dislikes: 0 };
          const isSelected = selectedFlowers.includes(flowerData.flower.id);
          const inSeason = isFlowerInSeason(flowerData.flower);

          return (
            <div
              key={flowerData.id}
              className={`p-3 bg-gray-50 rounded-lg border border-gray-200 text-right flex items-center gap-x-3 transition-colors duration-150 cursor-pointer ${isSelected ? 'ring-2 ring-purple-400 bg-purple-50' : ''}`}
              onMouseEnter={() => setHoveredFlowerId(flowerData.flower.id)}
              onMouseLeave={() => setHoveredFlowerId(null)}
              onClick={() => handleFlowerClick(flowerData.flower.id)}
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
                  disabled={reactingFlowers.has(flowerData.flower.id)}
                  className="w-16 flex items-center text-xs h-9 px-3 border-0 box-border outline-none focus:outline-none active:outline-none focus:ring-0 focus:ring-offset-0 active:ring-0 active:ring-offset-0"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>{reactions.likes}</span>
                </Button>
                <Button
                  variant={reactions.userReaction === 'dislike' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={e => { e.stopPropagation(); handleReaction(flowerData.flower.id, 'dislike'); }}
                  disabled={reactingFlowers.has(flowerData.flower.id)}
                  className="w-16 flex items-center text-xs h-9 px-3 border-0 box-border outline-none focus:outline-none active:outline-none focus:ring-0 focus:ring-offset-0 active:ring-0 active:ring-offset-0"
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span>{reactions.dislikes}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlowersList;
