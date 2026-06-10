import { useEffect, useState } from 'react';

import { EventLeaderboardItem } from '../../../types/event';
import { getRealtimeLeaderboard } from '../../../services/event/eventService';

export default function useEventLeaderboard(eventId: number) {
  const [leaderboard, setLeaderboard] = useState<EventLeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const response = await getRealtimeLeaderboard(eventId);

      // 🔥 AMBIL ARRAY data
      setLeaderboard(response.data || []);
    } catch (err) {
      console.log('LEADERBOARD ERROR', err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLeaderboard(true);

    // 🔥 realtime lebih cepat
    const interval = setInterval(() => {
      fetchLeaderboard(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [eventId]);

  return {
    leaderboard,
    isLoading,
    refreshLeaderboard: fetchLeaderboard,
  };
}
