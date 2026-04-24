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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Trophy,
  Calendar,
  ArrowRight,
  Search,
  Activity,
  Flame,
  Timer,
} from 'lucide-react-native';
import EventSkeleton from '../../components/EventSkeleton';
import MapViewComponent from '../../components/MapViewComponent';

// Instance API & Types
import api from '../../services/api';
import { RootTabParamList } from '../../navigation/AppNavigator';
import { styles } from '../../style/HomeStyle';

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [activeTab, setActiveTab] = useState<'feed' | 'events'>('feed');
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [pointsMap, setPointsMap] = useState<{ [key: number]: any[] }>({});

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number, distance?: number) => {
    if (!pace || !distance) return '--';

    if (distance < 0.1) return '--';

    if (pace < 30 || pace > 1800) return '--';

    const m = Math.floor(pace / 60);
    const s = pace % 60;

    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/events');
      setEvents(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'feed') {
        fetchActivities();
      } else {
        fetchEvents();
      }
    }, [activeTab]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    if (activeTab === 'feed') {
      await fetchActivities();
    } else {
      await fetchEvents();
    }

    setRefreshing(false);
  }, [activeTab]);

  const handleJoinEvent = async (eventId: number) => {
    try {
      const response = await api.post('/events/join', { event_id: eventId });
      Alert.alert('Berhasil!', response.data.message);
      fetchEvents();
    } catch (error: any) {
      Alert.alert(
        'Pemberitahuan',
        error.response?.data?.message || 'Gagal mendaftar',
      );
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);

      const res = await api.get('/activities');

      const filtered = res.data.data.filter(
        (item: any) => item.status === 'finished',
      );

      setActivities(filtered);

      // 🔥 FETCH POINTS SEMUA
      filtered.forEach((item: any) => {
        fetchPoints(item.act_id);
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPoints = async (actId: number) => {
    try {
      const res = await api.get(`/activities/${actId}/points`);

      const mapped = res.data.data.map((p: any) => [
        Number(p.longitude),
        Number(p.latitude),
      ]);

      setPointsMap(prev => ({
        ...prev,
        [actId]: mapped,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================================
  // RENDER DAILY SUMMARY (DASHBOARD)
  // ==========================================
  const renderDailyDashboard = () => (
    <View style={styles.dashboardWrapper}>
      <Text style={styles.dashboardGreeting}>Ringkasan Hari Ini</Text>
      <View style={styles.dashboardGrid}>
        <TouchableOpacity style={styles.mainDashboardCard}>
          <View style={styles.dashboardIconBg}>
            <Activity size={22} color="#F8AD3C" />
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
              <Text style={styles.subDashboardLabel}>Kcal</Text>
            </View>
          </View>
          <View style={styles.subDashboardCard}>
            <Timer size={18} color="#0284C7" />
            <View>
              <Text style={styles.subDashboardValue}>1h 20m</Text>
              <Text style={styles.subDashboardLabel}>Waktu</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // ==========================================
  // RENDER EVENT LIST
  // ==========================================
  const renderEventContent = () => {
    if (isLoading && !refreshing)
      return (
        <View style={{ gap: 20 }}>
          <EventSkeleton />
          <EventSkeleton />
        </View>
      );
    if (events.length === 0)
      return <Text style={styles.emptyText}>Belum ada event saat ini.</Text>;

    return events.map(item => {
      const userParticipant = item.participants?.[0] || null;
      const status = userParticipant?.status_approval;
      const isLive = item.tipe_lomba === 'live';

      let btnConfig = { text: 'IKUT EVENT', color: '#F8AD3C', disabled: false };
      if (status === 'approved')
        btnConfig = { text: 'TERDAFTAR ✓', color: '#10B981', disabled: true };
      else if (status === 'pending')
        btnConfig = { text: 'MENUNGGU..', color: '#9CA3AF', disabled: true };

      return (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.95}
          style={styles.premiumCard}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: item.image_url || 'https://images.unsplash.com' }}
              style={styles.premiumImage}
            />
            <View
              style={[
                styles.floatingBadge,
                { backgroundColor: isLive ? '#0284C7' : '#F8AD3C' },
              ]}
            >
              <Text style={styles.floatingBadgeText}>
                {isLive ? 'LIVE RACE' : 'VIRTUAL'}
              </Text>
            </View>
          </View>
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>{item.nama_event}</Text>
            <View style={styles.premiumMetaRow}>
              <View style={styles.metaItem}>
                <Trophy size={14} color="#F8AD3C" />
                <Text style={styles.metaText}>{item.target_jarak} KM</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Calendar size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {new Date(item.jadwal_start).toLocaleDateString('id-ID')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.premiumButton,
                { backgroundColor: btnConfig.color },
              ]}
              onPress={() => handleJoinEvent(item.id)}
              disabled={btnConfig.disabled}
            >
              <Text style={styles.premiumButtonText}>{btnConfig.text}</Text>
              {!btnConfig.disabled && <ArrowRight size={18} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>B-SPORT</Text>
        </View>
        <View style={styles.headerActionRow}>
          <TouchableOpacity style={styles.iconCircle}>
            <Search size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          {['feed', 'events'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'feed' ? 'Aktivitas' : 'Events'}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
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
        {activeTab === 'feed' ? (
          <View style={styles.activityContainer}>
            {renderDailyDashboard()}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Feed Aktivitas</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            {activities.length === 0 ? (
              <Text style={styles.emptyText}>Belum ada aktivitas.</Text>
            ) : (
              activities.map(item => (
                <View key={item.act_id} style={styles.activityCardPremium}>
                  <Text style={styles.activityTitlePremium}>
                    {item.title || 'Aktivitas'}
                  </Text>

                  {/* DATE */}
                  <Text
                    style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}
                  >
                    {new Date(item.start_time).toLocaleDateString('id-ID')}
                  </Text>

                  <View style={styles.premiumStatsGrid}>
                    <View style={styles.mainStat}>
                      <Text style={styles.mainStatValue}>
                        {Number(item.distance).toFixed(2)}
                      </Text>
                      <Text style={styles.mainStatLabel}>KILOMETER</Text>
                    </View>

                    <View style={styles.statsDivider} />

                    <View style={styles.subStatsColumn}>
                      <View style={styles.subStatItem}>
                        <Text style={styles.subStatLabel}>Pace</Text>
                        <Text style={styles.subStatValue}>
                          {formatPace(item.pace, item.distance)}
                        </Text>
                      </View>

                      <View style={styles.subStatItem}>
                        <Text style={styles.subStatLabel}>Waktu</Text>
                        <Text style={styles.subStatValue}>
                          {formatDuration(item.duration)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      height: 180,
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}
                  >
                    {pointsMap[item.act_id] ? (
                      <MapViewComponent
                        coords={pointsMap[item.act_id]}
                        hasPermission={true}
                        isDark={false}
                        currentLocation={
                          pointsMap[item.act_id]?.length > 0
                            ? pointsMap[item.act_id][
                                pointsMap[item.act_id].length - 1
                              ]
                            : null
                        }
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text>Loading route...</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          renderEventContent()
        )}
      </ScrollView>
    </View>
  );
}