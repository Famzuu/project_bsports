import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  Mail,
  Settings,
  Key,
  Bell,
  LogOut,
  ChevronRight,
  Activity,
  Map,
  Sun,
  Moon,
  UserCircle,
  Camera,
  X,
  Check,
  Briefcase,
  Phone,
  MapPin,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { getStyles } from '../../style/ProfileStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  // State untuk Edit Form
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [profileImage, setProfileImage] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFullImageVisible, setFullImageVisible] = useState(false);

  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const toggleTheme = useAuthStore(state => state.toggleTheme);
  const logout = useAuthStore(state => state.logout);

  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/user');
      setUserData(data);
      setEditName(data.name || '');
      setEditUnit(data.unit_kerja || '');
      setEditNoHp(data.no_hp || '');
      setEditAlamat(data.alamat || '');
    } catch (e) {
      Alert.alert('Error', 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        compressImageQuality: 0.3,
        includeBase64: true,
        mediaType: 'photo',
      });

      setProfileImage({
        uri: image.path,
        base64: `data:${image.mime};base64,${image.data}`,
      });
    } catch (err: any) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Perhatian', 'Terjadi kesalahan saat memilih gambar.');
      }
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        name: editName,
        unit_kerja: editUnit,
        no_hp: editNoHp,
        alamat: editAlamat,
        image_base64: profileImage ? profileImage.base64 : null,
      };

      await api.post('/user/update', payload);

      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      setProfileImage(null);
      setEditModalVisible(false);
      fetchUserProfile();
    } catch (e: any) {
      console.log('API ERROR:', e.message);
      Alert.alert(
        'Error',
        e.response?.data?.message || 'Gagal memperbarui profil',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <View style={styles.safeArea}>
        <ActivityIndicator color={THEME.ACCENT} style={{ flex: 1 }} />
      </View>
    );

  const isAdmin = Number(userData?.jabatan_id) === 1;

  // Fungsi mandiri untuk render avatar Modal
  const renderAvatarContent = () => {
    if (profileImage) {
      return (
        <Image
          source={{ uri: profileImage.uri }}
          style={[styles.avatarImageLarge, { borderRadius: 40 }]} // Mengunci border radius agar tidak tembus kotak
        />
      );
    }
    if (userData?.foto_profil) {
      return (
        <Image
          source={{ uri: `${userData.foto_profil}?t=${Date.now()}` }}
          style={[styles.avatarImageLarge, { borderRadius: 40 }]}
        />
      );
    }
    return (
      <Text style={styles.avatarTextLarge}>{userData?.name?.charAt(0)}</Text>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP SECTION */}
        <View style={styles.headerGradient}>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            {isDarkMode ? (
              <Sun size={22} color={THEME.ACCENT} />
            ) : (
              <Moon size={22} color={THEME.TEXT_MAIN} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => userData?.foto_profil && setFullImageVisible(true)}
          >
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarCircle, { overflow: 'hidden' }]}>
                {userData?.foto_profil ? (
                  <Image
                    source={{ uri: `${userData.foto_profil}?t=${Date.now()}` }}
                    style={{
                      width: 140,
                      height: 140,
                      transform: [{ rotate: '-45deg' }],
                      position: 'absolute',
                    }}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {userData?.name?.charAt(0)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.nameTitle}>{userData?.name || 'Athlete'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {userData?.unit_kerja || 'BSI Member'}
            </Text>
          </View>
        </View>

        {/* BENTO GRID (Diubah menjadi 4 kotak info) */}
        <View style={styles.gridContainer}>
          <BentoBox
            theme={THEME}
            icon={<Activity size={20} color={THEME.ACCENT} />}
            label="Activities"
            value="24 Sessions"
            styles={styles}
          />
          <BentoBox
            theme={THEME}
            icon={<Phone size={20} color={THEME.ACCENT} />}
            label="Phone"
            value={userData?.no_hp || '-'}
            styles={styles}
          />

          {/* Kolom memanjang untuk Email dan Address */}
          <View style={[styles.bentoCard, { width: '100%', marginTop: 15 }]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <View
                style={[
                  styles.iconWrapper,
                  { marginBottom: 0, marginRight: 12 },
                ]}
              >
                <Mail size={20} color={THEME.ACCENT} />
              </View>
              <View>
                <Text style={styles.bentoLabel}>Email Address</Text>
                <Text style={styles.bentoValue}>{userData?.email || '-'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.iconWrapper,
                  { marginBottom: 0, marginRight: 12 },
                ]}
              >
                <MapPin size={20} color={THEME.ACCENT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bentoLabel}>Home Address</Text>
                <Text style={styles.bentoValue} numberOfLines={2}>
                  {userData?.alamat || 'Belum diatur'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.adminBanner}
            onPress={() => navigation.navigate('AdminEventList')}
          >
            <View>
              <Text style={styles.adminText}>Control Center</Text>
              <Text style={styles.adminSub}>
                Manage all sports events & users
              </Text>
            </View>
            <Map color="#fff" size={28} />
          </TouchableOpacity>
        )}

        {/* SETTINGS LIST */}
        <View style={styles.actionList}>
          <MenuRow
            theme={THEME}
            icon={<UserCircle size={22} color={THEME.ACCENT} />}
            label="Edit Profile"
            styles={styles}
            onPress={() => setEditModalVisible(true)}
          />
        </View>

        {/* LOGOUT */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutGradient}
            onPress={() => logout()}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIconWrapper}>
              <LogOut size={18} color="#FF3B30" strokeWidth={2.5} />
            </View>
            <Text style={styles.logoutButtonText}>Sign Out Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL EDIT PROFILE */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: THEME.BG }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color={THEME.TEXT_MAIN} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={styles.editAvatarContainer}>
                <TouchableOpacity
                  onPress={handleSelectImage}
                  activeOpacity={0.9}
                >
                  <View
                    style={[styles.avatarCircleLarge, { overflow: 'hidden' }]}
                  >
                    {renderAvatarContent()}
                    <View style={styles.cameraIconBadge}>
                      <Camera size={16} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.changePhotoText}>Tap to change photo</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabelHeader}>
                  Personal Information
                </Text>

                <View style={styles.softInputCard}>
                  <UserCircle size={20} color={THEME.ACCENT} />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.tinyLabel}>FULL NAME</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter your name"
                      placeholderTextColor={THEME.TEXT_SUB}
                    />
                  </View>
                </View>

                <View style={styles.softInputCard}>
                  <Briefcase size={20} color={THEME.ACCENT} />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.tinyLabel}>UNIT KERJA / BRANCH</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editUnit}
                      onChangeText={setEditUnit}
                      placeholder="e.g. IT Digital Group"
                      placeholderTextColor={THEME.TEXT_SUB}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.softInputCard}>
                <Phone size={20} color={THEME.ACCENT} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.tinyLabel}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editNoHp}
                    onChangeText={setEditNoHp}
                    placeholder="e.g. 08123456789"
                    placeholderTextColor={THEME.TEXT_SUB}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.softInputCard}>
                <MapPin size={20} color={THEME.ACCENT} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.tinyLabel}>ADDRESS</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editAlamat}
                    onChangeText={setEditAlamat}
                    placeholder="Enter your address"
                    placeholderTextColor={THEME.TEXT_SUB}
                    multiline
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { opacity: isUpdating ? 0.7 : 1 }]}
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Check size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      <Modal 
  visible={isFullImageVisible} 
  transparent={true} 
  animationType="fade"
  onRequestClose={() => setFullImageVisible(false)}
>
  <View style={styles.fullImageOverlay}>
    {/* Tombol Tutup */}
    <TouchableOpacity 
      style={styles.closeFullImage} 
      onPress={() => setFullImageVisible(false)}
    >
      <X size={32} color="#fff" />
    </TouchableOpacity>

    {/* Foto Profil Full */}
    <Image
      source={{ uri: `${userData?.foto_profil}?t=${Date.now()}` }}
      style={styles.fullImageStyle}
      resizeMode="contain"
    />
    
    <Text style={styles.fullImageName}>{userData?.name}</Text>
  </View>
</Modal>
      
    </View>
  );
}

const BentoBox = ({ icon, label, value, styles }: any) => (
  <View style={styles.bentoCard}>
    <View style={styles.iconWrapper}>{icon}</View>
    <Text style={styles.bentoLabel}>{label}</Text>
    <Text style={styles.bentoValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const MenuRow = ({ icon, label, styles, theme, onPress }: any) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress}>
    {icon}
    <Text style={styles.menuLabel}>{label}</Text>
    <ChevronRight size={18} color={theme.BORDER} />
  </TouchableOpacity>
);
