import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Trophy, Calendar, Zap } from 'lucide-react-native';
import EventSkeleton from '../../components/EventSkeleton';

// Gunakan instance API tersentralisasi (Production Standard)
import api from '../../services/api';
import { RootTabParamList } from '../../navigation/AppNavigator';
import { styles } from '../../style/HomeStyle';

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [activeTab, setActiveTab] = useState<'feed' | 'events'>('feed');
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useFocusEffect menggantikan useEffect agar data selalu diperbarui
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'events') {
        fetchEvents();
      }
    }, [activeTab]),
  );

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'events') {
      await fetchEvents();
    }
    setRefreshing(false);
  }, [activeTab]);

  const handleJoinEvent = async (eventId: number) => {
    try {
      const response = await api.post('/events/join', { event_id: eventId });
      Alert.alert('Berhasil!', response.data.message);
    } catch (error: any) {
      Alert.alert(
        'Pemberitahuan',
        error.response?.data?.message || 'Gagal mendaftar event',
      );
    }
  };

  // ==========================================
  // FUNGSI RENDER MANDIRI
  // ==========================================

  const renderEventContent = () => {
    if (isLoading && !refreshing) {
  return (
    <>
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
    </>
  );
}

    if (events.length === 0) {
      return (
        <Text style={styles.emptyText}>
          Belum ada event perlombaan saat ini.
        </Text>
      );
    }

    return events.map(item => {
      // 1. Cek status user dari data Laravel (karena kita sudah pakai 'with')
      const userParticipant =
        item.participants && item.participants.length > 0
          ? item.participants[0]
          : null;
      const status = userParticipant ? userParticipant.status_approval : null;

      // 2. Set default tampilan tombol
      let btnText = 'IKUT EVENT';
      let btnBgColor = '#FC4C02'; // Orange (Warna Default B-Sport)
      let isDisabled = false;

      // 3. Ubah warna dan teks sesuai status
      if (status === 'approved') {
        btnText = 'TERDAFTAR ✓';
        btnBgColor = '#10B981'; // Hijau Success
        isDisabled = true; // Nonaktifkan tombol karena sudah terdaftar
      } else if (status === 'pending') {
        btnText = 'MENUNGGU..';
        btnBgColor = '#9CA3AF'; // Abu-abu
        isDisabled = true;
      } else if (status === 'rejected') {
        btnText = 'DITOLAK ❌';
        btnBgColor = '#EF4444'; // Merah
        isDisabled = true;
      }

      return (
        <View key={item.id} style={styles.eventCard}>
          <Image
            source={{
              uri:
                item.image_url ||
                'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop',
            }}
            style={styles.eventImage}
          />
          <View style={styles.eventContent}>
            <View style={styles.eventHeaderRow}>
              <Text style={styles.eventTitle}>{item.nama_event}</Text>
              {/* Badge Tipe Lomba */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      item.tipe_lomba === 'live' ? '#E0F2FE' : '#FFEDD5',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: item.tipe_lomba === 'live' ? '#0284C7' : '#EA580C',
                    },
                  ]}
                >
                  {item.tipe_lomba ? item.tipe_lomba.toUpperCase() : 'VIRTUAL'}
                </Text>
              </View>
            </View>

            <Text style={styles.eventDesc} numberOfLines={2}>
              {item.deskripsi ||
                'Jadilah yang tercepat dalam event lari ini dan menangkan hadiah menarik!'}
            </Text>

            <View style={styles.eventInfoRow}>
              <View style={styles.eventInfoItem}>
                <Trophy size={16} color="#6B7280" />
                <Text style={styles.eventInfoText}>{item.target_jarak} km</Text>
              </View>
              <View style={styles.eventInfoItem}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.eventInfoText}>
                  {new Date(item.jadwal_start).toLocaleDateString('id-ID')}
                </Text>
              </View>
            </View>

            {/* TOMBOL DINAMIS */}
            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: btnBgColor }]} // Terapkan warna dinamis
              onPress={() => handleJoinEvent(item.id)}
              activeOpacity={0.8}
              disabled={isDisabled} // Nonaktifkan klik jika statusnya disable
            >
              <Text style={styles.joinButtonText}>{btnText}</Text>
              {!isDisabled && <Zap size={16} color="#FFFFFF" fill="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navbar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>B-SPORT</Text>
        <View style={styles.avatar} />
      </View>

      {/* Tab Toggle (Aktivitas vs Event) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'feed' && styles.activeTabText,
            ]}
          >
            Aktivitas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'events' && styles.activeTabText,
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FC4C02']}
            tintColor="#FC4C02"
          />
        }
      >
        {/* === RENDER TAB AKTIVITAS === */}
        {activeTab === 'feed' && (
          <View style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.smallAvatar} />
              <View>
                <Text style={styles.userName}>Anda</Text>
                <Text style={styles.activityTime}>
                  Kemarin pada 16:30 • Lari
                </Text>
              </View>
            </View>

            <Text style={styles.activityTitle}>Lari Sore Menembus Batas</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Jarak</Text>
                <Text style={styles.statValue}>
                  5.2 <Text style={styles.statUnit}>km</Text>
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Pace</Text>
                <Text style={styles.statValue}>
                  5:40 <Text style={styles.statUnit}>/km</Text>
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Waktu</Text>
                <Text style={styles.statValue}>29m 30s</Text>
              </View>
            </View>

            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>🗺️ Peta Rute Lari</Text>
            </View>
          </View>
        )}

        {/* === RENDER TAB EVENTS === */}
        {activeTab === 'events' && renderEventContent()}
      </ScrollView>
    </View>
  );
}
