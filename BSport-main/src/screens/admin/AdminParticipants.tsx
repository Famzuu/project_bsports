import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import api from '../../services/api';

const PRIMARY_COLOR = '#F8AD3C';
const BG_COLOR = '#F1F2F6';
const TEXT_DARK = '#242428';
const TEXT_MUTED = '#6B6B76';

export default function AdminParticipants({ route, navigation }: any) {
  const { eventId } = route.params;

  const [participants, setParticipants] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State untuk Fitur Tambahan
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchParticipants = async () => {
    try {
      const res = await api.get(`/events/${eventId}/participants`);
      setParticipants(res.data.data);
    } catch (err) {
      console.log('Gagal mengambil peserta', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchParticipants();
    setSelected([]); // Reset pilihan saat refresh
  }, []);

  // --- LOGIKA SEARCH & FILTER ---
  const filteredParticipants = useMemo(() => {
    if (!searchQuery) return participants;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return participants.filter(
      p =>
        p.user?.name?.toLowerCase().includes(lowerCaseQuery) ||
        p.user?.email?.toLowerCase().includes(lowerCaseQuery),
    );
  }, [participants, searchQuery]);

  // --- LOGIKA SELECT & SELECT ALL ---
  const isAllSelected =
    filteredParticipants.length > 0 &&
    selected.length === filteredParticipants.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected([]); // Deselect semua
    } else {
      // Pilih semua HANYA yang sedang difilter/tampil
      setSelected(filteredParticipants.map(p => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  // --- LOGIKA API ---
  const updateStatus = async (status: string) => {
    if (selected.length === 0) return;

    try {
      await api.put('/events/participants/status', {
        participant_ids: selected,
        status_approval: status,
      });

      Alert.alert('Sukses', `Berhasil mengupdate status menjadi ${status}`);
      setSelected([]);
      fetchParticipants();
    } catch (err) {
      Alert.alert('Error', 'Gagal mengupdate status peserta.');
    }
  };

  const handleAddByEmail = async () => {
    if (!emailInput) {
      Alert.alert('Perhatian', 'Harap masukkan email peserta.');
      return;
    }

    setIsAdding(true);
    try {
      await api.post('/events/participants/add-by-email', {
        email: emailInput.trim(),
        event_id: eventId,
      });

      Alert.alert('Sukses', 'Peserta berhasil ditambahkan (Otomatis Approved)');
      setModalVisible(false);
      setEmailInput('');
      fetchParticipants();
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err.response?.data?.message ||
          'Email tidak ditemukan atau sudah terdaftar.',
      );
    } finally {
      setIsAdding(false);
    }
  };

  // --- HELPERS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'rejected':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'cancelled':
        return { bg: '#F1F2F6', text: '#6B6B76' };
      default:
        return { bg: '#FFF4E5', text: '#EF6C00' }; // pending
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  };

  // --- RENDER ITEMS ---
  const renderItem = ({ item }: any) => {
    const isSelected = selected.includes(item.id);
    const statusStyle = getStatusColor(item.status_approval);

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.8}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        {/* Checkbox Visual */}
        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.user?.name)}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.user?.name || 'Unknown User'}
          </Text>
          <Text style={styles.userEmail}>{item.user?.email}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>
            {item.status_approval}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Kelola Peserta</Text>
            <Text style={styles.headerSubtitle}>
              {participants.length} Total Peserta
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addMemberBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addMemberIcon}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR & SELECT ALL */}
      <View style={styles.toolbarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email..."
          placeholderTextColor={TEXT_MUTED}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Tombol Select All HANYA muncul jika ada data yang bisa dipilih */}
        {filteredParticipants.length > 0 && (
          <TouchableOpacity
            style={styles.selectAllContainer}
            onPress={toggleSelectAll}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, isAllSelected && styles.checkboxActive]}
            >
              {isAllSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.selectAllText}>
              {isAllSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST PESERTA */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <FlatList
          data={filteredParticipants} // Menggunakan data hasil filter
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Peserta tidak ditemukan.'
                  : 'Belum ada peserta yang mendaftar.'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY_COLOR}
            />
          }
        />
      )}

      {/* BOTTOM ACTION BAR */}
      {selected.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => updateStatus('rejected')}
          >
            <Text style={styles.rejectBtnText}>Tolak ({selected.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => updateStatus('approved')}
          >
            <Text style={styles.approveBtnText}>
              Setujui ({selected.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL TAMBAH PESERTA VIA EMAIL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Peserta</Text>
            <Text style={styles.modalSubtitle}>
              Masukkan email user yang sudah terdaftar di aplikasi.
            </Text>

            <TextInput
              style={styles.inputModal}
              placeholder="email.user@bsi.co.id"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailInput}
              onChangeText={setEmailInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, isAdding && { opacity: 0.7 }]}
                onPress={handleAddByEmail}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Tambahkan</Text>
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
  safeArea: { flex: 1, backgroundColor: BG_COLOR },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: BG_COLOR,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 2,
  },
  backIcon: {
    fontSize: 22,
    color: TEXT_DARK,
    fontWeight: '600',
    marginTop: -2,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  headerSubtitle: { fontSize: 13, color: PRIMARY_COLOR, fontWeight: '600' },
  addMemberBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addMemberIcon: { color: TEXT_DARK, fontWeight: '600', fontSize: 13 },

  // Toolbar (Search & Select All)
  toolbarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: BG_COLOR,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontSize: 15,
    color: TEXT_DARK,
    marginBottom: 12,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
  },

  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 120 },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: { borderColor: PRIMARY_COLOR, backgroundColor: '#FFFBF5' },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: TEXT_MUTED },

  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  userEmail: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  // Bottom Action Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  rejectBtn: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  rejectBtnText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 15 },
  approveBtn: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  approveBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 15 },

  // Modal Styles
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { color: TEXT_MUTED, fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  modalSubtitle: { fontSize: 14, color: TEXT_MUTED, marginBottom: 20 },
  inputModal: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: TEXT_DARK,
    marginBottom: 24,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancelBtn: { padding: 12, marginRight: 8 },
  modalCancelText: { color: TEXT_MUTED, fontWeight: '600', fontSize: 15 },
  modalSubmitBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
