import { StyleSheet, Dimensions } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext'; // Pastikan path benar

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2;

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.BG },
    scrollContent: { paddingBottom: 40 },

    // --- HEADER SECTION ---
    headerGradient: {
      height: 260,
      paddingTop: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: THEME.CARD,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },
    // Tombol Theme Switcher di pojok kanan atas
    themeToggle: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDarkMode
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    avatarContainer: {
      position: 'relative',
      shadowColor: THEME.ACCENT,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    avatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 30,
      backgroundColor: THEME.ACCENT,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ rotate: '45deg' }],
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      transform: [{ rotate: '-45deg' }],
    },
    nameTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: THEME.TEXT_MAIN,
      marginTop: 20,
      letterSpacing: 0.5,
    },
    roleBadge: {
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
    },
    roleText: {
      color: THEME.ACCENT,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },

    // --- GRID SECTION ---
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 20,
      justifyContent: 'space-between',
    },
    bentoCard: {
      width: CARD_WIDTH,
      backgroundColor: THEME.CARD,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDarkMode
        ? 'rgba(255, 94, 0, 0.1)'
        : 'rgba(255, 94, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    bentoLabel: { color: THEME.TEXT_SUB, fontSize: 12, fontWeight: '500' },
    bentoValue: {
      color: THEME.TEXT_MAIN,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 4,
    },

    // --- ACTION MENU ---
    actionList: { paddingHorizontal: 20 },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.CARD,
      padding: 18,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    menuLabel: {
      flex: 1,
      color: THEME.TEXT_MAIN,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 15,
    },

    adminBanner: {
      margin: 20,
      padding: 20,
      borderRadius: 24,
      backgroundColor: THEME.ACCENT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    adminText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    adminSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

    // --- LOGOUT ---
    logoutContainer: { paddingHorizontal: 20, marginTop: 30, marginBottom: 80 },
    logoutGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#2A1212' : '#FEE2E2',
      paddingVertical: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 59, 48, 0.3)' : '#FFCDD2',
    },
    logoutIconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    logoutButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  });
};
