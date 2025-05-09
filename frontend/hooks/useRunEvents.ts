import { useState, useEffect } from 'react';

// --- Type Definitions ---

// Matches the 'data' field of a 'record' event from the backend
export interface ScrapedRecordData {
  id?: number; // Assuming results might have an ID once persisted
  url: string;
  title: string;
  extracted_at: string; // ISO date string
  fields: Record<string, any>; // Arbitrary fields based on selector schema
  // Add any other fields that come with a record from your backend result structure
}

// Matches the 'data' field of a 'status' event
export interface RunStatusData {
  records_extracted: number;
  status: 'pending' | 'running' | 'completed' | 'failed'; // Or other statuses you use
  error?: string;       // If status is 'failed'
}

// Matches the 'data' field of a 'complete' event
export interface RunCompleteData {
  total_records: number;
  urls_processed: number;
}

// Describes the overall structure of an event coming from the SSE endpoint's message.data
// After JSON.parse(event.data) from the frontend EventSource
// This matches the 'payload' published by the worker to Redis.
// The SSE endpoint then takes this payload and uses its 'type' for event.type (e.g., eventSource.addEventListener('record', ...))
// and its 'data' for event.data (JSON stringified).

// SSE event structure as received by EventSource listeners like 'record', 'status', 'complete'
// where `event.data` (string) is JSON.parse-d into one of these
// e.g., const parsedData: ScrapedRecordData = JSON.parse(event.data) for 'record' type events.

// State managed by the hook
interface UseRunEventsState {
  records: ScrapedRecordData[];
  runStatus: RunStatusData | null;
  totalRecordsInRun: number | null;
  error: string | null;
  isConnected: boolean;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const useRunEvents = (runId: number | null) => {
  const [records, setRecords] = useState<ScrapedRecordData[]>([]);
  const [runStatus, setRunStatus] = useState<RunStatusData | null>(null);
  const [totalRecordsInRun, setTotalRecordsInRun] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!runId) {
      // Reset state if runId is null (e.g., initial load or error)
      setRecords([]);
      setRunStatus(null);
      setTotalRecordsInRun(null);
      setError(null);
      setIsConnected(false);
      return;
    }

    const eventSourceUrl = `${NEXT_PUBLIC_API_URL}/runs/${runId}/stream`;
    const source = new EventSource(eventSourceUrl);

    source.onopen = () => {
      console.log(`SSE connection opened for run ${runId} to ${eventSourceUrl}`);
      setIsConnected(true);
      setError(null);
      // Reset records for a new connection to avoid appending to old run's data if runId changes
      setRecords([]); 
      setRunStatus({ records_extracted: 0, status: 'pending' }); // Initial status
      setTotalRecordsInRun(null);
    };

    // Generic message handler (if backend sends untyped events)
    // source.onmessage = (event) => {
    //   console.log('Raw SSE Message:', event);
    //   try {
    //     const parsedEventData = JSON.parse(event.data);
    //     // This structure assumes the event.data itself contains { type: '...', data: ... }
    //     // which is slightly different from the named events below.
    //     // Adjust if your backend sends all data through onmessage with a type field.
    //     // if (parsedEventData.type === 'record') {
    //     //   setRecords((prevRecords) => [...prevRecords, parsedEventData.data as ScrapedRecordData]);
    //     // } else if (parsedEventData.type === 'status') {
    //     //   setRunStatus(parsedEventData.data as RunStatusData);
    //     // } else if (parsedEventData.type === 'complete') {
    //     //   setTotalRecordsInRun((parsedEventData.data as RunCompleteData).total_records);
    //     //   setRunStatus((prevStatus) => ({ ...prevStatus!, status: 'completed' }));
    //     //   source.close();
    //     // }
    //   } catch (e) {
    //     console.error('Failed to parse SSE event data:', e, event.data);
    //     setError('Failed to parse event data.');
    //   }
    // };
    
    // Using named events as per backend's sse-starlette yielding structure:
    // yield {"event": event_type, "data": json.dumps(data_dict)}

    source.addEventListener('record', (event) => {
      try {
        // console.log('SSE Record Event:', event);
        const newRecord = JSON.parse(event.data) as ScrapedRecordData;
        setRecords((prevRecords) => [...prevRecords, newRecord]);
        // Optionally update records_extracted in status if not done by a separate 'status' event
        setRunStatus((prevStatus) => ({
          ...(prevStatus ?? { records_extracted: 0, status: 'running' }), // Ensure prevStatus is not null
          records_extracted: (prevStatus?.records_extracted ?? 0) + 1,
          status: 'running', // Keep status as running while records arrive
        }));
      } catch (e) {
        console.error('Failed to parse record event data:', e, event.data);
        setError('Failed to parse record data.');
      }
    });

    source.addEventListener('status', (event) => {
      try {
        // console.log('SSE Status Event:', event);
        const statusUpdate = JSON.parse(event.data) as RunStatusData;
        setRunStatus(statusUpdate);
      } catch (e) {
        console.error('Failed to parse status event data:', e, event.data);
        setError('Failed to parse status data.');
      }
    });

    source.addEventListener('complete', (event) => {
      try {
        // console.log('SSE Complete Event:', event);
        const completionData = JSON.parse(event.data) as RunCompleteData;
        setTotalRecordsInRun(completionData.total_records);
        // Ensure status is updated to completed
        setRunStatus((prevStatus) => ({ 
            ...(prevStatus ?? { records_extracted: completionData.total_records, status: 'completed' }), 
            records_extracted: completionData.total_records, // Ensure this reflects the final count
            status: 'completed' 
        }));
        console.log(`SSE connection closing for run ${runId} due to 'complete' event.`);
        source.close();
        setIsConnected(false);
      } catch (e) {
        console.error('Failed to parse complete event data:', e, event.data);
        setError('Failed to parse completion data.');
        // Still close if there's a parse error on complete? Probably.
        source.close();
        setIsConnected(false);
      }
    });
    
    source.addEventListener('ping', (event) => {
      // console.log('SSE Ping:', event.data);
      // You can update a "last seen" timestamp here if needed
    });

    source.onerror = (err) => {
      console.error(`EventSource failed for run ${runId}:`, err);
      setError('Connection to real-time updates failed. Please refresh the page or check your network.');
      setIsConnected(false);
      source.close(); // Close on error
    };

    // Cleanup function
    return () => {
      console.log(`SSE connection cleanup for run ${runId}. Current state: ${source.readyState}`);
      if (source.readyState !== EventSource.CLOSED) {
        source.close();
        console.log(`SSE connection explicitly closed for run ${runId}.`);
      }
      setIsConnected(false);
    };
  }, [runId]); // Re-run effect if runId changes

  return { records, runStatus, totalRecordsInRun, error, isConnected };
}; 