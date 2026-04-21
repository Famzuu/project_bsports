import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Type,
  AlignLeft,
  MapPin,
  Layers,
  Calendar,
  Activity,
  Check,
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore'; // Import Store
import { getStyles } from '../../style/CreateEventStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

export default function AdminCreateEvent({ navigation }: any) {
  // State Form
  const [namaEvent, setNamaEvent] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [targetJarak, setTargetJarak] = useState('');
  const [tipeLomba, setTipeLomba] = useState('virtual');
  const [status, setStatus] = useState('upcoming');
  const [statusAktif, setStatusAktif] = useState(true);

  // State Tema Dinamis
  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  const [jadwalStart, setJadwalStart] = useState(
    new Date().toISOString().slice(0, 19).replace('T', ' '),
  );
  const [jadwalSelesai, setJadwalSelesai] = useState(
    new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '),
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!namaEvent || !targetJarak || !jadwalStart || !jadwalSelesai) {
      Alert.alert('Attention', 'Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        nama_event: namaEvent,
        tipe_lomba: tipeLomba,
        target_jarak: parseFloat(targetJarak),
        deskripsi: deskripsi || null,
        status: status,
        jadwal_start: jadwalStart,
        jadwal_selesai: jadwalSelesai,
        status_aktif: statusAktif,
      };
      await api.post('/events', payload);
      Alert.alert('Success', 'Event has been published.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.message || 'Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={THEME.TEXT_MAIN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Event</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <InputLabel
            icon={<Type size={16} color={THEME.ACCENT} />}
            label="Event Name"
            required
            theme={THEME}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g. BSI Midnight Run"
            placeholderTextColor={THEME.TEXT_SUB}
            value={namaEvent}
            onChangeText={setNamaEvent}
          />

          <InputLabel
            icon={<AlignLeft size={16} color={THEME.ACCENT} />}
            label="Description"
            theme={THEME}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Race rules..."
            placeholderTextColor={THEME.TEXT_SUB}
            value={deskripsi}
            onChangeText={setDeskripsi}
            multiline
          />

          <InputLabel
            icon={<MapPin size={16} color={THEME.ACCENT} />}
            label="Target (KM)"
            required
            theme={THEME}
          />
          <TextInput
            style={styles.input}
            placeholder="10"
            placeholderTextColor={THEME.TEXT_SUB}
            value={targetJarak}
            onChangeText={setTargetJarak}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Event Configuration</Text>
          <InputLabel
            icon={<Layers size={16} color={THEME.ACCENT} />}
            label="Race Type"
            theme={THEME}
          />
          <View style={styles.segmentContainer}>
            <SegmentBtn
              active={tipeLomba === 'virtual'}
              label="Virtual"
              onPress={() => setTipeLomba('virtual')}
              styles={styles}
            />
            <SegmentBtn
              active={tipeLomba === 'live'}
              label="Live Race"
              onPress={() => setTipeLomba('live')}
              styles={styles}
            />
          </View>

          <InputLabel
            icon={<Activity size={16} color={THEME.ACCENT} />}
            label="Status"
            theme={THEME}
          />
          <View style={styles.segmentContainer}>
            {['upcoming', 'ongoing'].map(s => (
              <SegmentBtn
                key={s}
                active={status === s}
                label={s.toUpperCase()}
                onPress={() => setStatus(s)}
                styles={styles}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline & Visibility</Text>
          <InputLabel
            icon={<Calendar size={16} color={THEME.ACCENT} />}
            label="Start Date"
            required
            theme={THEME}
          />
          <TextInput
            style={styles.input}
            value={jadwalStart}
            onChangeText={setJadwalStart}
          />

          <InputLabel
            icon={<Calendar size={16} color={THEME.ACCENT} />}
            label="End Date"
            required
            theme={THEME}
          />
          <TextInput
            style={styles.input}
            value={jadwalSelesai}
            onChangeText={setJadwalSelesai}
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Active Status</Text>
              <Text style={styles.switchDesc}>Visible to participants</Text>
            </View>
            <Switch
              trackColor={{
                false: THEME.BORDER,
                true: 'rgba(255, 94, 0, 0.4)',
              }}
              thumbColor={statusAktif ? THEME.ACCENT : '#f4f3f4'}
              onValueChange={setStatusAktif}
              value={statusAktif}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          style={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Check size={20} color="#fff" strokeWidth={3} />
              <Text style={styles.submitBtnText}>Publish Event</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components
const InputLabel = ({ icon, label, required, theme }: any) => (
  <View
    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
  >
    {icon}
    <Text
      style={{
        fontSize: 14,
        fontWeight: '600',
        color: theme.TEXT_MAIN,
        marginLeft: 8,
      }}
    >
      {label}
    </Text>
    {required && <Text style={{ color: theme.ACCENT, marginLeft: 4 }}>*</Text>}
  </View>
);

const SegmentBtn = ({ active, label, onPress, styles }: any) => (
  <TouchableOpacity
    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
    onPress={onPress}
  >
    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);
