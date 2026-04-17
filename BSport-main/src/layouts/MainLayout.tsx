import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ Import insets
import CustomTabBar from '../components/CustomTabBar';

export default function MainLayout({ children }: any) {
  // ✅ Ambil ukuran batas layar HP pengguna
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: '#FFFFFF', // Warna dasar background aplikasi
        paddingTop: insets.top,       // Bantalan dinamis untuk poni/kamera atas
        paddingBottom: insets.bottom  // Bantalan dinamis untuk tombol navigasi bawah
      }}
    >
      {/* CONTENT */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* GLOBAL TAB */}
      <CustomTabBar />
    </View>
  );
}