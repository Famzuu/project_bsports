import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import {
  ChevronLeft,
  Search,
  UserPlus,
  Check,
  UserCheck,
  UserX,
  Ghost,
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore'; // Import Store
import { getStyles } from '../../style/ParticipantStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

export default function AdminParticipants({ route, navigation }: any) {
  const { eventId } = route.params;
  const [participants, setParticipants] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Ambil state tema
  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  const fetchParticipants = async () => {
    try {
      const res = await api.get(`/events/${eventId}/participants`);
      setParticipants(res.data.data);
    } catch (err) {
      console.log(err);
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
    setSelected([]);
  }, []);

  const filteredParticipants = useMemo(() => {
    if (!searchQuery) return participants;
    return participants.filter(
      p =>
        p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [participants, searchQuery]);

  const isAllSelected =
    filteredParticipants.length > 0 &&
    selected.length === filteredParticipants.length;

  const toggleSelectAll = () => {
    setSelected(isAllSelected ? [] : filteredParticipants.map(p => p.id));
  };

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const updateStatus = async (status: string) => {
    if (selected.length === 0) return;
    try {
      await api.put('/events/participants/status', {
        participant_ids: selected,
        status_approval: status,
      });
      Alert.alert(
        'Updated',
        `Successfully updated ${selected.length} participants.`,
      );
      setSelected([]);
      fetchParticipants();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const handleAddByEmail = async () => {
    if (!emailInput) return;
    setIsAdding(true);
    try {
      await api.post('/events/participants/add-by-email', {
        email: emailInput.trim(),
        event_id: eventId,
      });
      setModalVisible(false);
      setEmailInput('');
      fetchParticipants();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Email not found.');
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          bg: isDarkMode ? 'rgba(52, 199, 89, 0.1)' : '#E8F5E9',
          text: isDarkMode ? '#34C759' : '#2E7D32',
        };
      case 'rejected':
        return {
          bg: isDarkMode ? 'rgba(255, 59, 48, 0.1)' : '#FFEBEE',
          text: isDarkMode ? '#FF3B30' : '#C62828',
        };
      default:
        return {
          bg: isDarkMode ? 'rgba(255, 149, 0, 0.1)' : '#FFF4E5',
          text: isDarkMode ? '#FF9500' : '#EF6C00',
        };
    }
  };

  const renderItem = ({ item }: any) => {
    const isSelected = selected.includes(item.id);
    const badgeStyle = getStatusStyle(item.status_approval);

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        style={[styles.card, isSelected && styles.cardSelected]}
        activeOpacity={0.9}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user?.name}</Text>
          <Text style={styles.userEmail}>{item.user?.email}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
            {item.status_approval}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={THEME.TEXT_MAIN} />
          </TouchableOpacity>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.headerTitle}>Participants</Text>
            <Text style={styles.headerSubtitle}>
              {participants.length} registered
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addMemberBtn}
          onPress={() => setModalVisible(true)}
        >
          <UserPlus size={18} color={THEME.TEXT_MAIN} />
          <Text style={styles.addMemberText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarContainer}>
        <View style={styles.searchWrapper}>
          <Search size={18} color={THEME.TEXT_SUB} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={THEME.TEXT_SUB}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.selectAllTouch}
          onPress={toggleSelectAll}
        >
          <View
            style={[styles.checkbox, isAllSelected && styles.checkboxActive]}
          >
            {isAllSelected && <Check size={12} color="#fff" strokeWidth={3} />}
          </View>
          <Text style={styles.selectAllText}>Select All Visible</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={THEME.ACCENT} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filteredParticipants}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.ACCENT}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Ghost size={50} color={THEME.BORDER} />
              <Text style={{ color: THEME.TEXT_SUB, marginTop: 10 }}>
                Empty list
              </Text>
            </View>
          }
        />
      )}

      {selected.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnReject]}
            onPress={() => updateStatus('rejected')}
          >
            <UserX size={18} color={isDarkMode ? '#FF3B30' : '#D32F2F'} />
            <Text
              style={{
                color: isDarkMode ? '#FF3B30' : '#D32F2F',
                fontWeight: 'bold',
                marginLeft: 8,
              }}
            >
              Reject ({selected.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnApprove]}
            onPress={() => updateStatus('approved')}
          >
            <UserCheck size={18} color={isDarkMode ? '#34C759' : '#2E7D32'} />
            <Text
              style={{
                color: isDarkMode ? '#34C759' : '#2E7D32',
                fontWeight: 'bold',
                marginLeft: 8,
              }}
            >
              Approve ({selected.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: THEME.TEXT_MAIN }]}>
              Quick Add
            </Text>
            <Text style={{ color: THEME.TEXT_SUB, marginBottom: 20 }}>
              Enter user email address.
            </Text>
            <TextInput
              style={styles.inputModal}
              placeholder="user@email.com"
              placeholderTextColor={THEME.TEXT_SUB}
              value={emailInput}
              onChangeText={setEmailInput}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ padding: 15 }}
              >
                <Text style={{ color: THEME.TEXT_SUB, fontWeight: '700' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddByEmail}
                style={{
                  backgroundColor: THEME.ACCENT,
                  padding: 15,
                  borderRadius: 15,
                  minWidth: 100,
                  alignItems: 'center',
                }}
              >
                {isAdding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
