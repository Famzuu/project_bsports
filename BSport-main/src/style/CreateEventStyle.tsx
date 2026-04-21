import { StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext'; // Sesuaikan path file theme Anda

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
      marginTop: 15,
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
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: THEME.TEXT_MAIN,
      marginLeft: 15,
    },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },

    // Card & Section
    card: {
      backgroundColor: THEME.CARD,
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      elevation: isDarkMode ? 0 : 2,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: THEME.ACCENT,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 20,
    },

    // Input Elements
    labelWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: THEME.TEXT_MAIN,
      marginLeft: 8,
    },
    required: { color: THEME.ACCENT, marginLeft: 4 },

    input: {
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
      borderRadius: 15,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: THEME.TEXT_MAIN,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      marginBottom: 15,
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },

    // Segmented UI
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F1F2F6',
      borderRadius: 15,
      padding: 5,
      marginTop: 5,
      marginBottom: 15,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
    },
    segmentBtnActive: {
      backgroundColor: THEME.ACCENT,
      shadowColor: THEME.ACCENT,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    segmentText: { fontSize: 13, fontWeight: '600', color: THEME.TEXT_SUB },
    segmentTextActive: { color: '#FFFFFF' },

    // Switch UI
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
      padding: 15,
      borderRadius: 18,
      marginTop: 10,
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    switchLabel: { color: THEME.TEXT_MAIN, fontSize: 15, fontWeight: '600' },
    switchDesc: { color: THEME.TEXT_SUB, fontSize: 12, marginTop: 2 },

    // Action Button
    submitBtn: {
      backgroundColor: THEME.ACCENT,
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      shadowColor: THEME.ACCENT,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
    submitBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  });
};
