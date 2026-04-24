export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

export interface TrackingState {
  isTracking: boolean;
  isPaused: boolean;
  coords: Coordinate[];
  startTime: number | null;
  pauseTime: number | null;
  totalPausedDuration: number;

  totalDistance: number; // 🔥 TAMBAHKAN

  activityId: number | null;

  setActivityId: (id: number) => void;

  startTracking: () => void;
  stopTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  addCoord: (coord: Coordinate) => void;
  resetTracking: () => void;
}