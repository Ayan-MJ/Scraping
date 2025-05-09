import { useState, useEffect, useRef } from 'react';

interface HighlightedItem {
  id: number;
  timestamp: number;
}

/**
 * Hook to manage highlighting newly added items in a list
 * @param duration Duration of highlight animation in milliseconds
 * @returns Object with methods to manage highlights
 */
export function useHighlightAnimation(duration = 2000) {
  // Store IDs of items to highlight with their timestamp
  const [highlightedItems, setHighlightedItems] = useState<HighlightedItem[]>([]);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add an item to the highlighted items list
  const highlightItem = (id: number) => {
    setHighlightedItems(prev => [
      ...prev.filter(item => item.id !== id), // Remove if already highlighted
      { id, timestamp: Date.now() }
    ]);
  };

  // Highlight multiple items at once
  const highlightItems = (ids: number[]) => {
    const timestamp = Date.now();
    setHighlightedItems(prev => [
      ...prev.filter(item => !ids.includes(item.id)), // Remove existing highlights
      ...ids.map(id => ({ id, timestamp }))
    ]);
  };

  // Check if an item should be highlighted
  const isHighlighted = (id: number) => {
    return highlightedItems.some(item => item.id === id);
  };

  // Clean up expired highlights
  useEffect(() => {
    if (highlightedItems.length > 0) {
      // Clear any existing timer
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }

      // Set a timer to clean up expired highlights
      cleanupTimerRef.current = setTimeout(() => {
        const now = Date.now();
        setHighlightedItems(prev => 
          prev.filter(item => now - item.timestamp < duration)
        );
        cleanupTimerRef.current = null;
      }, duration);
    }

    // Clean up on unmount
    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
  }, [highlightedItems, duration]);

  return {
    highlightItem,
    highlightItems,
    isHighlighted
  };
} 