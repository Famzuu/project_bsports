export interface EventLeaderboardItem {
  rank: number;
  name: string;
  distance: number;
  duration: number;
  avg_pace: string;
  status: 'running' | 'finished';
}

export interface EventProgress {
  distance: number;
  duration: number;
  progress_percent: number;
  target_distance: number;
}

export interface EventParticipant {
  id: number;
  status_approval: 'pending' | 'approved' | 'rejected';

  user: {
    id: number;
    name: string;
    email: string;
  };
}