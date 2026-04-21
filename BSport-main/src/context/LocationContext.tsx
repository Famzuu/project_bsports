import React, { createContext, useContext, useEffect, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

type GPSStatus = 'searching' | 'good' | 'weak' | 'error';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  status: GPSStatus;
}

const LocationContext = createContext<LocationState | null>(null);

export const LocationProvider = ({ children }: any) => {
  const [location, setLocation] = useState<LocationState | null>(null);

  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const result = await request(permission);
    return result === RESULTS.GRANTED;
  };

  useEffect(() => {
    let watchId: number;

    const startGPS = async () => {
      const granted = await requestLocationPermission();

      if (!granted) {
        console.log('❌ Izin lokasi ditolak');
        return;
      }

      watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude, accuracy } = position.coords;

          let status: GPSStatus = 'searching';

          if (accuracy <= 15) status = 'good';
          else if (accuracy <= 40) status = 'weak';
          else status = 'weak'; // tetap weak, bukan searching

          setLocation({
            latitude,
            longitude,
            accuracy,
            status,
          });
        },
        error => {
          console.log('GPS ERROR:', error);
          setLocation(prev => (prev ? { ...prev, status: 'error' } : null));
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 3,
          interval: 4000,
          fastestInterval: 2000,
        },
      );
    };

    startGPS();

    return () => {
      if (watchId !== undefined) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
