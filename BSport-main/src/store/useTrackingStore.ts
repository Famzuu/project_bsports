import { create } from 'zustand';
import { TrackingState } from '../types/tracking';

export const useTrackingStore = create<TrackingState>(set => ({
  isTracking: false,
  coords: [],
  startTime: null,

  startTracking: () =>
    set({
      isTracking: true,
      coords: [], // reset jalur
      startTime: Date.now(),
    }),

  stopTracking: () =>
    set({
      isTracking: false,
    }),

  addCoord: coord =>
    set(state => ({
      coords: [...state.coords, coord],
    })),
    
  // Di dalam implementasi set() Zustand Anda:
  resetTracking: () =>
    set({
      isTracking: false,
      coords: [], // Mengosongkan map & jarak
      startTime: null, // Mengosongkan timer utama
    }),

}));
