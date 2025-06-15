import { useState, useEffect, useCallback } from 'react';
import { BloomReport } from '@/types/BloomReport';
import { bloomReportsService } from '@/services/bloomReportsService';

export interface UseReportsDataProps {
  selectedLocationId?: string;
  orderBy: 'post_date' | 'likes_count';
  filterFlower: string;
  selectedFlowers?: string[];
  dateRange?: Date | null;
  pageSize?: number;
}

export interface UseReportsDataReturn {
  reports: BloomReport[];
  hasMore: boolean;
  loadingMore: boolean;
  error: unknown;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useReportsData = ({
  selectedLocationId,
  orderBy,
  filterFlower,
  selectedFlowers,
  dateRange,
  pageSize = 5,
}: UseReportsDataProps): UseReportsDataReturn => {
  const [reports, setReports] = useState<BloomReport[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchReports = async (startOffset = 0, reset = false) => {
    setLoadingMore(true);
    setError(null);
    
    try {
      const newReports = selectedLocationId
        ? await bloomReportsService.getReportsForLocationWithPagination(
            selectedLocationId,
            startOffset,
            pageSize,
            orderBy,
            filterFlower === '__all__' ? '' : filterFlower,
            selectedFlowers,
            dateRange ? dateRange.toISOString() : undefined
          )
        : await bloomReportsService.getReportsWithPagination(
            startOffset,
            pageSize,
            orderBy,
            filterFlower === '__all__' ? '' : filterFlower,
            selectedFlowers,
            dateRange ? dateRange.toISOString() : undefined
          );

      if (newReports.length < pageSize) {
        setHasMore(false);
      }

      setReports(prev => reset ? newReports : [...prev, ...newReports]);
      setOffset(prev => reset ? pageSize : prev + pageSize);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchReports(offset);
  }, [offset, loadingMore, hasMore, selectedLocationId, orderBy, filterFlower, selectedFlowers, dateRange]);

  const refresh = useCallback(async () => {
    setReports([]);
    setOffset(0);
    setHasMore(true);
    await fetchReports(0, true);
  }, [selectedLocationId, orderBy, filterFlower, selectedFlowers, dateRange]);

  // Reset and fetch when dependencies change
  useEffect(() => {
    refresh();
  }, [selectedLocationId, orderBy, filterFlower, selectedFlowers, dateRange]);

  return {
    reports,
    hasMore,
    loadingMore,
    error,
    loadMore,
    refresh,
  };
}; 