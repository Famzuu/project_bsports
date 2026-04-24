import { create } from 'zustand';
import { TrackingState } from '../types/tracking';
import { saveTracking } from '../services/trackingStorage';

export const useTrackingStore = create<TrackingState>(set => ({
  isTracking: false,
  isPaused: false,
  coords: [],
  startTime: null,
  pauseTime: null,
  totalPausedDuration: 0,
  totalDistance: 0,

  // 🔥 TAMBAHAN
  activityId: null,

  setActivityId: (id: number) =>
    set({
      activityId: id,
    }),

  startTracking: () =>
  set(state => ({
    isTracking: true,
    isPaused: false,
    coords: [],
    startTime: state.startTime || Date.now(), // 🔥 FIX
    pauseTime: null,
    totalPausedDuration: 0,
    totalDistance: 0,
  })),

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
    set(state => {
      if (!state.isTracking || state.isPaused) return state;

      const last = state.coords[state.coords.length - 1];

      // 🔥 titik pertama
      if (!last) {
        const newCoords = [coord];

        saveTracking({
          coords: newCoords,
          totalDistance: 0,
          startTime: state.startTime, // 🔥 TAMBAH INI
        });

        return {
          ...state,
          coords: newCoords,
          totalDistance: 0,
        };
      }

      const toRad = (v: number) => (v * Math.PI) / 180;

      const R = 6371000;
      const dLat = toRad(coord.latitude - last.latitude);
      const dLon = toRad(coord.longitude - last.longitude);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(last.latitude)) *
          Math.cos(toRad(coord.latitude)) *
          Math.sin(dLon / 2) ** 2;

      const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

      // 🔥 FILTER NOISE
      if (distance < 3) return state;
      if (distance > 100) return state;

      // 🔥 FILTER SPEED ANEH
      const timeDiff =
        ((coord.timestamp || Date.now()) - (last.timestamp || Date.now())) /
        1000;

      const speed = distance / timeDiff;

      if (speed > 10) return state; // >36 km/h

      const newCoords = [...state.coords.slice(-500), coord];
      const newDistance = state.totalDistance + distance / 1000;

      // 🔥 SAVE KE STORAGE
      saveTracking({
        coords: newCoords,
        totalDistance: newDistance,
        startTime: state.startTime, // 🔥 WAJIB
      });

      return {
        ...state,
        coords: newCoords,
        totalDistance: newDistance,
      };
    }),

  resetTracking: () =>
    set({
      isTracking: false,
      isPaused: false,
      coords: [],
      startTime: null,
      pauseTime: null,
      totalPausedDuration: 0,
      totalDistance: 0, // 🔥 WAJIB
      activityId: null,
    }),
}));
