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
  Bell,
  Search,
  Activity,
  Flame,
  Timer,
} from 'lucide-react-native';
import EventSkeleton from '../../components/EventSkeleton';

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
      if (activeTab === 'events') fetchEvents();
    }, [activeTab]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'events') await fetchEvents();
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

            <View style={styles.activityCardPremium}>

              <Text style={styles.activityTitlePremium}>
                Sunset Cardio & Endurance
              </Text>

              <View style={styles.premiumStatsGrid}>
                <View style={styles.mainStat}>
                  <Text style={styles.mainStatValue}>5.20</Text>
                  <Text style={styles.mainStatLabel}>KILOMETER</Text>
                </View>
                <View style={styles.statsDivider} />
                <View style={styles.subStatsColumn}>
                  <View style={styles.subStatItem}>
                    <Text style={styles.subStatLabel}>Pace</Text>
                    <Text style={styles.subStatValue}>5:40</Text>
                  </View>
                  <View style={styles.subStatItem}>
                    <Text style={styles.subStatLabel}>Waktu</Text>
                    <Text style={styles.subStatValue}>29:30</Text>
                  </View>
                </View>
              </View>

              <View style={styles.mapContainerPremium}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=1000',
                  }}
                  style={styles.mapImage}
                />
                <View style={styles.mapOverlay}>
                  <TouchableOpacity style={styles.mapActionButton}>
                    <Text style={styles.mapActionText}>Lihat Analisa Rute</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          renderEventContent()
        )}
      </ScrollView>
    </View>
  );
}
