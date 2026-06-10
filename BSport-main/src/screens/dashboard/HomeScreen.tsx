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

// Import Map, Utils, & Styles
import MapViewComponent from '../../components/MapViewComponent';
import { formatTime } from '../../utils/trackingMath';

// 🔥 1. Import Store dan Theme
import { useAuthStore } from '../../store/useAuthStore';
import { getStyles } from '../../style/HomeStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const [userName, setUserName] = useState<string>('Sporty');
  const [latestActivity, setLatestActivity] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [dailySummary, setDailySummary] = useState({
    distance: 0,
    kcal: 0,
    duration: 0,
  });

  // 🔥 2. Inisialisasi Tema Gelap/Terang
  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const styles = getStyles(isDarkMode); // Ambil style berdasarkan tema
  const THEME = isDarkMode ? darkTheme : lightTheme;

  const formatPace = (pace: number, distance?: number) => {
    if (!pace || !distance) return '--:--';
    if (distance < 0.1) return '--:--';
    if (pace < 30 || pace > 1800) return '--:--';

    const m = Math.floor(pace / 60);
    const s = pace % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDurationText = (sec: number) => {
    if (!sec) return '0m';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const fetchUser = async () => {
    try {
      const response = await api.get('/user');
      const userData = response.data?.data || response.data;
      if (userData && userData.name) {
        setUserName(userData.name.split(' ')[0]);
      }
    } catch (error) {
      console.log('Error fetching user:', error);
    }
  };

  const fetchActivitiesData = async () => {
    try {
      const response = await api.get('/activities');
      const activities = response.data?.data || [];

      if (activities.length > 0) {
        setLatestActivity(activities[0]);
      } else {
        setLatestActivity(null);
      }

      const todayString = new Date().toDateString();
      let totalDistance = 0;
      let totalDuration = 0;

      activities.forEach((act: any) => {
        const actDate = new Date(
          act.start_time || act.created_at,
        ).toDateString();
        if (actDate === todayString && act.status === 'finished') {
          totalDistance += Number(act.distance || 0);
          totalDuration += Number(act.duration || 0);
        }
      });

      const totalKcal = totalDistance * 60;

      setDailySummary({
        distance: totalDistance,
        duration: totalDuration,
        kcal: Math.round(totalKcal),
      });
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

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchActivitiesData();
      fetchEvents();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    await fetchActivitiesData();
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
                {
                  backgroundColor: isDarkMode
                    ? `${menu.color}25`
                    : `${menu.color}15`,
                },
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
            <MapPin size={22} color={THEME.ACCENT} />
          </View>
          <Text style={styles.dashboardValue}>
            {dailySummary.distance.toFixed(2)}{' '}
            <Text style={styles.dashboardUnit}>km</Text>
          </Text>
          <Text style={styles.dashboardLabel}>Total Jarak</Text>
        </TouchableOpacity>

        <View style={styles.dashboardSubGrid}>
          <View style={styles.subDashboardCard}>
            <Flame size={18} color="#EF4444" />
            <View>
              <Text style={styles.subDashboardValue}>{dailySummary.kcal}</Text>
              <Text style={styles.subDashboardLabel}>Kcal Terbakar</Text>
            </View>
          </View>
          <View style={styles.subDashboardCard}>
            <Timer size={18} color="#0284C7" />
            <View>
              <Text style={styles.subDashboardValue}>
                {formatDurationText(dailySummary.duration)}
              </Text>
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
      {/* 🔥 3. Sesuaikan StatusBar dengan tema */}
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={THEME.BG}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Halo, {userName}!</Text>
          <Text style={styles.headerTitle}>B-SPORT</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle}>
          {/* 🔥 Sesuaikan warna icon pencarian */}
          <Search size={22} color={THEME.TEXT_MAIN} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.ACCENT]}
            tintColor={THEME.ACCENT}
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
            <TouchableOpacity
              style={styles.activityCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ActivityDetail' as any, {
                  activity: latestActivity,
                  points: validPoints, // Mengirim points yang sudah difilter di HomeScreen
                })
              }
            >
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
                      isDark={isDarkMode} // 🔥 4. Oper prop isDark ke MapView
                      hasPermission={true}
                      currentLocation={validPoints[validPoints.length - 1]}
                    />
                  </View>
                ) : (
                  <View style={styles.noMapContainer}>
                    <Footprints size={40} color={THEME.BORDERLINE} />
                    <Text style={{ color: THEME.TEXT_SUB, marginTop: 8 }}>
                      {activityDistance < 0.2
                        ? 'Jarak terlalu pendek untuk dipetakan'
                        : 'Memuat rute GPS...'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <Text
              style={{
                textAlign: 'center',
                color: THEME.TEXT_SUB,
                marginTop: 10,
              }}
            >
              Belum ada aktivitas baru-baru ini.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
