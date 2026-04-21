import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import {
  ChevronLeft,
  Plus,
  Users,
  Trash2,
  Calendar,
  LayoutGrid,
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore'; // Import Store
import { getStyles } from '../../style/ListEventStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

export default function AdminEventList({ navigation }: any) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil state tema
  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.data);
    } catch (err) {
      console.log('Error:', err);
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
      'Delete Event',
      'This action is permanent and will remove all participant data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/events/${id}`);
              fetchEvents();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete',
              );
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
          <View style={styles.titleWrapper}>
            <Text style={styles.eventTitle}>{item.nama_event}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                borderColor: isActive ? THEME.SUCCESS : THEME.TEXT_SUB,
                backgroundColor: isActive
                  ? 'rgba(52, 199, 89, 0.1)'
                  : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isActive ? THEME.SUCCESS : THEME.TEXT_SUB },
              ]}
            >
              {item.status || 'Draft'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={14} color={THEME.TEXT_SUB} />
          <Text style={styles.infoText}>B-Sports Internal Event</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.btnManage}
            onPress={() =>
              navigation.navigate('AdminParticipants', { eventId: item.id })
            }
          >
            <Users size={18} color={THEME.TEXT_MAIN} />
            <Text style={styles.btnManageText}>Manage Participants</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnDelete}
            onPress={() => handleDelete(item.id)}
          >
            <Trash2 size={18} color={THEME.DANGER} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* StatusBar dinamis */}
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={THEME.TEXT_MAIN} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSubtitle}>
            Manage your sports competitions
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={THEME.ACCENT} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.ACCENT}
              colors={[THEME.ACCENT]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LayoutGrid size={48} color={THEME.BORDER} />
              <Text style={styles.emptyText}>No events found.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdminCreateEvent')}
      >
        <Plus size={30} color="#fff" strokeWidth={3} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
