import Geolocation from 'react-native-geolocation-service';

let watchId: number | null = null;

export const startGPS = (onUpdate: (coord: any) => void) => {
  if (watchId !== null) return;

  watchId = Geolocation.watchPosition(
    position => {
      // 🔥 FILTER GPS JELEK
      if (position.coords.accuracy > 20) return;

      const coord = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now(),
      };

      onUpdate(coord);
    },
    error => console.log('GPS error:', error),
    {
      enableHighAccuracy: true,
      distanceFilter: 2, // Update setiap user bergerak minimal 2 meter
      interval: 3000,
      fastestInterval: 2000,
      showsBackgroundLocationIndicator: true, // Wajib untuk iOS Background
    },
  );
};

export const stopGPS = () => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
};
