import api from '../api';

export const getRealtimeLeaderboard = async (eventId: number) => {
  const response = await api.get(`/events/${eventId}/realtime-leaderboard`);

  return response.data;
};

export const getMyProgress = async (eventId: number) => {
  const response = await api.get(`/events/${eventId}/my-progress`);

  return response.data?.data || null;
};

export const getParticipants = async (eventId: number) => {
  const response = await api.get(`/events/${eventId}/participants`);

  return response.data?.data || [];
};
