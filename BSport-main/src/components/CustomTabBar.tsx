import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Home, Play, User, Timer } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Komponen Pembungkus Animasi untuk Icon
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
  }, [isActive, scale]);

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

  // Animasi untuk Tombol Tengah
  const centerScale = useSharedValue(1);
  const centerButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value }],
  }));

  const handlePressIn = () => {
    centerScale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    centerScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

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
              color={activeRouteName === 'Home' ? '#F8AD3C' : '#8E8E93'}
              strokeWidth={activeRouteName === 'Home' ? 2.5 : 2}
            />
          </AnimatedIcon>
        </TouchableOpacity>

        {/* 🔥 Tombol Tengah (Tracking) dengan Animasi Pegas */}
        <View style={styles.centerTabContainer}>
          <Animated.View style={[centerButtonStyle]}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => navigation.navigate('Tracking')}
              style={[
                styles.centerButton,
                {
                  backgroundColor:
                    activeRouteName === 'Tracking' ? '#F8AD3C' : '#333',
                },
              ]}
            >
              {activeRouteName === 'Tracking' ? (
                <Timer size={30} color="#fff" strokeWidth={2.5} />
              ) : (
                <Play
                  size={30}
                  color="#fff"
                  fill="#fff"
                  style={{ marginLeft: 4 }}
                />
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
              color={activeRouteName === 'Profile' ? '#F8AD3C' : '#8E8E93'}
              strokeWidth={activeRouteName === 'Profile' ? 2.5 : 2}
            />
          </AnimatedIcon>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#ffffff',
    width: '90%',
    height: 65,
    borderRadius: 35,
    marginBottom: Platform.OS === 'ios' ? 35 : 25,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
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
    top: -20,
    alignItems: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
