import React, { createContext, useContext, useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { useAuthStore } from '../store/useAuthStore';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

const LocationContext = createContext<any>(null);

export const LocationProvider = ({ children }: any) => {
  const [location, setLocation] = useState<any>(null);
  const token = useAuthStore(state => state.token);
  const requestLocationPermission = async () => {
  let permission;

  if (Platform.OS === 'android') {
    permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  } else {
    permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  }

  const result = await request(permission);

  return result === RESULTS.GRANTED;
};



useEffect(() => {
  if (!token) return; // ❌ kalau belum login, jangan jalan

  let watchId: number | null = null;

  const startGPS = async () => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    console.log('❌ Izin lokasi ditolak');
    return;
  }

  // lanjut GPS
  Geolocation.getCurrentPosition(
    position => {
      console.log('⚡ FAST GPS:', position.coords);
      setLocation(position.coords);
    },
    error => {
      console.log('FAST GPS ERROR:', error);
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 20000,
    },
  );

  watchId = Geolocation.watchPosition(
    position => {
      console.log('🎯 GPS UPDATE:', position.coords);
      setLocation(position.coords);
    },
    error => {
      console.log('GPS ERROR:', error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 2,
      interval: 5000,
      fastestInterval: 2000,
    },
  );
};

  startGPS();

  return () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
    }
  };
}, [token]); // 🔥 penting

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);