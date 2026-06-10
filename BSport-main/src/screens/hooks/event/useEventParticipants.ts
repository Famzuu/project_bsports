import { useEffect, useMemo, useState } from 'react';

import { EventParticipant } from '../../../types/event';
import { getParticipants } from '../../../services/event/eventService';

export default function useEventParticipants(
  eventId: number,
  enabled: boolean,
) {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  const fetchParticipants = async () => {
    try {
      const data = await getParticipants(eventId);

      setParticipants(data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    fetchParticipants();
  }, [eventId, enabled]);

  const approvedCount = useMemo(() => {
    return participants.filter(p => p.status_approval === 'approved').length;
  }, [participants]);

  return {
    participants,
    approvedCount,
    isLoading,
    refreshParticipants: fetchParticipants,
  };
}
