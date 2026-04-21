import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';
import CustomTabBar from '../components/CustomTabBar';

export default function MainLayout({ children }: any) {
  const insets = useSafeAreaInsets();

  const routeName = useNavigationState(
    state => state?.routes[state.index]?.name,
  );

  const hideTabBar = routeName === 'Tracking';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* CONTENT */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* GLOBAL TAB */}
      {!hideTabBar && <CustomTabBar />}
    </View>
  );
}
