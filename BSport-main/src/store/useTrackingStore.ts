import { create } from 'zustand';
import { TrackingState } from '../types/tracking';

export const useTrackingStore = create<TrackingState>(set => ({
  isTracking: false,
  isPaused: false,
  coords: [],
  startTime: null,
  pauseTime: null,
  totalPausedDuration: 0,

  startTracking: () =>
    set({
      isTracking: true,
      isPaused: false,
      coords: [],
      startTime: Date.now(),
      pauseTime: null,
      totalPausedDuration: 0,
    }),

  stopTracking: () =>
    set({
      isTracking: false,
      isPaused: false,
    }),

  pauseTracking: () =>
    set({
      isPaused: true,
      pauseTime: Date.now(),
    }),

  resumeTracking: () =>
    set(state => ({
      isPaused: false,
      pauseTime: null,
      totalPausedDuration:
        state.totalPausedDuration +
        (Date.now() - (state.pauseTime || Date.now())),
    })),

  addCoord: coord =>
    set(state => ({
      coords: [...state.coords, coord],
    })),

  resetTracking: () =>
    set({
      isTracking: false,
      isPaused: false,
      coords: [],
      startTime: null,
      pauseTime: null,
      totalPausedDuration: 0,
    }),
}));
