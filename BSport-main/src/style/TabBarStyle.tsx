import { StyleSheet, Platform, Dimensions } from 'react-native';
import { darkTheme, lightTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export const getStyles = (isDarkMode: boolean) => {
  const THEME = isDarkMode ? darkTheme : lightTheme;

  // Variabel efek Glow khusus Tab Bar
  const neonBorderTop = isDarkMode ? `${THEME.ACCENT}66` : THEME.BORDERLINE;
  const glowShadow = isDarkMode ? THEME.ACCENT : '#000';

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
      // 🔥 Border luar mengikuti request (#F8AD3C di dark mode)
      borderWidth: isDarkMode ? 1.5 : 3,
      borderColor: neonBorderTop, 
      ...Platform.select({
        ios: {
          shadowColor: glowShadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 20,
        },
        android: {
          elevation: isDarkMode ? 8 : 10,
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
      marginTop: -35,
    },
    centerButton: {
      width: 65,
      height: 65,
      borderRadius: 30, // Squircle style
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: THEME.ACCENT,
      shadowColor: glowShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.6 : 0.4,
      shadowRadius: 15,
      elevation: 10,
      borderWidth: isDarkMode ? 2 : 0,
      borderColor: THEME.CARD,
    },
  });
};