import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Calendar,
  Trophy,
  Layers,
  Users,
  Search,
  UserPlus,
  Check,
  UserCheck,
  UserX,
  Ghost,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

type FilterType = 'pending' | 'approved' | 'rejected' | 'all';

export default function EventDetailScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { event } = route.params;

  const user = useAuthStore((state: any) => state.user);
  const isAdmin = user?.jabatan_id === 1;

  // --- STATE UNTUK NORMAL USER ---
  const [localEvent, setLocalEvent] = useState(event);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const myParticipantData = localEvent.participants?.[0];
  const myStatusApproval = myParticipantData?.status_approval;

  // --- STATE UNTUK ADMIN MANAGEMENT ---
  const [allParticipants, setAllParticipants] = useState<any[]>([]);
  const [isFetchingParticipants, setIsFetchingParticipants] = useState(isAdmin);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    [],
  );

  // 🔥 Filter State (Default di 'pending')
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');

  // Modal Add by Email
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // --- FETCH PARTICIPANTS ---
  const fetchAllParticipants = useCallback(async () => {
    try {
      const res = await api.get(`/events/${localEvent.id}/participants`);
      setAllParticipants(res.data.data);
    } catch (err) {
      console.log('Gagal mengambil data peserta', err);
    } finally {
      setIsFetchingParticipants(false);
    }
  }, [localEvent.id]);

  useEffect(() => {
    fetchAllParticipants();
  }, [fetchAllParticipants]);

  // --- DERIVED DATA ---
  const approvedCount = useMemo(() => {
    return allParticipants.filter(p => p.status_approval === 'approved').length;
  }, [allParticipants]);

  // 🔥 Logika Filter & Search
  const filteredParticipants = useMemo(() => {
    let result = allParticipants;

    // 1. Filter by Status
    if (activeFilter !== 'all') {
      result = result.filter(p => p.status_approval === activeFilter);
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      result = result.filter(
        p =>
          p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  }, [allParticipants, activeFilter, searchQuery]);

  const isAllSelected =
    filteredParticipants.length > 0 &&
    selectedParticipants.length === filteredParticipants.length;

  // --- HANDLERS NORMAL USER ---
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
      fetchAllParticipants();
    } catch (error: any) {
      Alert.alert(
        'Gagal',
        error.response?.data?.message || 'Terjadi kesalahan jaringan.',
      );
    } finally {
      setIsJoinLoading(false);
    }
  };

  // --- HANDLERS ADMIN ---
  const toggleSelectAll = () => {
    setSelectedParticipants(
      isAllSelected ? [] : filteredParticipants.map(p => p.id),
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const updateStatus = async (status: string) => {
    if (selectedParticipants.length === 0) return;
    try {
      await api.put('/events/participants/status', {
        participant_ids: selectedParticipants,
        status_approval: status,
      });
      setSelectedParticipants([]); // Bersihkan seleksi
      fetchAllParticipants(); // Refresh UI
    } catch (err) {
      Alert.alert('Error', 'Gagal memperbarui status peserta.');
    }
  };

  const handleAddByEmail = async () => {
    if (!emailInput) return;
    setIsAddingUser(true);
    try {
      await api.post('/events/participants/add-by-email', {
        email: emailInput.trim(),
        event_id: localEvent.id,
      });
      setModalVisible(false);
      setEmailInput('');
      fetchAllParticipants();
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err.response?.data?.message || 'Email tidak ditemukan.',
      );
    } finally {
      setIsAddingUser(false);
    }
  };

  // Fungsi helper warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#ECFDF5', text: '#059669' };
      case 'rejected':
        return { bg: '#FEF2F2', text: '#DC2626' };
      default:
        return { bg: '#FFFBEB', text: '#D97706' };
    }
  };

const formatFullDate = (dateString: string) => {
    if (!dateString) return { datePart: '-', timePart: '-' }; // Safety check
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

  // --- RENDER NORMAL USER ACTION BUTTON ---
  const renderActionButton = () => {
    if (isJoinLoading) {
      return (
        <View style={[styles.btnContainer, { backgroundColor: '#E5E7EB' }]}>
          <ActivityIndicator color="#FC6100" />
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
        <View style={[styles.btnContainer, { backgroundColor: '#FCD34D' }]}>
          <Text style={[styles.btnText, { color: '#92400E' }]}>
            Menunggu Persetujuan Admin
          </Text>
        </View>
      );
    }
    if (myStatusApproval === 'approved') {
      return (
        <TouchableOpacity
          style={[styles.btnContainer, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('Tracking')}
        >
          <Text style={styles.btnText}>Mulai Lari (Live Tracking)</Text>
        </TouchableOpacity>
      );
    }
    if (myStatusApproval === 'rejected') {
      return (
        <View style={[styles.btnContainer, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.btnText}>Pendaftaran Ditolak</Text>
        </View>
      );
    }
  };

  // --- RENDER ADMIN PANEL ---
  const renderAdminPanel = () => {
    if (!isAdmin) return null;

    const pendingCount = allParticipants.filter(
      p => p.status_approval === 'pending',
    ).length;

  // Helper untuk mendapatkan icon status
  const getStatusIcon = (status: string) => {
    if (status === 'pending') return '⏳';
    if (status === 'approved') return '✅';
    return '❌';
  };

  // Helper untuk merender list peserta
  const renderParticipantList = () => {
    if (isFetchingParticipants) {
      return <ActivityIndicator color="#FC6100" style={{ marginVertical: 20 }} />;
    }

    if (filteredParticipants.length === 0) {
      return (
        <View style={styles.emptyPending}>
          <Ghost size={40} color="#D1D5DB" />
          <Text style={styles.emptyPendingText}>Tidak ada data yang cocok.</Text>
        </View>
      );
    }

    return filteredParticipants.map(item => {
      const isSelected = selectedParticipants.includes(item.id);
      const statusColor = getStatusColor(item.status_approval);
      
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.pendingCard, isSelected && styles.pendingCardSelected]}
          onPress={() => toggleSelect(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
            {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
          </View>
          <View style={styles.pendingAvatar}>
            <Text style={styles.pendingAvatarText}>
              {item.user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pendingName} numberOfLines={1}>{item.user?.name}</Text>
            <Text style={styles.pendingEmail} numberOfLines={1}>{item.user?.email}</Text>
          </View>
          {/* Status Badge dalam List */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            {/* 🔥 Memanggil fungsi icon di sini */}
            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
              {getStatusIcon(item.status_approval)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

    return (
      <View style={styles.adminSection}>
        <View style={styles.adminHeader}>
          <View>
            <Text style={styles.adminTitle}>Manajemen Peserta</Text>
            {pendingCount > 0 ? (
              <Text style={styles.adminSubtitle}>
                {pendingCount} menunggu konfirmasi
              </Text>
            ) : (
              <Text style={[styles.adminSubtitle, { color: '#64748B' }]}>
                Total {allParticipants.length} peserta
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <UserPlus size={18} color="#FC6100" />
          </TouchableOpacity>
        </View>

        {/* 🔥 Filter Tabs (Pill Design) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {(['pending', 'approved', 'rejected', 'all'] as FilterType[]).map(
            filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  activeFilter === filter && styles.filterPillActive,
                ]}
                onPress={() => {
                  setActiveFilter(filter);
                  setSelectedParticipants([]); // Reset pilihan saat pindah tab
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau email..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {filteredParticipants.length > 0 && (
          <TouchableOpacity
            style={styles.selectAllBtn}
            onPress={toggleSelectAll}
          >
            <View
              style={[styles.checkbox, isAllSelected && styles.checkboxActive]}
            >
              {isAllSelected && (
                <Check size={12} color="#fff" strokeWidth={3} />
              )}
            </View>
            <Text style={styles.selectAllText}>Pilih Semua di tab ini</Text>
          </TouchableOpacity>
        )}

        {/* List Participants */}
        {renderParticipantList()}

        {/* Bulk Actions Menu */}
        {selectedParticipants.length > 0 && (
          <View style={styles.bulkActionRow}>
            {/* Tampilkan tombol Tolak jika bukan di tab rejected */}
            {activeFilter !== 'rejected' && (
              <TouchableOpacity
                style={[styles.bulkBtn, styles.bulkReject]}
                onPress={() => updateStatus('rejected')}
              >
                <UserX size={16} color="#DC2626" />
                <Text style={styles.bulkRejectText}>
                  Tolak ({selectedParticipants.length})
                </Text>
              </TouchableOpacity>
            )}
            {/* Tampilkan tombol Setujui jika bukan di tab approved */}
            {activeFilter !== 'approved' && (
              <TouchableOpacity
                style={[styles.bulkBtn, styles.bulkApprove]}
                onPress={() => updateStatus('approved')}
              >
                <UserCheck size={16} color="#059669" />
                <Text style={styles.bulkApproveText}>
                  Setujui ({selectedParticipants.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
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
        {/* GAMBAR HEADER */}
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

        {/* KONTEN DETAIL */}
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Trophy size={22} color="#FC6100" />
              <Text style={styles.statValue}>{localEvent.target_jarak} KM</Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Layers size={22} color="#FC6100" />
              <Text style={styles.statValue}>{localEvent.tipe_lomba}</Text>
              <Text style={styles.statLabel}>Tipe</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users size={22} color="#FC6100" />
              <Text style={styles.statValue}>
                {isFetchingParticipants ? '-' : approvedCount}
              </Text>
              <Text style={styles.statLabel}>Terdaftar</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jadwal Pelaksanaan</Text>
            {/* 🔥 GANTI KODE DI BAWAH INI 🔥 */}
            <View style={styles.dateCard}>
              <View style={styles.dateRow}>
                <View style={styles.dateIconWrapper}>
                  <Calendar size={20} color="#FC6100" />
                </View>
                <View style={styles.dateTextWrapper}>
                  <Text style={styles.dateLabel}>Mulai</Text>
                  <Text style={styles.dateValue}>{formatFullDate(localEvent.jadwal_start).datePart}</Text>
                  <Text style={styles.timeValue}>{formatFullDate(localEvent.jadwal_start).timePart} WIB</Text>
                </View>
              </View>

              <View style={styles.dateDivider} />

              <View style={styles.dateRow}>
                <View style={styles.dateIconWrapper}>
                  <Check size={20} color="#10B981" />
                </View>
                <View style={styles.dateTextWrapper}>
                  <Text style={styles.dateLabel}>Selesai</Text>
                  <Text style={styles.dateValue}>{formatFullDate(localEvent.jadwal_selesai).datePart}</Text>
                  <Text style={styles.timeValue}>{formatFullDate(localEvent.jadwal_selesai).timePart} WIB</Text>
                </View>
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

          {/* RENDER ADMIN PANEL */}
          {renderAdminPanel()}
        </View>
      </ScrollView>

      {/* FOOTER ACTION BUTTON */}
      <View style={styles.footer}>{renderActionButton()}</View>

      {/* MODAL ADD BY EMAIL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Peserta Manual</Text>
            <Text style={styles.modalDesc}>
              Peserta yang ditambahkan lewat sini otomatis berstatus 'Approved'.
            </Text>

            <TextInput
              style={styles.inputModal}
              placeholder="Masukkan email peserta..."
              placeholderTextColor="#9CA3AF"
              value={emailInput}
              onChangeText={setEmailInput}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddByEmail}
                style={styles.modalSubmitBtn}
                disabled={isAddingUser}
              >
                {isAddingUser ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Tambah</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (SAMA SEPERTI SEBELUMNYA)
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  imageContainer: { width: '100%', height: 300, position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40, // Sesuaikan dengan status bar
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // 🔥 PENTING: Agar selalu ada di layer paling depan
  },
  titleWrapper: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  badge: {
    backgroundColor: '#FC6100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  content: { padding: 20 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginTop: -45,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#F3F4F6', marginHorizontal: 5 },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  section: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  // 🔥 STYLES BARU UNTUK JADWAL
  dateCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 12,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 13,
    color: '#FC6100', // Warna orange khas aplikasi Anda
    fontWeight: 'bold',
  },
  dateDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
    marginLeft: 52, // Menjaga garis tetap sejajar dengan teks
  },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 24 },
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
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // --- STYLES ADMIN PANEL BARU ---
  adminSection: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  adminSubtitle: {
    fontSize: 12,
    color: '#FC6100',
    fontWeight: '600',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: 'rgba(252, 97, 0, 0.1)',
    padding: 10,
    borderRadius: 12,
  },

  // 🔥 Filter Pills
  filterContainer: { marginBottom: 12, gap: 8, paddingBottom: 4 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  selectAllText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyPending: { alignItems: 'center', paddingVertical: 20 },
  emptyPendingText: { color: '#9CA3AF', marginTop: 8, fontSize: 13 },

  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pendingCardSelected: { borderColor: '#FC6100', backgroundColor: '#FFF7F2' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: { backgroundColor: '#FC6100', borderColor: '#FC6100' },
  pendingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pendingAvatarText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  pendingName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  pendingEmail: { fontSize: 12, color: '#64748B' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },

  bulkActionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  bulkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  bulkReject: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  bulkRejectText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  bulkApprove: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  bulkApproveText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputModal: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: '#6B7280', fontWeight: '600' },
  modalSubmitBtn: {
    backgroundColor: '#FC6100',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  modalSubmitText: { color: '#FFFFFF', fontWeight: 'bold' },
});
