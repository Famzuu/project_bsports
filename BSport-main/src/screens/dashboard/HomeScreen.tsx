import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Search,
  Flame,
  Timer,
  MapPin,
  CircleUser,
  Footprints,
} from 'lucide-react-native';
import LottieView from 'lottie-react-native';

import api from '../../services/api';
import { RootTabParamList } from '../../navigation/AppNavigator';

// Import Map, Utils, & Styles (Sesuaikan path-nya jika perlu)
import MapViewComponent from '../../components/MapViewComponent';
import { formatTime } from '../../utils/trackingMath';
import { styles } from '../../style/HomeStyle';

const { width } = Dimensions.get('window');
type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [latestActivity, setLatestActivity] = useState<any>(null);

  const [events, setEvents] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 🔥 1. State untuk menyimpan nama user (Default: Sporty)
  const [userName, setUserName] = useState<string>('Sporty');

  const formatPace = (pace: number, distance?: number) => {
    if (!pace || !distance) return '--:--';
    if (distance < 0.1) return '--:--';
    if (pace < 30 || pace > 1800) return '--:--';

    const m = Math.floor(pace / 60);
    const s = pace % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 🔥 2. Fungsi untuk mengambil data User
  const fetchUser = async () => {
    try {
      const response = await api.get('/user'); // Endpoint default dari Laravel Sanctum
      const userData = response.data?.data || response.data; // Handle struktur response
      
      if (userData && userData.name) {
        // Kita ambil nama depan saja agar tampilan header tetap rapi
        const firstName = userData.name.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.log('Error fetching user:', error);
    }
  };

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

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      if (response.data?.data) {
        setEvents(response.data.data.slice(0, 5));
      }
    } catch (error) {
      console.log('Error fetching events:', error);
    }
  };

  // 🔥 3. Panggil fetchUser di useFocusEffect
  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchLatestActivity();
      fetchEvents();
    }, []),
  );

  // 🔥 4. Tambahkan fetchUser ke onRefresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    await fetchLatestActivity();
    await fetchEvents();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (events.length === 0) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % events.length;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 3000);

    return () => clearInterval(timer);
  }, [activeIndex, events.length]);

  const renderBanner = () => {
    if (events.length === 0) return null;

    return (
      <View style={styles.bannerContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const contentOffsetX = e.nativeEvent.contentOffset.x;
            const currentIndex = Math.round(contentOffsetX / width);
            setActiveIndex(currentIndex);
          }}
        >
          {events.map((evt, index) => (
            <View key={index} style={{ width, paddingHorizontal: 16 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.bannerWrapper}
                onPress={() =>
                  navigation.navigate('EventDetail' as any, { event: evt })
                }
              >
                <Image
                  source={{
                    uri:
                      evt.image_url ||
                      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop',
                  }}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle} numberOfLines={1}>
                    {evt.nama_event}
                  </Text>
                  <Text style={styles.bannerSubtitle} numberOfLines={1}>
                    {evt.target_jarak} KM • {evt.tipe_lomba.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dotContainer}>
          {events.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderQuickMenus = () => {
    const menus = [
      {
        id: 1,
        name: 'Profile',
        lottie: require('../../assets/lottie/user.json'),
        color: '#F8AD3C',
        route: 'Profile',
        size: 45,
        translateY: 0,
      },
      {
        id: 2,
        name: 'History',
        lottie: require('../../assets/lottie/chart.json'),
        color: '#EF4444',
        route: 'HistoryScreen',
        size: 65,
        translateY: -2,
      },
      {
        id: 3,
        name: 'Events',
        lottie: require('../../assets/lottie/trophy.json'),
        color: '#10B981',
        route: 'EventScreen',
        size: 60,
        translateY: -5,
      },
      {
        id: 4,
        name: 'Tracking',
        lottie: require('../../assets/lottie/tracking.json'),
        color: '#3B82F6',
        route: 'Tracking',
        size: 58,
        translateY: -1,
      },
    ];

    return (
      <View style={styles.menuGrid}>
        {menus.map(menu => (
          <TouchableOpacity
            key={menu.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(menu.route as any)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIconWrapper,
                { backgroundColor: `${menu.color}15` },
              ]}
            >
              <LottieView
                source={menu.lottie}
                autoPlay
                loop
                style={{
                  width: menu.size,
                  height: menu.size,
                  transform: [{ translateY: menu.translateY }],
                }}
              />
            </View>
            <Text style={styles.menuText}>{menu.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDailyDashboard = () => (
    <View style={styles.dashboardWrapper}>
      <Text style={styles.sectionTitle}>Ringkasan Hari Ini</Text>
      <View style={styles.dashboardGrid}>
        <TouchableOpacity style={styles.mainDashboardCard}>
          <View style={styles.dashboardIconBg}>
            <MapPin size={22} color="#F8AD3C" />
          </View>
          <Text style={styles.dashboardValue}>
            12.4 <Text style={styles.dashboardUnit}>km</Text>
          </Text>
          <Text style={styles.dashboardLabel}>Total Jarak</Text>
        </TouchableOpacity>

        <View style={styles.dashboardSubGrid}>
          <View style={styles.subDashboardCard}>
            <Flame size={18} color="#EF4444" />
            <View>
              <Text style={styles.subDashboardValue}>840</Text>
              <Text style={styles.subDashboardLabel}>Kcal Terbakar</Text>
            </View>
          </View>
          <View style={styles.subDashboardCard}>
            <Timer size={18} color="#0284C7" />
            <View>
              <Text style={styles.subDashboardValue}>1h 20m</Text>
              <Text style={styles.subDashboardLabel}>Waktu Aktif</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  let validPoints: [number, number][] = [];
  let activityDistance = 0;

  if (latestActivity) {
    activityDistance = Number(
      latestActivity.distance || latestActivity.total_distance || 0,
    );

    if (latestActivity.points) {
      validPoints = latestActivity.points
        .map(
          (p: any) =>
            [Number(p.longitude || p.lng), Number(p.latitude || p.lat)] as [
              number,
              number,
            ],
        )
        .filter((coord: [number, number]) => {
          const isInvalid = Number.isNaN(coord[0]) || Number.isNaN(coord[1]);
          const isNullIsland = Math.abs(coord[0]) < 1 && Math.abs(coord[1]) < 1;
          return !isInvalid && !isNullIsland;
        });
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View>
          {/* 🔥 5. Tampilkan nama user secara dinamis */}
          <Text style={styles.headerGreeting}>Halo, {userName}!</Text>
          <Text style={styles.headerTitle}>B-SPORT</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle}>
          <Search size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F8AD3C']}
          />
        }
      >
        {renderBanner()}
        {renderQuickMenus()}
        {renderDailyDashboard()}

        <View style={styles.feedWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('HistoryScreen' as any)}
            >
              <Text style={styles.seeAllText}>Lihat History</Text>
            </TouchableOpacity>
          </View>

          {latestActivity ? (
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.avatarCircle}>
                  <CircleUser size={24} color="#FFF" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.activityTitle}>
                    {latestActivity.title || 'Aktivitas Olahraga'}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {new Date(
                      latestActivity.created_at || latestActivity.start_time,
                    ).toLocaleDateString('id-ID')}{' '}
                    • {latestActivity.sport_type}
                  </Text>
                </View>
              </View>

              <View style={styles.activityStatsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Jarak</Text>
                  <Text style={styles.statValue}>
                    {activityDistance.toFixed(2)} km
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Pace</Text>
                  <Text style={styles.statValue}>
                    {formatPace(latestActivity.pace, activityDistance)} /km
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Waktu</Text>
                  <Text style={styles.statValue}>
                    {formatTime(latestActivity.duration)}
                  </Text>
                </View>
              </View>

              <View style={styles.mapContainer}>
                {validPoints.length > 1 ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <MapViewComponent
                      coords={validPoints}
                      isDark={false}
                      hasPermission={true}
                      currentLocation={validPoints[validPoints.length - 1]}
                    />
                  </View>
                ) : (
                  <View style={styles.noMapContainer}>
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
          ) : (
            <Text
              style={{ textAlign: 'center', color: '#6B7280', marginTop: 10 }}
            >
              Belum ada aktivitas baru-baru ini.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}