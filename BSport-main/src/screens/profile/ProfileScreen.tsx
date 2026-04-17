import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import jembatan API dan Brankas Token kita
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

// Dimensi untuk layout
const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 180;

// Warna Dominan
const PRIMARY_COLOR = '#F8AD3C';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil fungsi logout pintar dari Zustand
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation<any>();

  // Otomatis tarik data dari Laravel saat layar dibuka
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user');

      console.log('USER DATA:', response.data); // 🔥 TARUH DI SINI

      setUserData(response.data);
    } catch (error) {
      console.log('Gagal mengambil profil:', error);
      Alert.alert('Error', 'Gagal mengambil data profil terbaru.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Konfirmasi Logout',
      "Apakah Anda yakin ingin keluar dari sesi B'Sports?",
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Beri tahu Laravel untuk menghapus token di server
              await api.post('/logout');
            } catch (error) {
              console.log('Error server logout', error);
            } finally {
              // 2. Hapus token di HP. AppNavigator akan otomatis pindah layar
              logout();
            }
          },
        },
      ],
    );
  };

  // Fungsi pintar untuk mengambil inisial nama
  const getInitials = (name: string) => {
    if (!name) return 'BS';
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  };

  // Komponen Reusable untuk Menu Item agar rapi
  const MenuItem = ({
    icon,
    title,
    onPress,
    isHazard = false,
    showArrow = true,
  }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={[styles.menuText, isHazard && { color: '#DC2626' }]}>
          {title}
        </Text>
      </View>
      {showArrow && !isHazard && <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Memuat Profil...</Text>
      </View>
    );
  }

  // Cek apakah user adalah admin (jabatan_id === 1)
  const isAdmin = Number(userData?.jabatan_id) === 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern Header Bagian Atas */}
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profil Saya</Text>
          </View>
        </View>

        {/* Profil Card (Avatar & Info Utama) - Floating */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getInitials(userData?.name)}
              </Text>
            </View>
            {/* Tombol edit kecil di avatar (opsional visual) */}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {userData?.name || 'User B-Sports'}
          </Text>

          {/* Label Unit Kerja yang stylish */}
          <View style={styles.unitBadge}>
            <Text style={styles.unitBadgeText}>
              🏢 {userData?.unit_kerja || 'BSI Group'}
            </Text>
          </View>
        </View>

        {/* Section Detail Informasi */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData?.email || '-'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Status Pegawai</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: PRIMARY_COLOR, fontWeight: 'bold' },
                ]}
              >
                {isAdmin ? 'Admin' : 'Anggota'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Menu Utama */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pengaturan & Tindakan</Text>
          <View style={styles.menuCard}>
            {/* --- PENEMPATAN TOMBOL ADMIN YANG MENARIK --- */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminMenuItem}
                onPress={() => navigation.navigate('AdminEventList')}
                activeOpacity={0.8}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={[styles.menuIcon, { color: '#fff' }]}>🛡️</Text>
                  <Text style={styles.adminMenuText}>Panel Kontrol Admin</Text>
                </View>
                <Text style={styles.adminMenuArrow}>Kelola Event ›</Text>
              </TouchableOpacity>
            )}
            {/* ----------------------------------------------- */}

            <MenuItem
              icon="⚙️"
              title="Pengaturan Akun"
              onPress={() => Alert.alert('Fitur', 'Menu Pengaturan')}
            />
            <MenuItem
              icon="🔒"
              title="Ganti Password"
              onPress={() => Alert.alert('Fitur', 'Menu Ganti Password')}
            />
            <MenuItem
              icon="🔔"
              title="Notifikasi"
              onPress={() => Alert.alert('Fitur', 'Menu Notifikasi')}
            />
          </View>
        </View>

        {/* Tombol Logout terpisah di bawah agar tidak tidak sengaja terpencet */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Keluar dari Aplikasi</Text>
        </TouchableOpacity>

        {/* Padding bawah ekstra agar tidak tertutup Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F9' },
  scrollView: { flex: 1 },
  scrollContent: { alignItems: 'center' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F9',
  },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },

  // Header Melengkung
  headerBackground: {
    backgroundColor: PRIMARY_COLOR,
    width: width,
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 24,
    position: 'absolute',
    top: 0,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Profile Card (Floating)
  profileCard: {
    backgroundColor: '#FFFFFF',
    width: width * 0.9,
    borderRadius: 20,
    padding: 20,
    marginTop: HEADER_HEIGHT - 70, // Mengambang di atas header
    alignItems: 'center',
    // Shadow untuk iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Shadow untuk Android
    elevation: 8,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -60, // Menaikkan avatar
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    // Efek glow halus
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E4E9F2',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1E',
    marginTop: 15,
    textAlign: 'center',
  },

  unitBadge: {
    backgroundColor: '#FFF8ED', // Orange super muda
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FEEFC3',
  },
  unitBadgeText: { fontSize: 13, color: PRIMARY_COLOR, fontWeight: '600' },

  // Sections
  sectionContainer: {
    width: width * 0.9,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 10,
    marginLeft: 5,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  infoLabel: { fontSize: 14, color: '#6C757D' },
  infoValue: { fontSize: 14, color: '#1A1C1E', fontWeight: '500' },

  // Menu Card
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden', // Agar admin item radiusnya ikut container
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 18, marginRight: 15, width: 25, textAlign: 'center' },
  menuText: { fontSize: 15, fontWeight: '500', color: '#1A1C1E' },
  menuArrow: { fontSize: 20, color: '#C1C7CD', fontWeight: '300' },

  // Speasial Styling untuk Admin Menu
  adminMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#343A40', // Gelap agar kontras dan premium
    borderBottomWidth: 1,
    borderBottomColor: '#495057',
  },
  adminMenuText: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  adminMenuArrow: { fontSize: 12, color: PRIMARY_COLOR, fontWeight: '600' },

  // Logout Button Modern
  logoutButton: {
    flexDirection: 'row',
    width: width * 0.9,
    backgroundColor: '#FFF1F1',
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD9D9',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutIcon: { fontSize: 16, marginRight: 10 },
  logoutButtonText: { color: '#DC2626', fontSize: 16, fontWeight: 'bold' },
});
