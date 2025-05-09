'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useResults } from '@/hooks/useResults';
import { useRun } from '@/hooks/useRuns';
import { ResultsTable } from '@/components/results-viewer/ResultsTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// New imports for SSE
import { useRunEvents, ScrapedRecordData, RunStatusData } from '@/hooks/useRunEvents';
import SseStatusDisplay from '@/components/ui/SseStatusDisplay';
import WarningBanner from '@/components/ui/WarningBanner';

// Define the Result type that ResultsTable expects and useResults provides in its `results` array.
export interface Result {
  id: number;
  run_id: number;
  data: ScrapedRecordData; 
  created_at: string;
}

// Define the shape returned by useResults hook
interface ResultsResponse {
  results: Result[];
  total: number;
  page: number;
  pageSize: number;
}

export default function ResultsViewerPage() {
  const { id } = useParams<{ id: string }>();
  const runId = parseInt(id as string, 10);
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  // New state to track if we're in "live view" mode (showing all SSE records) vs paginated mode
  const [isLiveViewMode, setIsLiveViewMode] = useState(true);
  
  // Fetch initial run data (still useful for project info, initial status before SSE connects)
  const { data: initialRunData, isLoading: isRunLoading, refetch: refetchRunData } = useRun(runId);
  
  // Fetch persisted results (paginated, useful for completed runs or initial view)
  const { 
    data: persistedResultsData, 
    isLoading: isPersistedResultsLoading,
    refetch: refetchPersistedResults,
  } = useResults(runId, page, pageSize) as { 
    data: ResultsResponse | undefined, 
    isLoading: boolean, 
    refetch: () => void 
  };

  // SSE Hook
  const {
    records: liveSseRecords,
    runStatus: liveSseRunStatus,
    totalRecordsInRun: totalRecordsFromSse,
    error: sseError,
    isConnected: isSseConnected,
  } = useRunEvents(runId);

  const [sseWarningDismissed, setSseWarningDismissed] = useState(false);

  // Determine the most current run status for display logic
  const currentRunDisplayStatus: RunStatusData | null = isSseConnected && liveSseRunStatus 
    ? liveSseRunStatus 
    : initialRunData?.status 
      ? { 
          status: initialRunData.status as RunStatusData['status'], 
          records_extracted: initialRunData.records_extracted || 0, 
          error: initialRunData.error 
        }
      : null;

  // Effect to automatically switch to live view mode when SSE is connected and run is active
  useEffect(() => {
    if (isSseConnected && liveSseRunStatus && 
        (liveSseRunStatus.status === 'running' || liveSseRunStatus.status === 'pending')) {
      setIsLiveViewMode(true);
    }
  }, [isSseConnected, liveSseRunStatus]);

  // Effect to switch to paginated view when run completes
  useEffect(() => {
    if (liveSseRunStatus?.status === 'completed' || liveSseRunStatus?.status === 'failed') {
      // Wait a moment after completion before switching to paginated view
      const timer = setTimeout(() => {
        setIsLiveViewMode(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [liveSseRunStatus?.status]);

  const recordsForTable: Result[] = useMemo(() => {
    // Helper function to safely access results array
    const getPersistedResults = (): Result[] => {
      if (!persistedResultsData) return [];
      if (!('results' in persistedResultsData)) return [];
      if (!Array.isArray(persistedResultsData.results)) return [];
      return persistedResultsData.results;
    };

    const transformSseRecordToResult = (record: ScrapedRecordData, index: number): Result => ({
      id: record.id || -(Date.now() + index),
      run_id: runId,
      data: record,
      created_at: record.extracted_at, 
    });

    // If in live view mode and SSE is connected with an active run
    if (isLiveViewMode && isSseConnected && liveSseRunStatus && 
        (liveSseRunStatus.status === 'running' || liveSseRunStatus.status === 'pending')) {
      return liveSseRecords.map(transformSseRecordToResult);
    }
    
    // If in live view mode and SSE has completed the run with all records
    if (isLiveViewMode && liveSseRunStatus?.status === 'completed' && 
        totalRecordsFromSse !== null && liveSseRecords.length === totalRecordsFromSse) {
      return liveSseRecords.map(transformSseRecordToResult);
    }
    
    // In all other cases (paginated mode or fallback), use persisted results
    return getPersistedResults();

  }, [isLiveViewMode, isSseConnected, liveSseRunStatus, liveSseRecords, persistedResultsData, totalRecordsFromSse, runId]);

  // Effect to refetch persisted data once SSE signals run completion or failure
  useEffect(() => {
    if (liveSseRunStatus?.status === 'completed' || liveSseRunStatus?.status === 'failed') {
      if (isSseConnected) { // Only refetch if this completion came from an active SSE connection
        console.log('SSE indicated run end state, refetching persisted data.');
        refetchPersistedResults();
        refetchRunData();
      }
    }
  }, [liveSseRunStatus?.status, isSseConnected, refetchPersistedResults, refetchRunData]);

  const handleRefresh = () => {
    console.log('Manual refresh triggered.');
    refetchPersistedResults();
    refetchRunData();
    // SSE hook handles its own connection logic based on runId
  };
  
  // Adjusted isLoading logic
  const isLoading = isRunLoading || 
                    (isPersistedResultsLoading && 
                        (!isSseConnected || 
                         (liveSseRunStatus?.status !== 'running' && liveSseRunStatus?.status !== 'pending')
                        )
                    );

  // Consolidate status display logic
  const displayStatusLabel = currentRunDisplayStatus?.status || initialRunData?.status || 'Loading...';
  const displayRecordsExtractedCount = currentRunDisplayStatus?.records_extracted ?? initialRunData?.records_extracted ?? 0;
  const displayUpdatedAtTime = initialRunData?.updated_at; // SSE doesn't provide this

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // If changing pages manually, switch to paginated mode
    setIsLiveViewMode(false);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
    setIsLiveViewMode(false);
  };

  const toggleViewMode = () => {
    setIsLiveViewMode(!isLiveViewMode);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/job-history" passHref>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to History
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {/* Use project_id to conditionally show more info, assuming project_name is not on Run type */}
            {initialRunData?.project_id ? `Results for Project Run #${runId}` : `Results for Run #${runId}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {displayStatusLabel && (
              <span className={`capitalize ${displayStatusLabel === 'completed' ? 'text-green-600' : displayStatusLabel === 'failed' ? 'text-red-600' : (displayStatusLabel === 'running' || displayStatusLabel === 'pending') ? 'text-amber-600' : 'text-gray-600'}`}>
                Status: {displayStatusLabel}
              </span>
            )}
            {typeof displayRecordsExtractedCount === 'number' && (
              <span className="ml-3">
                Records: {displayRecordsExtractedCount}
              </span>
            )}
            {displayUpdatedAtTime && (
              <span className="ml-3">
                Updated: {formatDistanceToNow(new Date(displayUpdatedAtTime), { addSuffix: true })}
              </span>
            )}
          </p>
        </div>
        
        <Button 
          onClick={handleRefresh}
          disabled={isLoading} // Disable if any relevant loading is true
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <WarningBanner 
        message={sseError}
        isVisible={!!sseError && !sseWarningDismissed}
        onDismiss={() => setSseWarningDismissed(true)}
      />

      <SseStatusDisplay 
        runStatus={liveSseRunStatus} 
        totalRecordsInRun={totalRecordsFromSse}
        isConnected={isSseConnected}
      />
      
      {initialRunData?.url && (
        <div className="bg-muted/50 p-3 rounded">
          <p className="text-sm font-medium">Source URL(s):</p>
          {Array.isArray(initialRunData.url) ? (
            initialRunData.url.map((u: string, index: number) => (
              <a key={index} href={u} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block">{u}</a>
            ))
          ) : (
            <a href={initialRunData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{initialRunData.url}</a>
          )}
        </div>
      )}
      
      <ResultsTable 
        results={recordsForTable} 
        isLoading={isLoading}
      />
      
      {/* View mode toggle and pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleViewMode}
            disabled={isLoading}
          >
            {isLiveViewMode ? "Switch to Paginated View" : "Switch to Live View"}
          </Button>
          
          {!isLiveViewMode && (
            <span className="text-sm text-muted-foreground">
              Showing page {page + 1} of {Math.ceil((persistedResultsData?.total || 0) / pageSize) || 1}
            </span>
          )}
          
          {isLiveViewMode && liveSseRecords.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Showing all {liveSseRecords.length} live records
            </span>
          )}
        </div>
        
        {/* Pagination controls - only shown in paginated mode */}
        {!isLiveViewMode && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0 || isLoading}
            >
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={(page + 1) * pageSize >= (persistedResultsData?.total || 0) || isLoading}
            >
              Next
            </Button>
            
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
              disabled={isLoading}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Message for when run is active but table is empty and not loading */}
      {(currentRunDisplayStatus?.status === 'running' || currentRunDisplayStatus?.status === 'pending') && recordsForTable.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-amber-600">
            The run is {currentRunDisplayStatus.status}. Waiting for results to stream in...
          </p>
          {(isSseConnected && (!liveSseRunStatus || !liveSseRunStatus.records_extracted)) && 
            <p className="text-sm text-muted-foreground mt-2">Live connection active, waiting for the first record...</p>}
        </div>
      )}
    </div>
  );
} 