import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft, Calendar, Trophy, Layers, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

export default function EventDetailScreen({ route }: any) {
  const navigation = useNavigation<any>();
  // Menangkap data event yang dikirim dari layar sebelumnya
  const { event } = route.params; 
  
  // State lokal agar tombol bisa langsung berubah tanpa perlu refresh layar sebelumnya
  const [localEvent, setLocalEvent] = useState(event);
  const [isLoading, setIsLoading] = useState(false);

  // Mengekstrak status pendaftaran user saat ini
  const participantData = localEvent.participants?.[0];
  const statusApproval = participantData?.status_approval;

  const handleJoinEvent = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/events/join', { event_id: localEvent.id });
      Alert.alert('Berhasil', response.data.message);
      
      // Update UI secara instan menjadi 'pending'
      setLocalEvent({
        ...localEvent,
        participants: [{ ...participantData, status_approval: 'pending' }]
      });
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi dinamis untuk menampilkan tombol berdasarkan status user di backend
  const renderActionButton = () => {
    if (isLoading) {
      return (
        <View style={[styles.btnContainer, { backgroundColor: '#E5E7EB' }]}>
          <ActivityIndicator color="#FC6100" />
        </View>
      );
    }

    if (!statusApproval || statusApproval === 'cancelled') {
      return (
        <TouchableOpacity style={styles.btnContainer} onPress={handleJoinEvent}>
          <Text style={styles.btnText}>Daftar Event Ini</Text>
        </TouchableOpacity>
      );
    }

    if (statusApproval === 'pending') {
      return (
        <View style={[styles.btnContainer, { backgroundColor: '#FCD34D' }]}>
          <Text style={[styles.btnText, { color: '#92400E' }]}>Menunggu Persetujuan Admin</Text>
        </View>
      );
    }

    if (statusApproval === 'approved') {
      return (
        <TouchableOpacity 
          style={[styles.btnContainer, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('Tracking')} // Arahkan ke peta!
        >
          <Text style={styles.btnText}>Mulai Lari (Live Tracking)</Text>
        </TouchableOpacity>
      );
    }

    if (statusApproval === 'rejected') {
      return (
        <View style={[styles.btnContainer, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.btnText}>Pendaftaran Ditolak</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* GAMBAR HEADER */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: localEvent.image_url || 'https://images.unsplash.com/photo-1552674605-15c2145fb121' }} 
            style={styles.image} 
          />
          <View style={styles.overlay} />
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.titleWrapper}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{localEvent.status?.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{localEvent.nama_event}</Text>
          </View>
        </View>

        {/* KONTEN DETAIL */}
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Trophy size={24} color="#FC6100" />
              <Text style={styles.statValue}>{localEvent.target_jarak} KM</Text>
              <Text style={styles.statLabel}>Target Jarak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Layers size={24} color="#FC6100" />
              <Text style={styles.statValue}>{localEvent.tipe_lomba}</Text>
              <Text style={styles.statLabel}>Tipe Race</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jadwal Pelaksanaan</Text>
            <View style={styles.infoRow}>
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                {new Date(localEvent.jadwal_start).toLocaleDateString('id-ID')} - {new Date(localEvent.jadwal_selesai).toLocaleDateString('id-ID')}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi Event</Text>
            <Text style={styles.description}>
              {localEvent.deskripsi || 'Tidak ada deskripsi lebih lanjut mengenai event ini. Persiapkan diri Anda dan raih garis finish!'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTION BUTTON */}
      <View style={styles.footer}>
        {renderActionButton()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  badge: {
    backgroundColor: '#FC6100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginTop: -40, // Efek menumpuk ke atas gambar
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  btnContainer: {
    backgroundColor: '#FC6100',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});