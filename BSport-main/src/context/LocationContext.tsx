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

  const requestLocationPermission = async () => {
    try {
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await request(permission);
      
      // Jika di-allow, kembalikan true
      if (result === RESULTS.GRANTED) {
        return true;
      }

      // Jika ditolak, beri tahu user
      Alert.alert(
        'Izin Ditolak',
        'Aplikasi membutuhkan akses GPS untuk melacak rute lari Anda.'
      );
      return false;
    } catch (err) {
      console.warn('Error saat request permission:', err);
      return false;
    }
  };

  const fetchInitialLocation = async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) return;

    // 🔥 Tembak GPS setelah izin dipastikan didapat
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          status: 'good',
        });
      },
      error => {
        console.log('Error Initial GPS:', error);
        // Coba lagi jika error (misal GPS baru dinyalakan user)
        setTimeout(fetchInitialLocation, 3000); 
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 // Gunakan cache 10 detik agar lebih cepat
      }
    );
  };

  useEffect(() => {
    fetchInitialLocation();
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);