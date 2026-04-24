import { StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext';

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.BG,
    },
    mapWrapper: {
      flex: 1,
    },

    // --- TOP OVERLAY (STATS) ---
    topOverlay: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      backgroundColor: THEME.CARD,
      borderRadius: 24,
      paddingVertical: 18,
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderWidth: 1,
      borderColor: THEME.BORDER,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDarkMode ? 0.5 : 0.1,
      shadowRadius: 20,
    },
    statBox: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '900',
      color: THEME.TEXT_MAIN,
      fontVariant: ['tabular-nums'],
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: THEME.TEXT_SUB,
      textTransform: 'uppercase',
      marginTop: 4,
      letterSpacing: 1,
    },

    // --- GPS BADGE ---
    gpsBadge: {
      position: 'absolute',
      top: 20,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.CARD,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    gpsDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    gpsText: {
      color: THEME.TEXT_MAIN,
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },

    // --- MAP CONTROLS (SIDE) ---
    mapControls: {
      position: 'absolute',
      right: 16,
      bottom: 220,
      gap: 12,
    },
    controlBtn: {
      width: 48,
      height: 48,
      backgroundColor: THEME.CARD,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: THEME.BORDER,
      elevation: 4,
    },
    zoomGroup: {
      backgroundColor: THEME.CARD,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: THEME.BORDER,
      elevation: 4,
    },
    zoomBtn: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: THEME.BORDER,
      width: '60%',
      alignSelf: 'center',
    },

    // --- FULLSCREEN STATS ---
    fullscreenStats: {
      ...StyleSheet.absoluteFill,
      backgroundColor: THEME.BG,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    fullTime: {
      fontSize: 72,
      color: THEME.TEXT_MAIN,
      fontWeight: '900',
      fontVariant: ['tabular-nums'],
    },
    fullDist: {
      fontSize: 32,
      color: THEME.ACCENT,
      fontWeight: '800',
      marginTop: 10,
    },
    fullPace: {
      fontSize: 20,
      color: THEME.TEXT_SUB,
      marginTop: 5,
    },
    toggleViewBtn: {
      position: 'absolute',
      top: 160,
      right: 20,
      backgroundColor: THEME.CARD,
      padding: 12,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: THEME.BORDER,
      zIndex: 30,
    },

    // --- BOTTOM CONTROLS ---
    bottomControls: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 20,
    },
    actionButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: THEME.CARD,
      elevation: 10,
      shadowColor: THEME.ACCENT,
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 30,
    },
    secondaryButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: THEME.CARD,
    },
    primaryButton: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: THEME.CARD,
    },

    // --- MODAL ---
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCard: {
      backgroundColor: THEME.CARD,
      padding: 24,
      borderRadius: 30,
      alignItems: 'center',
      width: '85%',
      borderWidth: 1,
      borderColor: THEME.BORDER,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: THEME.TEXT_MAIN,
      marginBottom: 10,
    },
    confirmText: {
      fontSize: 14,
      color: THEME.TEXT_SUB,
      textAlign: 'center',
      marginBottom: 25,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalBtnDiscard: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6',
      alignItems: 'center',
    },
    modalBtnSave: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: '#10B981',
      alignItems: 'center',
    },
    backButton: {
      position: 'absolute',
      top: 8, // Sesuaikan dengan statusbar
      left: 20,
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: THEME.CARD,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: THEME.BORDER,
      zIndex: 30, // Agar berada di atas map
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
  });
};