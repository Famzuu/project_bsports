import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BSports_ORANGE = '#F8AD3C';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BSports_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationWrapper: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 5,
  },
  // Efek dekorasi lingkaran transparan agar splash tidak flat
  circleDecor: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    borderWidth: 40,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    top: -height * 0.2,
  },
});
