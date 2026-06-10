import { useEffect, useState } from 'react';

import { EventProgress } from '../../../types/event';
import { getMyProgress } from '../../../services/event/eventService';

export default function useEventProgress(eventId: number) {
  const [progress, setProgress] = useState<EventProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgress = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const data = await getMyProgress(eventId);

      setProgress(data);
    } catch (err) {
      console.log('PROGRESS ERROR', err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProgress(true);

    const interval = setInterval(() => {
      fetchProgress(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId]);

  return {
    progress,
    isLoading,
    refreshProgress: fetchProgress,
  };
}
