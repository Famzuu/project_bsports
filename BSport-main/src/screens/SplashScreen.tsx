import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Ganti dengan logo kamu */}
      <Image
        source={require('../assets/logo.png')} // 🔥 sesuaikan path
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>B'Sports</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8AD3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
});