import { create } from 'zustand';
import { TrackingState } from '../types/tracking';

export const useTrackingStore = create<TrackingState>(set => ({
  isTracking: false,
  isPaused: false,
  coords: [],
  startTime: null,
  pauseTime: null,
  totalPausedDuration: 0,

  // 🔥 TAMBAHAN
  activityId: null,

  setActivityId: (id: number) =>
    set({
      activityId: id,
    }),

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
      coords: [...state.coords.slice(-500), coord],
    })),

  resetTracking: () =>
    set({
      isTracking: false,
      isPaused: false,
      coords: [],
      startTime: null,
      pauseTime: null,
      totalPausedDuration: 0,
      activityId: null, // 🔥 WAJIB RESET
    }),
}));