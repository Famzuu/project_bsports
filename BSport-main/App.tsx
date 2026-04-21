console.log('APP START');
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // ✅ Import SafeAreaProvider
import AppNavigator from './src/navigation/AppNavigator';

// Import LocationProvider
import { LocationProvider } from './src/context/LocationContext';

console.log('APP START');

export default function App() {
  console.log('APP INIT'); // 🔥 TARUH DI SINI
  return (
    // ✅ Bungkus seluruh aplikasi (terluar) dengan SafeAreaProvider
    <SafeAreaProvider>
      <LocationProvider>
        {/* Atur StatusBar agar transparan dan menembus ke atas (translucent) */}
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <AppNavigator />
      </LocationProvider>
    </SafeAreaProvider>
  );
}