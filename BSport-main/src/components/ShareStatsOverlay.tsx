import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ShareStatsProps {
  distance: string;
  time: string;
  pace: string;
}

export const ShareStatsOverlay: React.FC<ShareStatsProps> = ({ distance, time, pace }) => {
  // Menghilangkan kata 'km' dari distance agar angka bisa dibesarkan
  const distanceNumber = distance.replace(' km', '').replace('km', '').trim();

  return (
    <View style={styles.overlayContainer}>
      
      {/* HEADER: Logo & Watermark Aplikasi */}
      <View style={styles.header}>
        {/* Pastikan path logo Anda benar */}
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandWatermark}>B'SPORTS</Text>
      </View>

      {/* FOOTER: Data Statika Menempel di Foto */}
      <View style={styles.statsContainer}>
        
        {/* HERO STAT: Jarak */}
        <View style={styles.heroStat}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.heroValue}>{distanceNumber}</Text>
            <Text style={styles.heroUnit}>km</Text>
          </View>
          <Text style={styles.heroLabel}>JARAK TEMPUH</Text>
        </View>

        {/* SECONDARY STATS: Waktu & Pace */}
        <View style={styles.secondaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{time}</Text>
            <Text style={styles.statLabel}>WAKTU</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pace}</Text>
            <Text style={styles.statLabel}>PACE AVG</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    padding: 17,
    justifyContent: 'space-between', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    tintColor: '#FFF', 
  },
  brandWatermark: {
    color: '#FFF',
    fontFamily: 'Montserrat-Black', 
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statsContainer: {
    alignItems: 'flex-start',
  },
  heroStat: {
    marginBottom: 12,
  },
  heroValue: {
    color: '#FFF',
    fontSize: 42, // Ukuran raksasa
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  heroUnit: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 4,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  heroLabel: {
    color: '#FC6100', // Warna Orange B'Sports
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: 22, 
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  statLabel: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});