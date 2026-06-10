import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import AppNavigator from './src/navigation/AppNavigator';
import TrackingOnboarding from './src/components/TrackingOnboarding';
import { LocationProvider } from './src/context/LocationContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <LocationProvider>

            <StatusBar barStyle="light-content" />

            <AppNavigator />

            <TrackingOnboarding />

          </LocationProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}