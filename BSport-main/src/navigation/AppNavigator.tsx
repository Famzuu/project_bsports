import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens - Main
import HomeScreen from '../screens/dashboard/HomeScreen';
import TrackingScreen from '../screens/tracking/TrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MainLayout from '../layouts/MainLayout';
import SaveActivityScreen from '../screens/tracking/SaveActivityScreen';

// Import Screens - Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Import Brankas Token
import { useAuthStore } from '../store/useAuthStore';

import AdminEventList from '../screens/admin/AdminEventList';
import AdminCreateEvent from '../screens/admin/AdminCreateEvent';
import AdminParticipants from '../screens/admin/AdminParticipants';
import SplashScreen from '../screens/SplashScreen';

// Type Definitions
export type RootTabParamList = {
  Home: undefined;
  Tracking: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;

  AdminEventList: undefined;
  AdminCreateEvent: undefined;
  AdminParticipants: { eventId: number };

  SaveActivityScreen: { activityId: number }; // 🔥 TAMBAHKAN
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// HOC untuk Main Layout
function withLayout(Component: any) {
  return function WrappedScreen(props: any) {
    return (
      <MainLayout>
        <Component {...props} />
      </MainLayout>
    );
  };
}

// Pisahkan Tab Navigator menjadi komponen tersendiri
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={withLayout(HomeScreen)} />
      <Tab.Screen name="Tracking" component={withLayout(TrackingScreen)} />
      <Tab.Screen name="Profile" component={withLayout(ProfileScreen)} />
    </Tab.Navigator>
  );
}

// Navigasi Utama: Penjaga Gerbang Aplikasi
// Navigasi Utama: Penjaga Gerbang Aplikasi
export default function AppNavigator() {
  const { token, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <SplashScreen />; // 🔥 kunci utama
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="AdminEventList" component={AdminEventList} />
            <Stack.Screen
              name="AdminCreateEvent"
              component={AdminCreateEvent}
            />
            <Stack.Screen
              name="AdminParticipants"
              component={AdminParticipants}
            />
            <Stack.Screen
              name="SaveActivityScreen"
              component={SaveActivityScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
