
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bloomReportsService } from '../services/bloomReportsService';
import { Flower2, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FlowersListProps {
  locationId: string;
  locationName: string;
}

const FlowersList: React.FC<FlowersListProps> = ({ locationId, locationName }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reactingFlowers, setReactingFlowers] = useState<Set<string>>(new Set());

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
    onSettled: ({ flowerId }) => {
      setReactingFlowers(prev => {
        const newSet = new Set(prev);
        newSet.delete(flowerId);
        return newSet;
      });
    },
  });

  const handleReaction = (flowerId: string, reactionType: 'like' | 'dislike') => {
    reactionMutation.mutate({ flowerId, reactionType });
  };

  const formatBloomSeason = (flower: any) => {
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
        {flowers.map((flowerData) => {
          const reactions = reactionsData[flowerData.flower.id] || { likes: 0, dislikes: 0 };
          const isReacting = reactingFlowers.has(flowerData.flower.id);
          
          return (
            <div 
              key={flowerData.id} 
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
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
                    {formatBloomSeason(flowerData.flower) && (
                      <p className="text-xs text-purple-600">{formatBloomSeason(flowerData.flower)}</p>
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

              {/* Reaction buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={reactions.userReaction === 'like' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleReaction(flowerData.flower.id, 'like')}
                    disabled={isReacting}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{reactions.likes}</span>
                  </Button>
                  
                  <Button
                    variant={reactions.userReaction === 'dislike' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => handleReaction(flowerData.flower.id, 'dislike')}
                    disabled={isReacting}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span>{reactions.dislikes}</span>
                  </Button>
                </div>
                
                {isReacting && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
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
