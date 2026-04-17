import { Linking, Platform } from 'react-native';

export const requestDisableBatteryOptimization = async () => {
  if (Platform.OS !== 'android') return;

  try {
    await Linking.openURL('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  } catch (error) {
    // fallback lebih proper
    try {
      await Linking.openSettings();
    } catch (fallbackError) {
      console.warn('Gagal membuka settings:', fallbackError);
    }
  }
};