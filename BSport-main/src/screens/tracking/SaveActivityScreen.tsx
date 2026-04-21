import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bike,
  Footprints,
  Flame,
  ChevronLeft,
  Save,
} from 'lucide-react-native';
import api from '../../services/api';
import { styles } from '../../style/SaveActivityStyle';

export default function SaveActivityScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { activityId } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sportType, setSportType] = useState('run');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Pemberitahuan', 'Judul aktivitas wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/activities/${activityId}/save`, {
        title,
        description,
        sport_type: sportType,
      });

      Alert.alert('Berhasil!', 'Aktivitas Anda telah diabadikan.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', state: { routes: [{ name: 'Home' }] } }],
      });
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan aktivitas');
    } finally {
      setLoading(false);
    }
  };

  const sportOptions = [
    { id: 'run', label: 'Lari', icon: Footprints },
    { id: 'ride', label: 'Sepeda', icon: Bike },
    { id: 'walk', label: 'Jalan', icon: Flame },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simpan Aktivitas</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>
            Bagaimana latihan Anda hari ini?
          </Text>

          {/* INPUT TITLE */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Judul Aktivitas</Text>
            <TextInput
              placeholder="Contoh: Lari Pagi Seru"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* SPORT TYPE SELECTOR */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipe Olahraga</Text>
            <View style={styles.sportRow}>
              {sportOptions.map(item => {
                const IconComp = item.icon;
                const isActive = sportType === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.sportBtn, isActive && styles.activeSportBtn]}
                    onPress={() => setSportType(item.id)}
                  >
                    <IconComp size={20} color={isActive ? '#FFF' : '#6B7280'} />
                    <Text
                      style={[
                        styles.sportBtnText,
                        isActive && styles.activeSportBtnText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Catatan (Opsional)</Text>
            <TextInput
              placeholder="Ceritakan sedikit tentang rute atau perasaan Anda..."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.disabledBtn]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Simpan Aktivitas</Text>
                <Save size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
