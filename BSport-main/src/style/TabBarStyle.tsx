import { StyleSheet, Platform, Dimensions } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: THEME.CARD, 
      width: width * 0.95, 
      marginBottom: Platform.OS === 'ios' ? 25 : 15,
      height: 70,
      borderRadius: 25,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: THEME.BORDERLINE,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDarkMode ? 0.5 : 0.1,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    centerTabContainer: {
      marginTop: -35, // Membuat tombol tengah sedikit menonjol ke atas
    },
    centerButton: {
      width: 65,
      height: 65,
      borderRadius: 30, // Squircle style agar konsisten dengan desain Admin
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: THEME.ACCENT,
      shadowColor: THEME.ACCENT,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  });
};
