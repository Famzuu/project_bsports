import { StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext'; // Sesuaikan path file theme kamu

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: THEME.BG },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: THEME.BG,
    },
    backButton: {
      width: 45,
      height: 45,
      marginTop: 15,
      borderRadius: 15,
      backgroundColor: THEME.CARD,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    headerTextContainer: { flex: 1, marginLeft: 15, marginTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: THEME.TEXT_MAIN },
    headerSubtitle: { fontSize: 13, color: THEME.TEXT_SUB, marginTop: 2 },

    // List
    listContainer: { padding: 20, paddingBottom: 100 },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Card
    card: {
      backgroundColor: THEME.CARD,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      // Shadow dinamis: Hilang di dark mode, soft di light mode
      shadowColor: '#000',
      shadowOpacity: isDarkMode ? 0 : 0.05,
      shadowRadius: 10,
      elevation: isDarkMode ? 0 : 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    titleWrapper: { flex: 1, marginRight: 10 },
    eventTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: THEME.TEXT_MAIN,
      lineHeight: 24,
    },

    // Badge
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
    },
    badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

    // Info Row
    infoRow: { flexDirection: 'row', marginTop: 15, alignItems: 'center' },
    infoText: { color: THEME.TEXT_SUB, fontSize: 13, marginLeft: 8 },

    divider: { height: 1, backgroundColor: THEME.BORDER, marginVertical: 15 },

    // Actions
    cardActions: { flexDirection: 'row', justifyContent: 'space-between' },
    btnManage: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)',
      paddingVertical: 12,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    btnManageText: {
      color: THEME.TEXT_MAIN,
      fontWeight: '600',
      marginLeft: 8,
      fontSize: 13,
    },

    btnDelete: {
      width: 45,
      height: 45,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255, 59, 48, 0.1)' : '#FEE2E2',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 59, 48, 0.2)' : '#FFCDD2',
    },

    // FAB
    fab: {
      position: 'absolute',
      right: 25,
      bottom: 35,
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor: THEME.ACCENT,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: THEME.ACCENT,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { color: THEME.TEXT_SUB, marginTop: 15, fontSize: 15 },
  });
};
