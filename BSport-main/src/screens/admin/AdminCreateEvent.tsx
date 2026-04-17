import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api';

const PRIMARY_COLOR = '#F8AD3C';
const BG_COLOR = '#F1F2F6';
const TEXT_DARK = '#242428';
const TEXT_MUTED = '#6B6B76';

export default function AdminCreateEvent({ navigation }: any) {
  // --- STATE FORM ---
  const [namaEvent, setNamaEvent] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [targetJarak, setTargetJarak] = useState('');
  const [tipeLomba, setTipeLomba] = useState('virtual'); // 'virtual' | 'live'
  const [status, setStatus] = useState('upcoming'); // 'upcoming' | 'ongoing' | 'completed'
  const [statusAktif, setStatusAktif] = useState(true);
  
  // State Tanggal (Format sederhana YYYY-MM-DD HH:MM:SS)
  // Untuk di production, disarankan menggunakan library seperti @react-native-community/datetimepicker
  const [jadwalStart, setJadwalStart] = useState(new Date().toISOString().slice(0, 19).replace('T', ' '));
  const [jadwalSelesai, setJadwalSelesai] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' ')
  );

  const [isLoading, setIsLoading] = useState(false);

  // --- FUNGSI SUBMIT ---
  const handleCreate = async () => {
    // Validasi dasar
    if (!namaEvent || !targetJarak || !jadwalStart || !jadwalSelesai) {
      Alert.alert('Perhatian', 'Harap isi semua field yang wajib (Nama, Jarak, Jadwal).');
      return;
    }

    setIsLoading(true);
    try {
      // Menyesuaikan dengan payload Laravel Validation
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

      Alert.alert('Sukses', 'Event berhasil dibuat', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.log('Error Create Event:', err.response?.data || err.message);
      Alert.alert(
        'Gagal Menyimpan', 
        err.response?.data?.message || 'Terjadi kesalahan saat membuat event.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Event Baru</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* KARTU 1: Informasi Dasar */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Dasar</Text>
          
          <Text style={styles.label}>Nama Event <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: BSI Run 10K 2026"
            placeholderTextColor="#A0A0A0"
            value={namaEvent}
            onChangeText={setNamaEvent}
          />

          <Text style={styles.label}>Deskripsi Event</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tulis detail event di sini..."
            placeholderTextColor="#A0A0A0"
            value={deskripsi}
            onChangeText={setDeskripsi}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Target Jarak (KM) <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 10"
            placeholderTextColor="#A0A0A0"
            value={targetJarak}
            onChangeText={setTargetJarak}
            keyboardType="numeric"
          />
        </View>

        {/* KARTU 2: Tipe & Status */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pengaturan Lomba</Text>
          
          <Text style={styles.label}>Tipe Lomba</Text>
          <View style={styles.segmentContainer}>
            <TouchableOpacity 
              style={[styles.segmentBtn, tipeLomba === 'virtual' && styles.segmentBtnActive]}
              onPress={() => setTipeLomba('virtual')}
            >
              <Text style={[styles.segmentText, tipeLomba === 'virtual' && styles.segmentTextActive]}>📱 Virtual</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, tipeLomba === 'live' && styles.segmentBtnActive]}
              onPress={() => setTipeLomba('live')}
            >
              <Text style={[styles.segmentText, tipeLomba === 'live' && styles.segmentTextActive]}>🏁 Live</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Status Event</Text>
          <View style={styles.segmentContainer}>
            {['upcoming', 'ongoing', 'completed'].map((stat) => (
              <TouchableOpacity 
                key={stat}
                style={[styles.segmentBtn, status === stat && styles.segmentBtnActive]}
                onPress={() => setStatus(stat)}
              >
                <Text style={[styles.segmentText, status === stat && styles.segmentTextActive, { textTransform: 'capitalize' }]}>
                  {stat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* KARTU 3: Jadwal & Visibilitas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Jadwal & Visibilitas</Text>

          <Text style={styles.label}>Jadwal Mulai <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM:SS"
            value={jadwalStart}
            onChangeText={setJadwalStart}
          />

          <Text style={styles.label}>Jadwal Selesai <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM:SS"
            value={jadwalSelesai}
            onChangeText={setJadwalSelesai}
          />

          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>Aktifkan Event</Text>
              <Text style={styles.switchDesc}>Event yang aktif dapat dilihat oleh user.</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D1D6', true: '#FFE0B2' }}
              thumbColor={statusAktif ? PRIMARY_COLOR : '#f4f3f4'}
              onValueChange={setStatusAktif}
              value={statusAktif}
            />
          </View>
        </View>

        {/* TOMBOL SIMPAN */}
        <TouchableOpacity
          onPress={handleCreate}
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Simpan Event</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG_COLOR },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: { fontSize: 22, color: TEXT_DARK, fontWeight: '600', marginTop: -2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: TEXT_DARK },

  scrollContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
    paddingBottom: 8,
  },
  
  label: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, marginBottom: 8 },
  required: { color: '#DC2626' },
  
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_DARK,
    marginBottom: 16,
  },
  textArea: { minHeight: 100 },

  // Segmented Control (Pilihan Tipe/Status)
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: { fontSize: 14, fontWeight: '500', color: TEXT_MUTED },
  segmentTextActive: { color: PRIMARY_COLOR, fontWeight: '700' },

  // Switch Aktif/Nonaktif
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: { fontSize: 15, fontWeight: '600', color: TEXT_DARK },
  switchDesc: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },

  // Submit Button
  submitBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});