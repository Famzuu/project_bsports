import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'TRACKING_DATA';

export type TrackingStorageType = {
  coords: any[];
  totalDistance: number;
  startTime: number | null;
};

export const saveTracking = async (data: TrackingStorageType) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
};

export const loadTracking = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
};

export const clearTracking = async () => {
  await AsyncStorage.removeItem(KEY);
};