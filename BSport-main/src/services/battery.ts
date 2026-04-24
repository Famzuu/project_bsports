import { Linking, Platform } from 'react-native';

export const requestDisableBatteryOptimization = async () => {
  if (Platform.OS !== 'android') return;

  try {
    await Linking.openURL(
      'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
    );
  } catch {
    await Linking.openSettings();
  }
};