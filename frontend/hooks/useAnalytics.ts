import { useCallback } from 'react';

// Event types that can be tracked
export type AnalyticsEventType = 
  | 'view_mode_switch'
  | 'sse_connection_error'
  | 'run_completed'
  | 'run_failed'
  | 'pagination_change'
  | 'search_performed'
  | 'manual_refresh';

interface AnalyticsEventData {
  [key: string]: any;
}

// In a real app, this would send events to your analytics platform 
// (Google Analytics, Mixpanel, PostHog, etc.)
const sendAnalyticsEvent = (
  eventType: AnalyticsEventType, 
  data: AnalyticsEventData
) => {
  // For development logging only
  console.log(`[Analytics] ${eventType}:`, data);
  
  // In production, replace this with your actual analytics implementation:
  /*
  if (process.env.NODE_ENV === 'production') {
    // Example for Segment/PostHog/etc.
    // window.analytics?.track(eventType, data);
    
    // Or Google Analytics 4
    // window.gtag?.('event', eventType, data);
  }
  */
};

export function useAnalytics() {
  // Track view mode changes (live view vs paginated)
  const trackViewModeSwitch = useCallback((isLiveMode: boolean) => {
    sendAnalyticsEvent('view_mode_switch', { 
      mode: isLiveMode ? 'live' : 'paginated',
      timestamp: new Date().toISOString()
    });
  }, []);

  // Track SSE connection errors
  const trackSseConnectionError = useCallback((errorMessage: string, runId: number) => {
    sendAnalyticsEvent('sse_connection_error', {
      runId,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Track run completion
  const trackRunCompleted = useCallback((
    runId: number, 
    recordCount: number, 
    durationMs: number
  ) => {
    sendAnalyticsEvent('run_completed', {
      runId,
      recordCount,
      durationMs,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Track run failures
  const trackRunFailed = useCallback((
    runId: number, 
    error: string,
    recordsExtracted: number
  ) => {
    sendAnalyticsEvent('run_failed', {
      runId,
      error,
      recordsExtracted,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Track pagination changes
  const trackPaginationChange = useCallback((
    page: number, 
    pageSize: number,
    totalRecords: number
  ) => {
    sendAnalyticsEvent('pagination_change', {
      page,
      pageSize,
      totalRecords,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Track search performed
  const trackSearchPerformed = useCallback((
    searchTerm: string, 
    resultCount: number
  ) => {
    sendAnalyticsEvent('search_performed', {
      searchTerm,
      resultCount,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Track manual refresh
  const trackManualRefresh = useCallback((runId: number) => {
    sendAnalyticsEvent('manual_refresh', {
      runId,
      timestamp: new Date().toISOString()
    });
  }, []);

  return {
    trackViewModeSwitch,
    trackSseConnectionError,
    trackRunCompleted,
    trackRunFailed,
    trackPaginationChange,
    trackSearchPerformed,
    trackManualRefresh
  };
} 