import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import api from '../../services/api';

const PRIMARY_COLOR = '#F8AD3C';
const BG_COLOR = '#F1F2F6'; // Background abu-abu muda khas Strava
const TEXT_DARK = '#242428';
const TEXT_MUTED = '#6B6B76';

export default function AdminEventList({ navigation }: any) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.data);
    } catch (err) {
      console.log('Gagal mengambil event:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Hapus Event',
      'Tindakan ini tidak dapat dibatalkan beserta data pesertanya. Yakin ingin menghapus?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/events/${id}`);
              fetchEvents();
            } catch (error: any) {
              // Menampilkan error asli dari Laravel di console
              console.log(
                'Error Delete:',
                error.response?.data || error.message,
              );

              // Menampilkan alert dengan pesan error dari Laravel
              const errorMsg =
                error.response?.data?.message ||
                'Gagal menghapus event. Cek koneksi atau relasi database.';
              Alert.alert('Gagal', errorMsg);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: any) => {
    const isActive =
      item.status?.toLowerCase() === 'aktif' || item.status === 'open';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.eventTitle}>{item.nama_event}</Text>
            <View
              style={[
                styles.badge,
                isActive ? styles.badgeActive : styles.badgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                ]}
              >
                {item.status || 'Draft'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() =>
              navigation.navigate('AdminParticipants', { eventId: item.id })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnPrimaryText}>👥 Kelola Peserta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnDanger}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnDangerText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>Belum ada event yang dibuat.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />

      {/* Header Custom dengan Tombol Back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Daftar Event</Text>
          <Text style={styles.headerSubtitle}>
            Kelola aktivitas dan kompetisi
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_COLOR]}
              tintColor={PRIMARY_COLOR}
            />
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdminCreateEvent')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center', // Menyelaraskan tombol back dan teks ke tengah secara vertikal
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: BG_COLOR,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Shadow ringan
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 24,
    color: TEXT_DARK,
    fontWeight: '600',
    marginTop: -2, // Penyesuaian visual agar panah benar-benar di tengah
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26, // Dikecilkan sedikit agar seimbang dengan tombol back
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  // Card Style
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    flex: 1,
    marginRight: 10,
    lineHeight: 24,
  },

  // Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  badgeInactive: {
    backgroundColor: '#F1F2F6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextActive: {
    color: PRIMARY_COLOR,
  },
  badgeTextInactive: {
    color: TEXT_MUTED,
  },

  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 12,
  },

  // Actions
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE4C4',
  },
  actionBtnPrimaryText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtnDanger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnDangerText: {
    color: '#D92D20',
    fontWeight: '600',
    fontSize: 14,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
});
