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
  Image,
  StyleSheet,
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
  UploadCloud,
} from 'lucide-react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-date-picker';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { getStyles } from '../../style/CreateEventStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

export default function AdminCreateEvent({ navigation }: any) {
  const [namaEvent, setNamaEvent] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [targetJarak, setTargetJarak] = useState('');
  const [tipeLomba, setTipeLomba] = useState('virtual');
  const [status, setStatus] = useState('upcoming');
  const [statusAktif, setStatusAktif] = useState(true);

  const [imageObj, setImageObj] = useState<any>(null);

  const [jadwalStart, setJadwalStart] = useState(new Date());
  const [jadwalSelesai, setJadwalSelesai] = useState(
    new Date(Date.now() + 86400000),
  );
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(false);

  const formatTanggalUI = (date: Date) => {
    return date.toLocaleString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTanggalDB = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  };

  // 🔥 1. UBAH GAMBAR JADI TEKS (BASE64)
  const handlePickImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 400,
      cropping: true,
      compressImageQuality: 0.7,
      mediaType: 'photo',
      forceJpg: true,
      includeBase64: true, // INI KUNCI UTAMANYA!
    })
      .then(image => {
        setImageObj({
          uri: image.path, // Untuk preview di layar HP
          base64: `data:${image.mime};base64,${image.data}`, // Teks gambar untuk dikirim ke Laravel
        });
      })
      .catch(err => console.log('Batal pilih gambar', err));
  };

  // 🔥 2. KIRIM SEBAGAI JSON BIASA (TIDAK PAKAI FORMDATA)
  const handleCreate = async () => {
    if (!namaEvent || !targetJarak || !jadwalStart || !jadwalSelesai) {
      Alert.alert('Perhatian', 'Harap isi semua kolom wajib (*).');
      return;
    }
    setIsLoading(true);

    try {
      // Kita bungkus jadi objek JSON biasa, bukan FormData
      const payload = {
        nama_event: namaEvent,
        tipe_lomba: tipeLomba,
        target_jarak: targetJarak,
        deskripsi: deskripsi || '',
        status: status,
        jadwal_start: formatTanggalDB(jadwalStart),
        jadwal_selesai: formatTanggalDB(jadwalSelesai),
        status_aktif: statusAktif ? 1 : 0,
        image_base64: imageObj ? imageObj.base64 : null, // Kirim gambar berupa teks!
      };

      await api.post('/events', payload); // Axios akan otomatis mengirim sebagai application/json

      Alert.alert('Sukses', 'Event berhasil dipublish.', [
        { text: 'Selesai', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.log('ERROR:', err?.response?.data || err.message);
      Alert.alert(
        'Gagal',
        err?.response?.data?.message || 'Gagal mengupload data',
      );
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
        {/* EVENT BANNER */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Event Banner</Text>
          <TouchableOpacity
            style={localStyles.imageUploadBox}
            onPress={handlePickImage}
          >
            {imageObj ? (
              <Image
                source={{ uri: imageObj.uri }}
                style={localStyles.previewImage}
              />
            ) : (
              <View style={localStyles.uploadPlaceholder}>
                <UploadCloud size={40} color={THEME.ACCENT} />
                <Text
                  style={[localStyles.uploadText, { color: THEME.TEXT_SUB }]}
                >
                  Tap to upload & crop (2:1)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* BASIC INFORMATION */}
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

        {/* EVENT CONFIGURATION */}
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

        {/* TIMELINE & VISIBILITY */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline & Visibility</Text>
          <InputLabel
            icon={<Calendar size={16} color={THEME.ACCENT} />}
            label="Start Date"
            required
            theme={THEME}
          />
          <TouchableOpacity
            style={localStyles.dateButton}
            onPress={() => setOpenStartPicker(true)}
          >
            <Text style={{ color: THEME.TEXT_MAIN, fontSize: 15 }}>
              {formatTanggalUI(jadwalStart)}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={openStartPicker}
            date={jadwalStart}
            mode="datetime"
            locale="id-ID"
            onConfirm={date => {
              setOpenStartPicker(false);
              setJadwalStart(date);
            }}
            onCancel={() => setOpenStartPicker(false)}
          />

          <InputLabel
            icon={<Calendar size={16} color={THEME.ACCENT} />}
            label="End Date"
            required
            theme={THEME}
          />
          <TouchableOpacity
            style={localStyles.dateButton}
            onPress={() => setOpenEndPicker(true)}
          >
            <Text style={{ color: THEME.TEXT_MAIN, fontSize: 15 }}>
              {formatTanggalUI(jadwalSelesai)}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={openEndPicker}
            date={jadwalSelesai}
            mode="datetime"
            locale="id-ID"
            minimumDate={jadwalStart}
            onConfirm={date => {
              setOpenEndPicker(false);
              setJadwalSelesai(date);
            }}
            onCancel={() => setOpenEndPicker(false)}
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

const localStyles = StyleSheet.create({
  dateButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  imageUploadBox: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadText: { marginTop: 8, fontSize: 14, fontWeight: '500' },
});
