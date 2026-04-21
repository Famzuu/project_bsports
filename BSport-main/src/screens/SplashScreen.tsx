import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { styles } from '../style/SplashStyle'; // Import style terpisah

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Container untuk Animasi agar terpusat */}
      <View style={styles.animationWrapper}>
        <LottieView
          source={require('../assets/run.json')} // Pastikan path benar
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {/* Text Section di bagian bawah */}
      <View style={styles.footer}>
        <Text style={styles.title}>B-SPORT</Text>
        <Text style={styles.tagline}>LIMITLESS PERFORMANCE</Text>
      </View>

      {/* Dekorasi halus di background (opsional) */}
      <View style={styles.circleDecor} />
    </View>
  );
}
