import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import {
  Search,
  UserPlus,
  Check,
  UserCheck,
  UserX,
  Ghost,
} from 'lucide-react-native';
import api from '../../../services/api';
import { styles, COLORS } from '../../../style/EventDetailStyle';

type FilterType = 'pending' | 'approved' | 'rejected' | 'all';

// 🔥 Perbaikan SonarQube (S6759): Readonly Props
interface AdminParticipantPanelProps {
  readonly eventId: number;
  readonly participants: any[];
  readonly isFetching: boolean;
  readonly onRefresh: () => void;
}

export default function AdminParticipantPanel({
  eventId,
  participants,
  isFetching,
  onRefresh,
}: AdminParticipantPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const filteredParticipants = useMemo(() => {
    let result = participants;
    if (activeFilter !== 'all') {
      result = result.filter((p) => p.status_approval === activeFilter);
    }
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [participants, activeFilter, searchQuery]);

  const isAllSelected =
    filteredParticipants.length > 0 &&
    selectedParticipants.length === filteredParticipants.length;

  const toggleSelectAll = () => {
    setSelectedParticipants(
      isAllSelected ? [] : filteredParticipants.map((p) => p.id)
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const updateStatus = async (status: string) => {
    if (selectedParticipants.length === 0) return;
    try {
      await api.put('/events/participants/status', {
        participant_ids: selectedParticipants,
        status_approval: status,
      });
      setSelectedParticipants([]);
      onRefresh(); // Refresh data di screen utama
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
        event_id: eventId,
      });
      setModalVisible(false);
      setEmailInput('');
      onRefresh(); // Refresh data di screen utama
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err.response?.data?.message || 'Email tidak ditemukan.'
      );
    } finally {
      setIsAddingUser(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return { bg: COLORS.successLight, text: COLORS.successText };
      case 'rejected': return { bg: COLORS.dangerLight, text: COLORS.dangerText };
      default: return { bg: COLORS.warningLight, text: COLORS.warningText };
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'pending') return '⏳';
    if (status === 'approved') return '✅';
    return '❌';
  };

  const pendingCount = participants.filter((p) => p.status_approval === 'pending').length;

  const renderParticipantsListContent = () => {
    if (isFetching) {
      return <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />;
    }
    if (filteredParticipants.length === 0) {
      return (
        <View style={styles.emptyPending}>
          <Ghost size={40} color={COLORS.disabled} />
          <Text style={styles.emptyPendingText}>Tidak ada data yang cocok.</Text>
        </View>
      );
    }
    return filteredParticipants.map((item) => {
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
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
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
            <Text style={styles.adminSubtitle}>{pendingCount} menunggu konfirmasi</Text>
          ) : (
            <Text style={[styles.adminSubtitle, { color: COLORS.textSub }]}>
              Total {participants.length} peserta
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <UserPlus size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
        {(['pending', 'approved', 'rejected', 'all'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
            onPress={() => {
              setActiveFilter(filter);
              setSelectedParticipants([]);
            }}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.searchBox}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredParticipants.length > 0 && (
        <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll}>
          <View style={[styles.checkbox, isAllSelected && styles.checkboxActive]}>
            {isAllSelected && <Check size={12} color="#fff" strokeWidth={3} />}
          </View>
          <Text style={styles.selectAllText}>Pilih Semua di tab ini</Text>
        </TouchableOpacity>
      )}

      {renderParticipantsListContent()}

      {selectedParticipants.length > 0 && (
        <View style={styles.bulkActionRow}>
          {activeFilter !== 'rejected' && (
            <TouchableOpacity style={[styles.bulkBtn, styles.bulkReject]} onPress={() => updateStatus('rejected')}>
              <UserX size={16} color={COLORS.dangerText} />
              <Text style={styles.bulkRejectText}>Tolak ({selectedParticipants.length})</Text>
            </TouchableOpacity>
          )}
          {activeFilter !== 'approved' && (
            <TouchableOpacity style={[styles.bulkBtn, styles.bulkApprove]} onPress={() => updateStatus('approved')}>
              <UserCheck size={16} color={COLORS.successText} />
              <Text style={styles.bulkApproveText}>Setujui ({selectedParticipants.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Peserta Manual</Text>
            <Text style={styles.modalDesc}>Peserta yang ditambahkan otomatis berstatus 'Approved'.</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Masukkan email peserta..."
              placeholderTextColor={COLORS.textMuted}
              value={emailInput}
              onChangeText={setEmailInput}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddByEmail} style={styles.modalSubmitBtn} disabled={isAddingUser}>
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
    </View>
  );
}