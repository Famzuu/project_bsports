export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

export interface TrackingState {
  isTracking: boolean;
  coords: Coordinate[];
  startTime: number | null;

  startTracking: () => void;
  stopTracking: () => void;
  addCoord: (coord: Coordinate) => void;
  resetTracking: () => void; // 
}