import React from 'react';
import { Progress } from '@/components/ui/progress';
import { RunStatusData } from '@/hooks/useRunEvents';

interface SseStatusDisplayProps {
  runStatus: RunStatusData | null;
  totalRecordsInRun: number | null;
  isConnected: boolean;
}

const SseStatusDisplay: React.FC<SseStatusDisplayProps> = ({ runStatus, totalRecordsInRun, isConnected }) => {
  // If there's no status information at all, and we are not connected, it might be too early to show anything.
  // However, the hook initializes status on open, so runStatus should ideally not be null if isConnected is true or was true.
  if (!runStatus) {
    if (isConnected) {
        // Connected but no status message yet (e.g. pending initial status event after open)
        return (
            <div className="my-4 p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
                <p className="text-sm text-muted-foreground">Initializing live updates...</p>
            </div>
        );
    }
    // Not connected and no status ever received, or runId was null.
    // Depending on page context, this might be an error state or initial state before runId is known.
    // For now, returning null, page can decide to show a general loader or message.
    return null; 
  }

  const recordsExtracted = runStatus.records_extracted;
  const currentStatus = runStatus.status;
  let progressPercentage = 0;
  let statusText = '';

  if (totalRecordsInRun && totalRecordsInRun > 0) {
    progressPercentage = Math.min((recordsExtracted / totalRecordsInRun) * 100, 100);
  }

  if (currentStatus === 'failed') {
    statusText = `Failed${runStatus.error ? ": " + runStatus.error : ""}`;
  } else if (currentStatus === 'completed') {
    statusText = `Completed: ${recordsExtracted} records extracted.`;
  } else if (currentStatus === 'running') {
    statusText = `Running: ${recordsExtracted}${totalRecordsInRun ? ` / ${totalRecordsInRun}` : ''} records extracted...`;
  } else if (currentStatus === 'pending') {
    statusText = 'Pending: Waiting for the run to start processing...';
  }

  const showProgress = (currentStatus === 'running' || currentStatus === 'completed') && totalRecordsInRun !== null && totalRecordsInRun > 0;
  const showIndeterminateProgressText = (currentStatus === 'running' || currentStatus === 'pending') && (totalRecordsInRun === null || totalRecordsInRun === 0);
  const showReconnectMessage = !isConnected && (currentStatus === 'pending' || currentStatus === 'running');

  return (
    <div className="my-4 p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Live Run Status</h3>
        <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${currentStatus === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : currentStatus === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : currentStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
          {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : (isConnected ? 'Initializing' : 'N/A')}
        </span>
      </div>
      {showProgress && (
        <Progress value={progressPercentage} className="w-full h-2.5 mb-2 rounded-full" />
      )}
      {showIndeterminateProgressText && (
         <p className="text-sm text-muted-foreground">
            {currentStatus === 'pending' && recordsExtracted === 0 ? "Waiting for first record..." : `Extracting records... (Total will be available upon completion)`}
        </p>
      )
      }
      <p className="text-sm text-muted-foreground mt-1">{statusText}</p>
      {showReconnectMessage && (
        <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">Connection to live updates lost. Attempting to reconnect...</p>
      )}
      {!isConnected && currentStatus !== 'completed' && currentStatus !== 'failed' && !showReconnectMessage && (
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Live updates disconnected.</p>
      )}
    </div>
  );
};

export default SseStatusDisplay; 