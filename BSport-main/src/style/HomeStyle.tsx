import { StyleSheet, Dimensions } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext'; 

const { width } = Dimensions.get('window');

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;
  
  // 🔥 Warna border khusus untuk efek modern/neon di Dark Mode
  // Menggunakan kode hex + persentase opacity (misal: '80' = 50% transparan, '4D' = 30%)
  const neonBorderMain = isDarkMode ? THEME.ACCENT : 'transparent';
  const neonBorderSubtle = isDarkMode ? `${THEME.ACCENT}66` : THEME.BORDER; // 40% Opacity di dark mode
  const glowShadow = isDarkMode ? THEME.ACCENT : '#000';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.BG,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 15,
      backgroundColor: THEME.BG,
    },
    headerGreeting: {
      fontSize: 14,
      color: THEME.TEXT_SUB,
      marginBottom: 2,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: THEME.ACCENT, 
      letterSpacing: 1,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: THEME.CARD,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: neonBorderSubtle, // Sedikit borderline di icon header
    },
    scrollContent: {
      paddingBottom: 100,
    },
    
    // Banner
    bannerContainer: {
      marginTop: 15,
      marginBottom: 20,
    },
    bannerWrapper: {
      width: '100%',
      height: 160,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: neonBorderSubtle, // Border tipis orange di banner
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    bannerOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 15,
      backgroundColor: 'rgba(0,0,0,0.6)', 
    },
    bannerTitle: {
      color: '#FFFFFF', 
      fontSize: 18,
      fontWeight: 'bold',
    },
    bannerSubtitle: {
      color: '#E5E7EB', 
      fontSize: 12,
      marginTop: 4,
    },

    // Dot Indicators
    dotContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: THEME.BORDERLINE,
      marginHorizontal: 4,
    },
    dotActive: {
      width: 16,
      backgroundColor: THEME.ACCENT,
    },

    // Menus
    menuGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    menuItem: {
      alignItems: 'center',
      width: (width - 40) / 4,
    },
    menuIconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: neonBorderSubtle, // Efek kotak menu modern
    },
    menuText: {
      fontSize: 12,
      fontWeight: '600',
      color: THEME.TEXT_MAIN,
    },

    // Dashboard Summary
    dashboardWrapper: {
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: THEME.TEXT_MAIN,
      marginBottom: 12,
    },
    dashboardGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    mainDashboardCard: {
      flex: 1,
      backgroundColor: isDarkMode ? THEME.CARD : '#111827',
      // 🔥 Menerapkan Border Neon Terang
      borderWidth: isDarkMode ? 1.5 : 0,
      borderColor: neonBorderMain, 
      borderRadius: 20,
      padding: 20,
      justifyContent: 'center',
      // 🔥 Menerapkan Glow Hitam/Orange
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.4 : 0.2,
      shadowRadius: 10,
      elevation: isDarkMode ? 8 : 5, 
    },
    dashboardIconBg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDarkMode ? `${THEME.ACCENT}25` : 'rgba(248, 173, 60, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    dashboardValue: {
      fontSize: 28,
      fontWeight: '900',
      color: isDarkMode ? THEME.TEXT_MAIN : '#FFFFFF',
    },
    dashboardUnit: {
      fontSize: 16,
      color: isDarkMode ? THEME.TEXT_SUB : '#9CA3AF',
      fontWeight: '600',
    },
    dashboardLabel: {
      fontSize: 14,
      color: isDarkMode ? THEME.TEXT_SUB : '#9CA3AF',
      marginTop: 4,
    },
    dashboardSubGrid: {
      flex: 1,
      justifyContent: 'space-between',
      gap: 12,
    },
    subDashboardCard: {
      backgroundColor: THEME.CARD,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      // 🔥 Menerapkan Border Neon Halus
      borderWidth: 1,
      borderColor: neonBorderSubtle,
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: isDarkMode ? 4 : 2,
    },
    subDashboardValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: THEME.TEXT_MAIN,
    },
    subDashboardLabel: {
      fontSize: 12,
      color: THEME.TEXT_SUB,
    },

    // FEED STYLES
    feedWrapper: {
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: THEME.ACCENT,
    },
    activityCard: {
      backgroundColor: THEME.CARD,
      borderRadius: 16,
      padding: 16,
      // 🔥 Menerapkan Border Neon Halus
      borderWidth: 1,
      borderColor: neonBorderSubtle,
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.2 : 0.1,
      shadowRadius: 8,
      marginBottom: 20,
      elevation: isDarkMode ? 4 : 3,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: THEME.ACCENT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: THEME.TEXT_MAIN,
    },
    activityMeta: {
      fontSize: 12,
      color: THEME.TEXT_SUB,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    activityStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statCol: {
      flex: 1,
    },
    statLabel: {
      fontSize: 12,
      color: THEME.TEXT_SUB,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: THEME.TEXT_MAIN,
    },
    mapContainer: {
      height: 180,
      width: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: THEME.INPUT_BG,
      borderWidth: 1,
      borderColor: neonBorderSubtle, // Border peta disamakan
    },
    noMapContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: THEME.INPUT_BG,
    }
  });
};