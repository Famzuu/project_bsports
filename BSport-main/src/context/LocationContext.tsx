import React, { createContext, useContext, useEffect, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

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

  useEffect(() => {
    let watchId: number;

    const startWatching = async () => {
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await request(permission);

      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Izin Ditolak',
          'Aplikasi membutuhkan akses GPS untuk melacak rute.'
        );
        return;
      }

      watchId = Geolocation.watchPosition(
        position => {
          const acc = position.coords.accuracy;

          let status: GPSStatus = 'good';
          if (acc > 20) status = 'weak';

          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: acc,
            status,
          });
        },
        error => {
          console.log('GPS Error:', error);
          setLocation(prev => prev ? { ...prev, status: 'error' } : null);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 1,
          interval: 2000,
          fastestInterval: 1000,
        }
      );
    };

    startWatching();

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