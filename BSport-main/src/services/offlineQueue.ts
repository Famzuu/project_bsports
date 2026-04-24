import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'OFFLINE_QUEUE';

export const addQueue = async (data: any) => {
  const existing = await AsyncStorage.getItem(KEY);
  const arr = existing ? JSON.parse(existing) : [];

  arr.push(data);

  await AsyncStorage.setItem(KEY, JSON.stringify(arr));
};

export const flushQueue = async () => {
  const existing = await AsyncStorage.getItem(KEY);
  if (!existing) return [];

  await AsyncStorage.removeItem(KEY);

  return JSON.parse(existing);
};