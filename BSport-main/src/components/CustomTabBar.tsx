import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Home, Play, User, Timer } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Import Store & Style
import { useAuthStore } from '../store/useAuthStore';
import { getStyles } from '../style/TabBarStyle';
import { darkTheme, lightTheme } from '../context/ThemeContext';

const AnimatedIcon = ({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) => {
  const scale = useSharedValue(isActive ? 1.2 : 1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default function CustomTabBar() {
  const navigation = useNavigation<any>();
  const activeRouteName = useNavigationState(
    state => state?.routes[state.index]?.name,
  );

  // Theme Integration
  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  const centerScale = useSharedValue(1);
  const centerButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {/* Tab Home */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.tabItem}
          activeOpacity={1}
        >
          <AnimatedIcon isActive={activeRouteName === 'Home'}>
            <Home
              size={24}
              color={activeRouteName === 'Home' ? THEME.ACCENT : THEME.TEXT_SUB}
              strokeWidth={activeRouteName === 'Home' ? 2.5 : 2}
            />
          </AnimatedIcon>
        </TouchableOpacity>

        {/* Tombol Tengah (Tracking) */}
        <View style={styles.centerTabContainer}>
          <Animated.View style={[centerButtonStyle]}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => (centerScale.value = withTiming(0.85))}
              onPressOut={() => (centerScale.value = withSpring(1))}
              onPress={() => navigation.navigate('Tracking')}
              style={styles.centerButton}
            >
              {activeRouteName === 'Tracking' ? (
                <Timer size={28} color="#fff" strokeWidth={2.5} />
              ) : (
                <Play size={24} color="#fff" fill="#fff" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Tab Profile */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.tabItem}
          activeOpacity={1}
        >
          <AnimatedIcon isActive={activeRouteName === 'Profile'}>
            <User
              size={24}
              color={
                activeRouteName === 'Profile' ? THEME.ACCENT : THEME.TEXT_SUB
              }
              strokeWidth={activeRouteName === 'Profile' ? 2.5 : 2}
            />
          </AnimatedIcon>
        </TouchableOpacity>
      </View>
    </View>
  );
}
