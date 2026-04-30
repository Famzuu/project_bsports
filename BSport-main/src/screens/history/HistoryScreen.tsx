import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CircleUser, ChevronLeft, Footprints } from 'lucide-react-native';

import api from '../../services/api';
import MapViewComponent from '../../components/MapViewComponent';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [activities, setActivities] = useState<any[]>([]);
  const [pointsMap, setPointsMap] = useState<{ [key: number]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // FORMATTING (WAKTU & PACE)
  // ==========================================
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities');
      
      // Ambil yang statusnya selesai
      const filtered = res.data.data.filter((item: any) => item.status === 'finished');
      setActivities(filtered);

      // Fetch points untuk polyline masing-masing aktivitas
      filtered.forEach((item: any) => {
        fetchPoints(item.act_id);
      });
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoints = async (actId: number) => {
    try {
      const res = await api.get(`/activities/${actId}/points`);
      
      // Pastikan parse koordinat sebagai angka agar map tidak crash
      const mapped = res.data.data.map((p: any) => [
        Number(p.longitude || p.lng),
        Number(p.latitude || p.lat),
      ]);

      setPointsMap(prev => ({
        ...prev,
        [actId]: mapped,
      }));
    } catch (err) {
      console.log('Error fetching points for', actId, err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, []);

  // ==========================================
  // RENDER ITEM (CARD)
  // ==========================================
  const renderActivityCard = ({ item }: { item: any }) => {
    const dateObj = new Date(item.created_at || item.start_time);
    const dateString = isNaN(dateObj.getTime())
      ? 'Waktu tidak diketahui'
      : dateObj.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    return (
      <View style={styles.activityCard}>
        {/* Header: User Avatar, Title, Date */}
        <View style={styles.activityHeader}>
          <View style={styles.avatarCircle}>
            <CircleUser size={24} color="#FFF" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.activityTitle}>{item.title || 'Aktivitas Olahraga'}</Text>
            <Text style={styles.activityMeta}>
              {dateString} • {item.sport_type}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.activityStatsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Jarak</Text>
            <Text style={styles.statValue}>
              {item.distance ? Number(item.distance).toFixed(2) : '0.00'} km
            </Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{formatPace(item.pace, item.distance)} /km</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Waktu</Text>
            <Text style={styles.statValue}>{formatDuration(item.duration)}</Text>
          </View>
        </View>

        {/* Map / Polyline Area */}
        <View style={styles.mapContainer}>
          {pointsMap[item.act_id] && pointsMap[item.act_id].length > 0 ? (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <MapViewComponent
                coords={pointsMap[item.act_id]}
                isDark={false}
                
                // 🔥 UBAH KEMBALI JADI TRUE AGAR MAP LANGSUNG TAMPIL TANPA LOADING IZIN
                hasPermission={true} 
                
                // 🔥 LOKASI FOKUS KE TITIK TERAKHIR RUTE AGAR TIDAK MENCARI GPS LIVE
                currentLocation={
                  pointsMap[item.act_id][pointsMap[item.act_id].length - 1]
                }
              />
            </View>
          ) : (
            <View style={styles.noMapContainer}>
              <Footprints size={40} color="#D1D5DB" />
              <Text style={styles.noMapText}>Memuat rute GPS...</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Aktivitas</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* List / Feed */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FC6100" />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item, index) => item.act_id ? item.act_id.toString() : index.toString()}
          renderItem={renderActivityCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FC6100']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Footprints size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
              <Text style={styles.emptySub}>Mulai lacak aktivitas pertamamu sekarang!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  mapContainer: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  noMapText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});