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
  enabled?: boolean;
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
  enabled = true,
}: UseReportsDataProps): UseReportsDataReturn => {
  const [reports, setReports] = useState<BloomReport[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchReports = async (startOffset = 0, reset = false) => {
    if (!enabled) return;
    
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
    if (loadingMore || !hasMore || !enabled) return;
    await fetchReports(offset);
  }, [offset, loadingMore, hasMore, selectedLocationId, orderBy, filterFlower, selectedFlowers, dateRange, enabled]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setReports([]);
    setOffset(0);
    setHasMore(true);
    await fetchReports(0, true);
  }, [selectedLocationId, orderBy, filterFlower, selectedFlowers, dateRange, enabled]);

  // Reset and fetch when dependencies change, but only if enabled
  useEffect(() => {
    if (enabled) {
      refresh();
    } else {
      // Clear reports when disabled
      setReports([]);
      setOffset(0);
      setHasMore(true);
      setLoadingMore(false);
      setError(null);
    }
  }, [enabled, selectedLocationId, orderBy, filterFlower, selectedFlowers, dateRange]);

  return {
    reports,
    hasMore,
    loadingMore,
    error,
    loadMore,
    refresh,
  };
}; 