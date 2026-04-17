import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapViewComponent from '../../components/MapViewComponent';
import { useTrackingStore } from '../../store/useTrackingStore';
import { Coordinate } from '../../types/tracking';
import { styles as defaultStyles } from '../../style/TrackingStyle';
import { requestDisableBatteryOptimization } from '../../utils/batteryOptimization';

import {
  startTrackingService,
  stopTrackingService,
} from '../../services/backgroundTracking';

export default function TrackingScreen() {
  const {
    coords,
    addCoord,
    isTracking,
    startTracking,
    stopTracking,
    startTime,
    resetTracking,
  } = useTrackingStore();

  const [elapsedTime, setElapsedTime] = useState(0);

  // --- STATE UNTUK MODAL SUMMARY ---
  const [showModal, setShowModal] = useState(false);
  const [finalStats, setFinalStats] = useState({
    time: 0,
    distance: 0,
    pace: 0,
  });

  const lastCoord = coords[coords.length - 1];

  const userCurrentCoord: [number, number] | null = lastCoord
    ? [lastCoord.longitude, lastCoord.latitude]
    : null;

  // =========================
  // 📍 TRACKING REAL GPS
  // =========================
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isTracking) {
      interval = setInterval(async () => {
        const saved = await AsyncStorage.getItem('tracking_coords');
        if (saved) {
          const parsed = JSON.parse(saved);

          // 🔥 replace semua coords (bukan add satu-satu)
          const current = useTrackingStore.getState().coords;

          if (parsed.length !== current.length) {
            useTrackingStore.setState({ coords: parsed });
          }
        }
      }, 2000); // sync tiap 2 detik
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  // =========================
  // ⏱️ TIMER
  // =========================
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // =========================
  // 📏 DISTANCE (KM) & PACE
  // =========================
  const getDistance = (c1: Coordinate, c2: Coordinate) => {
    const R = 6371;
    const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.latitude * Math.PI) / 180) *
        Math.cos((c2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const totalDistance = coords.reduce((acc, curr, i) => {
    if (i === 0) return 0;
    return acc + getDistance(coords[i - 1], curr);
  }, 0);

  const time = elapsedTime;
  const pace = totalDistance > 0 ? time / 60 / totalDistance : 0;

  // =========================
  // 🎛️ HANDLE ACTION BUTTON
  // =========================

  const handleToggleTracking = async () => {
  if (isTracking) {
    await stopTrackingService();

    setFinalStats({
      time: elapsedTime,
      distance: totalDistance,
      pace: pace,
    });

    stopTracking();
    setShowModal(true);

  } else {
    // 🔥 TARUH DI SINI
    await AsyncStorage.removeItem('tracking_coords');

    Alert.alert(
      'Optimasi Baterai',
      'Matikan optimasi baterai agar tracking tidak berhenti.',
      [
        {
          text: 'OK',
          onPress: async () => {
            await requestDisableBatteryOptimization();
            await startTrackingService();
            startTracking();
          },
        },
      ]
    );
  }
};

  // =========================
  // 🔄 HANDLE RESET PADA MODAL
  // =========================
  const handleCloseAndReset = async () => {
    setShowModal(false);
    setElapsedTime(0);

    await AsyncStorage.removeItem('tracking_coords'); // 🔥 penting

    if (resetTracking) {
      resetTracking();
    }
  };

  return (
    <View style={defaultStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* MAP */}
      <View style={defaultStyles.mapWrapper}>
        <MapViewComponent
          coords={coords}
          hasPermission={true}
          currentLocation={userCurrentCoord}
        />
      </View>

      {/* STATS OVERLAY */}
      <View style={defaultStyles.topOverlay}>
        <View style={defaultStyles.statBox}>
          <Text style={defaultStyles.statValue}>{formatTime(time)}</Text>
          <Text style={defaultStyles.statLabel}>Waktu</Text>
        </View>

        <View style={defaultStyles.statBox}>
          <Text style={defaultStyles.statValue}>
            {totalDistance.toFixed(2)} km
          </Text>
          <Text style={defaultStyles.statLabel}>Jarak</Text>
        </View>

        <View style={defaultStyles.statBox}>
          <Text style={defaultStyles.statValue}>
            {pace ? pace.toFixed(2) : '--'} /km
          </Text>
          <Text style={defaultStyles.statLabel}>Pace</Text>
        </View>
      </View>

      {/* ACTION BUTTON */}
      <View style={defaultStyles.bottomControls}>
        <TouchableOpacity
          style={[
            defaultStyles.actionButton,
            isTracking ? defaultStyles.buttonStop : defaultStyles.buttonStart,
          ]}
          activeOpacity={0.8}
          onPress={handleToggleTracking}
        >
          <Text style={defaultStyles.buttonText}>
            {isTracking ? 'STOP' : 'START'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================= */}
      {/* 🛑 CUSTOM MODAL SUMMARY  */}
      {/* ========================= */}
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={customStyles.modalOverlay}>
          <View style={customStyles.modalCard}>
            <View style={customStyles.modalHeader}>
              <Text style={customStyles.modalIcon}>🏁</Text>
              <Text style={customStyles.modalTitle}>Aktivitas Selesai</Text>
              <Text style={customStyles.modalSubtitle}>
                Kerja bagus! Berikut statistik Anda.
              </Text>
            </View>

            <View style={customStyles.statsContainer}>
              <View style={customStyles.statRow}>
                <Text style={customStyles.statLabelModal}>⏱️ Waktu Total</Text>
                <Text style={customStyles.statValueModal}>
                  {formatTime(finalStats.time)}
                </Text>
              </View>
              <View style={customStyles.divider} />

              <View style={customStyles.statRow}>
                <Text style={customStyles.statLabelModal}>📏 Jarak Tempuh</Text>
                <Text style={customStyles.statValueModal}>
                  {finalStats.distance.toFixed(2)} km
                </Text>
              </View>
              <View style={customStyles.divider} />

              <View style={customStyles.statRow}>
                <Text style={customStyles.statLabelModal}>
                  ⚡ Pace Rata-rata
                </Text>
                <Text style={customStyles.statValueModal}>
                  {finalStats.pace ? finalStats.pace.toFixed(2) : '--'} /km
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={customStyles.okButton}
              onPress={handleCloseAndReset}
              activeOpacity={0.8}
            >
              <Text style={customStyles.okButtonText}>Oke, Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Tambahan Style khusus untuk Custom Modal
const customStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Gelap transparan
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 4,
  },
  statLabelModal: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  statValueModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8AD3C', // Gunakan warna primer aplikasi (Misal: Orange)
  },
  okButton: {
    backgroundColor: '#F8AD3C',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
