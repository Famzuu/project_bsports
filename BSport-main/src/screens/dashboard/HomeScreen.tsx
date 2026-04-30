import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  StyleSheet,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Calendar, Search, Activity, Flame, Timer, Play, MapPin,
  CircleUser, Footprints,
} from 'lucide-react-native';

import api from '../../services/api';
import { RootTabParamList } from '../../navigation/AppNavigator';

// Import Map & Utils
import MapViewComponent from '../../components/MapViewComponent';
import { formatTime } from '../../utils/trackingMath';

const { width } = Dimensions.get('window');
type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [latestActivity, setLatestActivity] = useState<any>(null);

  // ==========================================
  // FORMATTING (PACE)
  // ==========================================
  const formatPace = (pace: number, distance?: number) => {
    if (!pace || !distance) return '--:--';
    if (distance < 0.1) return '--:--';
    if (pace < 30 || pace > 1800) return '--:--';

    const m = Math.floor(pace / 60);
    const s = pace % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // FETCH LOGIC
  // ==========================================
  const fetchLatestActivity = async () => {
    try {
      const response = await api.get('/activities');
      if (response.data?.data && response.data.data.length > 0) {
        setLatestActivity(response.data.data[0]);
      } else {
        setLatestActivity(null);
      }
    } catch (error) {
      console.log('Error fetching activity:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLatestActivity();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLatestActivity();
    setRefreshing(false);
  }, []);

  const renderBanner = () => {
    const banners = [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop'
    ];

    return (
      <View style={localStyles.bannerContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingHorizontal: 16 }}
        >
          {banners.map((img, index) => (
            <View key={index} style={localStyles.bannerWrapper}>
              <Image source={{ uri: img }} style={localStyles.bannerImage} />
              <View style={localStyles.bannerOverlay}>
                <Text style={localStyles.bannerTitle}>B'Sports Virtual Run 2026</Text>
                <Text style={localStyles.bannerSubtitle}>Daftar sekarang dan menangkan medali eksklusif!</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderQuickMenus = () => {
    const menus = [
      { id: 1, name: 'Profile', icon: CircleUser, color: '#F8AD3C', route: 'Profile' },
      { id: 2, name: 'History', icon: Activity, color: '#EF4444', route: 'HistoryScreen' },
      { id: 3, name: 'Events', icon: Calendar, color: '#10B981', route: 'EventScreen' },
      { id: 4, name: 'Tracking', icon: Play, color: '#3B82F6', route: 'Tracking' },
    ];

    return (
      <View style={localStyles.menuGrid}>
        {menus.map((menu) => {
          const IconComponent = menu.icon;
          return (
            <TouchableOpacity 
              key={menu.id} 
              style={localStyles.menuItem}
              onPress={() => navigation.navigate(menu.route as any)}
              activeOpacity={0.7}
            >
              <View style={[localStyles.menuIconWrapper, { backgroundColor: `${menu.color}15` }]}>
                <IconComponent size={28} color={menu.color} strokeWidth={2.5} />
              </View>
              <Text style={localStyles.menuText}>{menu.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDailyDashboard = () => (
    <View style={localStyles.dashboardWrapper}>
      <Text style={localStyles.sectionTitle}>Ringkasan Hari Ini</Text>
      <View style={localStyles.dashboardGrid}>
        <TouchableOpacity style={localStyles.mainDashboardCard}>
          <View style={localStyles.dashboardIconBg}>
            <MapPin size={22} color="#F8AD3C" />
          </View>
          <Text style={localStyles.dashboardValue}>
            12.4 <Text style={localStyles.dashboardUnit}>km</Text>
          </Text>
          <Text style={localStyles.dashboardLabel}>Total Jarak</Text>
        </TouchableOpacity>

        <View style={localStyles.dashboardSubGrid}>
          <View style={localStyles.subDashboardCard}>
            <Flame size={18} color="#EF4444" />
            <View>
              <Text style={localStyles.subDashboardValue}>840</Text>
              <Text style={localStyles.subDashboardLabel}>Kcal Terbakar</Text>
            </View>
          </View>
          <View style={localStyles.subDashboardCard}>
            <Timer size={18} color="#0284C7" />
            <View>
              <Text style={localStyles.subDashboardValue}>1h 20m</Text>
              <Text style={localStyles.subDashboardLabel}>Waktu Aktif</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // ==========================================
  // LOGIKA POLYLINE FILTER
  // ==========================================
  let validPoints: [number, number][] = []; 
  let activityDistance = 0;

  if (latestActivity) {
    activityDistance = Number(latestActivity.distance || latestActivity.total_distance || 0);

    if (latestActivity.points) {
      validPoints = latestActivity.points
        .map((p: any) => [
          Number(p.longitude || p.lng),
          Number(p.latitude || p.lat),
        ] as [number, number]) // 🔥 TAMBAHKAN "as [number, number]" DI SINI
        .filter((coord: [number, number]) => {
          const isInvalid = isNaN(coord[0]) || isNaN(coord[1]);
          const isNullIsland = Math.abs(coord[0]) < 1 && Math.abs(coord[1]) < 1;
          return !isInvalid && !isNullIsland;
        });
    }
  }

  return (
    <View style={localStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={localStyles.header}>
        <View>
          <Text style={localStyles.headerGreeting}>Halo, Sporty!</Text>
          <Text style={localStyles.headerTitle}>B-SPORT</Text>
        </View>
        <TouchableOpacity style={localStyles.iconCircle}>
          <Search size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F8AD3C']} />
        }
      >
        {renderBanner()}
        {renderQuickMenus()}
        {renderDailyDashboard()}

        {/* FEED AKTIVITAS TERBARU PENGGUNA */}
        <View style={localStyles.feedWrapper}>
          <View style={localStyles.sectionHeader}>
            <Text style={localStyles.sectionTitle}>Aktivitas Terbaru</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryScreen' as any)}>
              <Text style={localStyles.seeAllText}>Lihat History</Text>
            </TouchableOpacity>
          </View>
          
          {!latestActivity ? (
             <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 10 }}>Belum ada aktivitas baru-baru ini.</Text>
          ) : (
             <View style={localStyles.activityCard}>
               {/* User Info & Title */}
               <View style={localStyles.activityHeader}>
                 <View style={localStyles.avatarCircle}>
                   <CircleUser size={24} color="#FFF" />
                 </View>
                 <View style={{ marginLeft: 12 }}>
                   <Text style={localStyles.activityTitle}>{latestActivity.title || "Aktivitas Olahraga"}</Text>
                   <Text style={localStyles.activityMeta}>
                     {new Date(latestActivity.created_at || latestActivity.start_time).toLocaleDateString('id-ID')} • {latestActivity.sport_type}
                   </Text>
                 </View>
               </View>

               {/* Stats: Distance, Pace, Time */}
               <View style={localStyles.activityStatsRow}>
                 <View style={localStyles.statCol}>
                   <Text style={localStyles.statLabel}>Jarak</Text>
                   <Text style={localStyles.statValue}>{activityDistance.toFixed(2)} km</Text>
                 </View>
                 <View style={localStyles.statCol}>
                   <Text style={localStyles.statLabel}>Pace</Text>
                   <Text style={localStyles.statValue}>{formatPace(latestActivity.pace, activityDistance)} /km</Text>
                 </View>
                 <View style={localStyles.statCol}>
                   <Text style={localStyles.statLabel}>Waktu</Text>
                   <Text style={localStyles.statValue}>{formatTime(latestActivity.duration)}</Text>
                 </View>
               </View>

               {/* MAP / POLYLINE VIEWER */}
               <View style={localStyles.mapContainer}>
                 {validPoints.length > 1 ? (
                   <View pointerEvents="none" style={StyleSheet.absoluteFill}> 
                     <MapViewComponent
                        coords={validPoints}
                        isDark={false}
                        hasPermission={true} // 🔥 Bebaskan dari load perizinan
                        currentLocation={validPoints[validPoints.length - 1]} // 🔥 Fokus ke rute lari terakhir
                     />
                   </View>
                 ) : (
                   <View style={localStyles.noMapContainer}>
                     <Footprints size={40} color="#D1D5DB" />
                     <Text style={{ color: '#9CA3AF', marginTop: 8 }}>
                       {activityDistance < 0.2 
                          ? 'Jarak terlalu pendek untuk dipetakan' 
                          : 'Memuat rute GPS...'}
                     </Text>
                   </View>
                 )}
               </View>
             </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ==========================================
// STYLES KHUSUS UNTUK HOME SCREEN BARU
// ==========================================
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  headerGreeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FC6100', // Strava Orange
    letterSpacing: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Banner
  bannerContainer: {
    marginTop: 15,
    marginBottom: 25,
  },
  bannerWrapper: {
    width: width - 32,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#E5E7EB',
    fontSize: 12,
    marginTop: 4,
  },

  // Menus
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    alignItems: 'center',
    width: (width - 40) / 4,
  },
  menuIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  // Dashboard Summary
  dashboardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mainDashboardCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
  },
  dashboardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 173, 60, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashboardValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dashboardUnit: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  dashboardLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  dashboardSubGrid: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  subDashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  subDashboardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  subDashboardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  // FEED STYLES (Pengganti Event Mendatang)
  feedWrapper: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FC6100', // Strava Orange
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FC6100',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  activityMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  activityStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  mapContainer: {
    height: 180,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  }
});