import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sleep = (time: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), time));

export const trackingTask = async () => {
  while (BackgroundService.isRunning()) {
    try {
    console.log('Tracking jalan:', Date.now());
      await new Promise<void>((resolve) => {
        Geolocation.getCurrentPosition(
          async position => {
            const coord = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: Date.now(),
            };

            const existing = await AsyncStorage.getItem('tracking_coords');
            const coords = existing ? JSON.parse(existing) : [];

            coords.push(coord);

            await AsyncStorage.setItem(
              'tracking_coords',
              JSON.stringify(coords)
            );

            resolve();
          },
          error => {
            console.log('GPS error:', error);
            resolve();
          },
          {
            enableHighAccuracy: true,
            distanceFilter: 5,
          }
        );
      });

      await sleep(3000);
    } catch (e) {
      console.log('Tracking error:', e);
    }
  }
};

export const startTrackingService = async () => {
  if (BackgroundService.isRunning()) return;

  await BackgroundService.start(trackingTask, {
    taskName: 'Tracking Aktif',
    taskTitle: 'Tracking sedang berjalan',
    taskDesc: 'Aplikasi sedang merekam aktivitas Anda',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    parameters: {},
  });
};

export const stopTrackingService = async () => {
  if (!BackgroundService.isRunning()) return;

  await BackgroundService.stop();
};