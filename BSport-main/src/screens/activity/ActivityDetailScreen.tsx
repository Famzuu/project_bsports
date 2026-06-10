import React, { useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, CircleUser, MapPin, Share2 } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'; // 🔥 IMPORT BOTTOM SHEET

import { RootStackParamList } from '../../navigation/AppNavigator';
import MapViewComponent from '../../components/MapViewComponent';
import { useAuthStore } from '../../store/useAuthStore';
import { darkTheme, lightTheme } from '../../context/ThemeContext';
import { ShareBottomSheet } from '../../components/ShareBottomSheet';

const { width, height } = Dimensions.get('window');

export default function ActivityDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);

  // Tangkap data
  const { activity, points } = route.params as any;
  const user = activity?.user;

  // Tema
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  // Bottom Sheet Refs & Snap Points
  const shareSheetRef = useRef<any>(null);
  const contentSheetRef = useRef<BottomSheet>(null);
  
  // 🔥 Tiga titik henti Bottom Sheet: Bawah (Map membesar), Tengah (Default), Atas (Full baca)
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Format Helper
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m ${s}s`;
  };

  const formatPace = (pace: number, distance: number) => {
    if (!pace || !distance || distance < 0.1) return '--:--';
    const m = Math.floor(pace / 60);
    const s = Math.floor(pace % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const dateObj = new Date(activity?.created_at || activity?.start_time);
  const dateString = Number.isNaN(dateObj.getTime())
    ? 'Waktu tidak diketahui'
    : dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const distance = Number(activity?.distance || 0);

  const shareData = {
    distance: `${distance.toFixed(2)} km`,
    duration: formatDuration(activity?.duration),
    average_pace: formatPace(activity?.pace, distance),
    points: points,
  };

  const handleOpenShare = () => {
    shareSheetRef.current?.present();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 🔥 1. MAP SEBAGAI BACKGROUND FULL SCREEN */}
      <View style={StyleSheet.absoluteFill}>
        {points && points.length > 1 ? (
          <MapViewComponent
            coords={points}
            isDark={isDarkMode}
            hasPermission={true}
            currentLocation={points[points.length - 1]}
          />
        ) : (
          <View style={[styles.noMap, { backgroundColor: THEME.BG }]}>
            <MapPin size={48} color={THEME.TEXT_SUB} opacity={0.3} />
            <Text style={{ color: THEME.TEXT_SUB, marginTop: 12, fontWeight: '500' }}>
              Rute GPS tidak tersedia
            </Text>
          </View>
        )}
      </View>

      {/* 🔥 2. FLOATING HEADER (Tetap di atas Map) */}
      <View style={[styles.floatingHeader, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circularBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circularBtn}
          activeOpacity={0.8}
          onPress={handleOpenShare}
        >
          <Share2 size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 🔥 3. MAIN CONTENT BOTTOM SHEET */}
      <BottomSheet
        ref={contentSheetRef}
        index={1} // Default berada di tengah (50%)
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: THEME.BG, borderRadius: 28 }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* User Info Row */}
          <View style={styles.userInfoRow}>
            <View style={styles.avatar}>
              {user?.foto_profil && user.foto_profil !== '' && !imageError ? (
                <Image
                  source={{ uri: user.foto_profil }}
                  style={styles.avatarImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <CircleUser size={46} color="#FFF" strokeWidth={1.5} />
              )}
            </View>
            <View style={styles.userTextCol}>
              <Text style={[styles.userName, { color: THEME.TEXT_MAIN }]}>
                {user?.name || "Atlet B'Sports"}
              </Text>
              <Text style={[styles.dateText, { color: THEME.TEXT_SUB }]}>
                {dateString}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.activityTitle, { color: THEME.TEXT_MAIN }]}>
            {activity?.title || 'Aktivitas Olahraga Pagi'}
          </Text>

          {/* 🔥 STATS ROW: EYE-CATCHING & MODERN */}
          <View style={styles.statsContainer}>
            {/* Jarak (Fokus Utama, Lebih Besar) */}
            <View style={styles.statBoxMain}>
              <Text style={[styles.statLabel, { color: THEME.TEXT_SUB }]}>JARAK</Text>
              <Text style={[styles.statValueGiant, { color: THEME.TEXT_MAIN }]}>
                {distance.toFixed(2)}
                <Text style={styles.statUnitMain}> km</Text>
              </Text>
            </View>

            <View style={styles.statsRowSecondary}>
              {/* Pace */}
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: THEME.TEXT_SUB }]}>PACE RATA-RATA</Text>
                <Text style={[styles.statValue, { color: THEME.TEXT_MAIN }]}>
                  {formatPace(activity?.pace, distance)}
                  <Text style={styles.statUnit}> /km</Text>
                </Text>
              </View>

              {/* Waktu */}
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: THEME.TEXT_SUB }]}>WAKTU AKTIF</Text>
                <Text style={[styles.statValue, { color: THEME.TEXT_MAIN }]}>
                  {formatDuration(activity?.duration)}
                </Text>
              </View>
            </View>
          </View>

          {/* Deskripsi */}
          {activity?.description && (
            <View style={[styles.descContainer, { backgroundColor: THEME.CARD }]}>
              <Text style={[styles.activityDesc, { color: THEME.TEXT_MAIN }]}>
                {activity.description}
              </Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Share Bottom Sheet */}
      <ShareBottomSheet ref={shareSheetRef} activityData={shareData} />
    </View>
  );
}

// 🔥 STYLING BARU: MODERN & EYE-CATCHING 🔥
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Latar belakang hitam untuk transisi halus
  },
  noMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Floating Header ---
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 100,
  },
  circularBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Efek kaca hitam
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // --- Bottom Sheet Content ---
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },

  // --- User Info ---
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'cover',
  },
  userTextCol: {
    marginLeft: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },

  // --- Typography ---
  activityTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  
  descContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FC6100', // Aksen orange B'Sports
  },
  activityDesc: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },

  // --- EYE CATCHING STATS ---
  statsContainer: {
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  
  // Box Utama (Jarak)
  statBoxMain: {
    marginBottom: 20,
  },
  statValueGiant: {
    fontSize: 56, // 🔥 Ukuran raksasa agar eye-catching
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
  },
  statUnitMain: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0,
  },

  // Box Sekunder (Pace & Waktu berdampingan)
  statsRowSecondary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statBox: {
    flex: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '500',
  },
});