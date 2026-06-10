import { StyleSheet, Dimensions } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2;

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;

  // 🔥 Konsistensi Warna Neon Border & Glow dari HomeScreen
  const neonBorderMain = isDarkMode ? THEME.ACCENT : 'transparent';
  const neonBorderSubtle = isDarkMode ? `${THEME.ACCENT}66` : THEME.BORDER; // 40% Opacity
  const glowShadow = isDarkMode ? THEME.ACCENT : '#000';

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.BG },
    scrollContent: { paddingBottom: 40 },

    // --- HEADER SECTION ---
    headerGradient: {
      paddingTop: 20,
      paddingBottom: 25, // Sedikit diperbesar agar avatar tidak terlalu sesak
      alignItems: 'center',
      backgroundColor: isDarkMode ? THEME.CARD : '#FFFFFF',
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      // 🔥 Tambahkan Efek Border Bawah Terang & Shadow Glow
      borderBottomWidth: isDarkMode ? 1.5 : 0,
      borderColor: neonBorderMain,
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 15,
      elevation: isDarkMode ? 10 : 5,
    },
    themeToggle: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: neonBorderSubtle, // 🔥 Samakan style border
      zIndex: 10,
    },
    
    // --- AVATAR DI HALAMAN UTAMA ---
    avatarContainer: {
      position: 'relative',
      shadowColor: glowShadow, // 🔥 Menggunakan glow neon
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.5 : 0.2,
      shadowRadius: 20,
      elevation: 15,
      marginTop: 10,
    },
    avatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 30,
      backgroundColor: THEME.ACCENT,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ rotate: '45deg' }],
      overflow: 'hidden',
      borderWidth: isDarkMode ? 1.5 : 0, // 🔥 Garis pinggir avatar
      borderColor: THEME.CARD, 
    },
    avatarImage: {
      width: 150,
      height: 150,
      transform: [{ rotate: '-45deg' }],
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      transform: [{ rotate: '-45deg' }],
    },

    fullImageOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeFullImage: {
      position: 'absolute',
      top: 50,
      right: 25,
      zIndex: 20,
      padding: 10,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 50,
    },
    fullImageStyle: {
      width: width,
      height: width,
    },
    fullImageName: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      marginTop: 20,
      letterSpacing: 1,
    },
    
    // --- TEXT HEADER ---
    nameTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: THEME.TEXT_MAIN,
      marginTop: 20,
      letterSpacing: 0.5,
    },
    roleBadge: {
      backgroundColor: isDarkMode ? 'rgba(255, 94, 0, 0.1)' : 'rgba(255, 94, 0, 0.05)', // Bernuansa Accent
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: neonBorderSubtle, // 🔥 Beri outline tipis
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
      // 🔥 Styling Neon Border Card (seperti Home)
      borderWidth: 1,
      borderColor: neonBorderSubtle,
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: isDarkMode ? 4 : 2,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255, 94, 0, 0.15)' : 'rgba(255, 94, 0, 0.05)',
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
      // 🔥 Styling Neon Border List Row
      borderWidth: 1,
      borderColor: neonBorderSubtle,
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: isDarkMode ? 4 : 2,
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
      // 🔥 Beri efek Glow tebal pada Banner Orange!
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.6 : 0.3,
      shadowRadius: 15,
      elevation: 8,
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
      borderColor: isDarkMode ? 'rgba(255, 59, 48, 0.5)' : '#FFCDD2',
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

    // --- MODAL ---
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: neonBorderSubtle, // 🔥 Samakan style garis pemisah
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: THEME.TEXT_MAIN,
    },

    // --- AVATAR DI MODAL EDIT ---
    editAvatarContainer: {
      alignItems: 'center',
      marginVertical: 30,
    },
    avatarCircleLarge: {
      width: 120,
      height: 120,
      borderRadius: 35,
      backgroundColor: THEME.ACCENT,
      justifyContent: 'center', 
      alignItems: 'center',    
      transform: [{ rotate: '45deg' }],
      overflow: 'hidden', 
      borderWidth: isDarkMode ? 2 : 0, // 🔥 Garis outline avatar
      borderColor: THEME.CARD, 
    },
    avatarImageLarge: {
      width: 180, 
      height: 180, 
      transform: [{ rotate: '-45deg' }],
    },
    avatarTextLarge: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#fff',
      transform: [{ rotate: '-45deg' }],
    },
    cameraIconBadge: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: THEME.CARD, // Ubah jadi warna tema
      padding: 8,
      borderRadius: 12,
      transform: [{ rotate: '-45deg' }],
      borderWidth: 1,
      borderColor: neonBorderMain, // Ikon kamera ada neonnya sedikit!
      zIndex: 10, 
    },
    changePhotoText: {
      marginTop: 25,
      color: THEME.ACCENT,
      fontSize: 14,
      fontWeight: '600',
    },

    // Soft Card Inputs
    inputGroup: { marginTop: 10 },
    inputLabelHeader: {
      color: THEME.TEXT_MAIN,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 15,
    },
    softInputCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.CARD,
      padding: 15,
      borderRadius: 20,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: neonBorderSubtle, // Sama dengan bento card
    },
    tinyLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: THEME.TEXT_SUB,
      letterSpacing: 1,
      marginBottom: 2,
    },
    modalTextInput: {
      fontSize: 16,
      color: THEME.TEXT_MAIN,
      fontWeight: '600',
      padding: 0,
    },

    // Save Button
    saveButton: {
      backgroundColor: THEME.ACCENT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      borderRadius: 20,
      marginTop: 20,
      // 🔥 Menerapkan Glow
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDarkMode ? 0.6 : 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },
  });
};