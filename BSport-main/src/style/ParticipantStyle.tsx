import { StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext'; // Sesuaikan path theme Anda

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.BG },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: THEME.CARD,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.TEXT_MAIN },
    headerSubtitle: { fontSize: 13, color: THEME.ACCENT, fontWeight: '600' },

    addMemberBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    addMemberText: {
      color: THEME.TEXT_MAIN,
      fontWeight: '600',
      fontSize: 12,
      marginLeft: 5,
    },

    // Toolbar
    toolbarContainer: { paddingHorizontal: 20, marginBottom: 10 },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.CARD,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      paddingHorizontal: 15,
      marginBottom: 15,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: THEME.TEXT_MAIN,
      marginLeft: 10,
    },
    selectAllTouch: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    selectAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: THEME.TEXT_SUB,
      marginLeft: 10,
    },

    // List & Cards
    listContainer: { paddingHorizontal: 20, paddingBottom: 150 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.CARD,
      padding: 15,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      elevation: isDarkMode ? 0 : 2,
    },
    cardSelected: {
      borderColor: THEME.ACCENT,
      backgroundColor: isDarkMode ? '#1A110B' : '#FFF5EE',
    },

    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: THEME.BORDER,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxActive: {
      backgroundColor: THEME.ACCENT,
      borderColor: THEME.ACCENT,
    },

    avatar: {
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 12,
    },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: THEME.ACCENT },

    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '700', color: THEME.TEXT_MAIN },
    userEmail: { fontSize: 12, color: THEME.TEXT_SUB, marginTop: 2 },

    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

    // Bottom Bar
    bottomBar: {
      position: 'absolute',
      bottom: 25,
      left: 20,
      right: 20,
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
      padding: 15,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      elevation: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5,
    },
    btnReject: {
      backgroundColor: isDarkMode ? 'rgba(255, 59, 48, 0.1)' : '#FEE2E2',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 59, 48, 0.2)' : '#FFCDD2',
    },
    btnApprove: {
      backgroundColor: isDarkMode ? 'rgba(52, 199, 89, 0.1)' : '#E8F5E9',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(52, 199, 89, 0.2)' : '#C8E6C9',
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '85%',
      backgroundColor: THEME.CARD,
      borderRadius: 30,
      padding: 25,
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    inputModal: {
      backgroundColor: isDarkMode ? '#050505' : '#F9FAFB',
      borderRadius: 15,
      padding: 15,
      color: THEME.TEXT_MAIN,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      marginBottom: 20,
    },
  });
};
