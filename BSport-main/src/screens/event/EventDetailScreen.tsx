import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Calendar,
  Trophy,
  Layers,
  Users,
  Check,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { styles, COLORS } from '../../style/EventDetailStyle';

import useEventLeaderboard from '../hooks/event/useEventLeaderboard';
import useEventParticipants from '../hooks/event/useEventParticipants';
import useEventProgress from '../hooks/event/useEventProgress';

// IMPORT MODULAR COMPONENTS
import EventProgressCard from '../../components/event/EventProgressCard';
import EventLeaderboard from '../../components/event/EventLeaderboard';
import AdminParticipantPanel from '../../components/event/admin/AdminParticipantPanel';

interface EventDetailScreenProps {
  readonly route: any;
}

export default function EventDetailScreen({ route }: EventDetailScreenProps) {
  const navigation = useNavigation<any>();
  const { event } = route.params;

  const user = useAuthStore((state: any) => state.user);
  const isAdmin = user?.jabatan_id === 1;

  // --- STATE UNTUK NORMAL USER ---
  const [localEvent, setLocalEvent] = useState(event);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const myParticipantData = localEvent.participants?.[0];
  const myStatusApproval = myParticipantData?.status_approval;

  // 🔥 MENGGUNAKAN CUSTOM HOOKS (Logic Fetching kini sangat bersih!)
  const { leaderboard, isLoading: leaderboardLoading } = useEventLeaderboard(
    event.id,
  );
  const { progress: myProgress, isLoading: progressLoading } = useEventProgress(
    event.id,
  );
  const {
    participants: allParticipants,
    approvedCount,
    isLoading: isFetchingParticipants,
    refreshParticipants,
  } = useEventParticipants(event.id, isAdmin);

  // --- HANDLERS ---
  const handleJoinEvent = async () => {
    setIsJoinLoading(true);
    try {
      const response = await api.post('/events/join', {
        event_id: localEvent.id,
      });
      Alert.alert('Berhasil', response.data.message);

      setLocalEvent({
        ...localEvent,
        participants: [{ ...myParticipantData, status_approval: 'pending' }],
      });

      // 🔥 Panggil fungsi refresh dari Custom Hook
      if (isAdmin) refreshParticipants();
    } catch (error: any) {
      Alert.alert(
        'Gagal',
        error.response?.data?.message || 'Terjadi kesalahan jaringan.',
      );
    } finally {
      setIsJoinLoading(false);
    }
  };

  // Utilities
  const formatFullDate = (dateString: string) => {
    if (!dateString) return { datePart: '-', timePart: '-' };
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { datePart, timePart };
  };

  // --- RENDERERS ---
  const renderActionButton = () => {
    if (isJoinLoading) {
      return (
        <View
          style={[styles.btnContainer, { backgroundColor: COLORS.disabled }]}
        >
          <ActivityIndicator color={COLORS.primary} />
        </View>
      );
    }
    if (!myStatusApproval || myStatusApproval === 'cancelled') {
      return (
        <TouchableOpacity style={styles.btnContainer} onPress={handleJoinEvent}>
          <Text style={styles.btnText}>Daftar Event Ini</Text>
        </TouchableOpacity>
      );
    }
    if (myStatusApproval === 'pending') {
      return (
        <View
          style={[styles.btnContainer, { backgroundColor: COLORS.warning }]}
        >
          <Text style={[styles.btnText, { color: COLORS.warningDarkText }]}>
            Menunggu Persetujuan Admin
          </Text>
        </View>
      );
    }
    if (myStatusApproval === 'approved') {
      return (
        <TouchableOpacity
          style={[styles.btnContainer, { backgroundColor: COLORS.success }]}
          onPress={() =>
            navigation.navigate('Main', {
              screen: 'Tracking',
              params: { eventId: event.id },
            })
          }
        >
          <Text style={styles.btnText}>Mulai Lari (Live Tracking)</Text>
        </TouchableOpacity>
      );
    }
    if (myStatusApproval === 'rejected') {
      return (
        <View style={[styles.btnContainer, { backgroundColor: COLORS.danger }]}>
          <Text style={styles.btnText}>Pendaftaran Ditolak</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={28} color="#FFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                localEvent.image_url ||
                'https://images.unsplash.com/photo-1552674605-15c2145fb121',
            }}
            style={styles.image}
          />
          <View style={styles.overlay} />
          <View style={styles.titleWrapper}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {localEvent.status?.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.title}>{localEvent.nama_event}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Trophy size={22} color={COLORS.primary} />
              <Text style={styles.statValue}>{localEvent.target_jarak} KM</Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Layers size={22} color={COLORS.primary} />
              <Text style={styles.statValue}>{localEvent.tipe_lomba}</Text>
              <Text style={styles.statLabel}>Tipe</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users size={22} color={COLORS.primary} />
              <Text style={styles.statValue}>
                {isFetchingParticipants ? '-' : approvedCount}
              </Text>
              <Text style={styles.statLabel}>Terdaftar</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jadwal Pelaksanaan</Text>
            <View style={styles.dateCard}>
              <View style={styles.dateRow}>
                <View style={styles.dateIconWrapper}>
                  <Calendar size={20} color={COLORS.primary} />
                </View>
                <View style={styles.dateTextWrapper}>
                  <Text style={styles.dateLabel}>Mulai</Text>
                  <Text style={styles.dateValue}>
                    {formatFullDate(localEvent.jadwal_start).datePart}
                  </Text>
                  <Text style={styles.timeValue}>
                    {formatFullDate(localEvent.jadwal_start).timePart} WIB
                  </Text>
                </View>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateRow}>
                <View style={styles.dateIconWrapper}>
                  <Check size={20} color={COLORS.success} />
                </View>
                <View style={styles.dateTextWrapper}>
                  <Text style={styles.dateLabel}>Selesai</Text>
                  <Text style={styles.dateValue}>
                    {formatFullDate(localEvent.jadwal_selesai).datePart}
                  </Text>
                  <Text style={styles.timeValue}>
                    {formatFullDate(localEvent.jadwal_selesai).timePart} WIB
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi Event</Text>
            <Text style={styles.description}>
              {localEvent.deskripsi ||
                'Tidak ada deskripsi lebih lanjut mengenai event ini. Persiapkan diri Anda dan raih garis finish!'}
            </Text>
          </View>

          {/* 🔥 MODULAR COMPONENT: Progress Card */}
          <EventProgressCard
            progress={myProgress}
            isLoading={progressLoading}
            targetJarakEvent={localEvent.target_jarak}
          />

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            {/* 🔥 MODULAR COMPONENT: Leaderboard */}
            <EventLeaderboard
              leaderboard={leaderboard}
              isLoading={leaderboardLoading}
            />
          </View>

          {/* 🔥 MODULAR COMPONENT: Admin Panel */}
          {isAdmin && (
            <AdminParticipantPanel
              eventId={event.id}
              participants={allParticipants}
              isFetching={isFetchingParticipants}
              onRefresh={refreshParticipants} // Memanggil fungsi dari hook
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>{renderActionButton()}</View>
    </SafeAreaView>
  );
}
