console.log('APP START');
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // ✅ Import SafeAreaProvider
import AppNavigator from './src/navigation/AppNavigator';
import TrackingOnboarding from './src/components/TrackingOnboarding';

// Import LocationProvider
import { LocationProvider } from './src/context/LocationContext';

console.log('APP START');

export default function App() {
  return (
    <SafeAreaProvider>
      <LocationProvider>
        <StatusBar translucent backgroundColor="transparent" />

        <AppNavigator />

        {/* 🔥 TARUH DI SINI */}
        <TrackingOnboarding />
      </LocationProvider>
    </SafeAreaProvider>
  );
}