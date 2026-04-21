import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
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
} from 'lucide-react-native';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { getStyles } from '../../style/ProfileStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil state tema dari Zustand
  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const toggleTheme = useAuthStore(state => state.toggleTheme);
  const logout = useAuthStore(state => state.logout);

  // Inisialisasi style dinamis
  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/user');
      setUserData(data);
    } catch (e) {
      Alert.alert('Error', 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <View style={styles.safeArea}>
        <ActivityIndicator color={THEME.ACCENT} style={{ flex: 1 }} />
      </View>
    );

  const isAdmin = Number(userData?.jabatan_id) === 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP SECTION */}
        <View style={styles.headerGradient}>
          {/* TOMBOL THEME SWITCHER */}
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            {isDarkMode ? (
              <Sun size={22} color={THEME.ACCENT} />
            ) : (
              <Moon size={22} color={THEME.TEXT_MAIN} />
            )}
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userData?.name?.charAt(0)}</Text>
            </View>
          </View>
          <Text style={styles.nameTitle}>{userData?.name || 'Athlete'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {userData?.unit_kerja || 'BSI Member'}
            </Text>
          </View>
        </View>

        {/* BENTO GRID */}
        <View style={styles.gridContainer}>
          <BentoBox
            theme={THEME}
            icon={<Mail size={20} color={THEME.ACCENT} />}
            label="Email"
            value={userData?.email?.split('@')[0]}
            styles={styles}
          />
          <BentoBox
            theme={THEME}
            icon={<Activity size={20} color={THEME.ACCENT} />}
            label="Activities"
            value="24 Sessions"
            styles={styles}
          />
        </View>

        {/* ADMIN SPECIAL ACCESS */}
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
            icon={<Settings size={22} color={THEME.TEXT_SUB} />}
            label="Preferences"
            styles={styles}
          />
          <MenuRow
            theme={THEME}
            icon={<Key size={22} color={THEME.TEXT_SUB} />}
            label="Privacy & Security"
            styles={styles}
          />
          <MenuRow
            theme={THEME}
            icon={<Bell size={22} color={THEME.TEXT_SUB} />}
            label="Notification Center"
            styles={styles}
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
    </SafeAreaView>
  );
}

// Sub-components dengan props styles dinamis
const BentoBox = ({ icon, label, value, styles }: any) => (
  <View style={styles.bentoCard}>
    <View style={styles.iconWrapper}>{icon}</View>
    <Text style={styles.bentoLabel}>{label}</Text>
    <Text style={styles.bentoValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const MenuRow = ({ icon, label, styles, theme }: any) => (
  <TouchableOpacity style={styles.menuRow}>
    {icon}
    <Text style={styles.menuLabel}>{label}</Text>
    <ChevronRight size={18} color={theme.BORDER} />
  </TouchableOpacity>
);
