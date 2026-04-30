import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform, // 🔥 Tambahkan Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Trophy, Calendar, MapPin, Users } from 'lucide-react-native';
import api from '../../services/api';

export default function EventScreen() {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data);
    } catch (error) {
      console.log('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, []);

  const renderEventCard = ({ item }: any) => {
    const isOngoing = item.status?.toLowerCase() === 'ongoing';

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('EventDetail', { event: item });
        }}
      >
        <Image 
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1552674605-15c2145fb121?q=80&w=1000&auto=format&fit=crop' }} 
          style={styles.cardImage} 
        />
        
        <View style={[styles.badge, { backgroundColor: isOngoing ? '#10B981' : '#F8AD3C' }]}>
          <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'UPCOMING'}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.nama_event}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Trophy size={16} color="#FC6100" />
              <Text style={styles.metaText}>{item.target_jarak} KM</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.metaText}>
                {new Date(item.jadwal_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color="#6B7280" />
              <Text style={styles.metaText}>{item.tipe_lomba}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Event</Text>
        <View style={{ width: 28 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#FC6100" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FC6100']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MapPin size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Belum ada event yang tersedia saat ini.</Text>
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
    backgroundColor: '#F9FAFB',
    // 🔥 PERBAIKAN: Menambahkan padding atas setinggi status bar Android
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
});