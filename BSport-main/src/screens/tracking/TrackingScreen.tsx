import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal } from 'react-native';
import MapViewComponent from '../../components/MapViewComponent';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTrackingStore } from '../../store/useTrackingStore';
import { useLocation } from '../../context/LocationContext';
import { Target, Plus, Minus, Play, Pause, Square } from 'lucide-react-native';
import { styles } from '../../style/TrackingStyle';

export default function TrackingScreen() {
  const {
    coords,
    isTracking,
    isPaused,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    startTime,
    totalPausedDuration,
    resetTracking,
  } = useTrackingStore();

  const location = useLocation();
  const navigation = useNavigation();
  const mapRef = useRef<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [finalStats, setFinalStats] = useState({
    time: 0,
    distance: 0,
    pace: 0,
  });

  const userCurrentCoord: [number, number] | null = location
    ? [location.longitude, location.latitude]
    : null;

  // --- Logic Save Points ---
  useEffect(() => {
    if (!isTracking || isPaused || !location) return;
    const coord = {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: Date.now(),
    };
    useTrackingStore.getState().addCoord(coord);
  }, [location, isTracking, isPaused]);

  // --- Logic Precision Timer ---
  useEffect(() => {
    let interval: any;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const pausedTime =
          totalPausedDuration +
          (isPaused ? now - (useTrackingStore.getState().pauseTime || now) : 0);
        setElapsedTime(Math.floor((now - startTime - pausedTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, startTime, totalPausedDuration]);

  // --- Math Calculations ---
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getDistance = (c1: any, c2: any) => {
    const R = 6371;
    const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((c1.latitude * Math.PI) / 180) *
        Math.cos((c2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const totalDistance = coords.reduce(
    (acc, curr, i) => (i === 0 ? 0 : acc + getDistance(coords[i - 1], curr)),
    0,
  );
  const pace = totalDistance > 0 ? elapsedTime / 60 / totalDistance : 0;

  // --- Handlers ---
  const handleStop = () => {
    setFinalStats({
      time: elapsedTime,
      distance: totalDistance,
      pace,
    });

    setShowConfirmModal(true);
  };

  const handleSave = () => {
    stopTracking();
    setShowConfirmModal(false);

    // 👉 nanti di sini kamu bisa kirim ke API / simpan local
    console.log('Saved activity:', finalStats);

    resetTracking();
    setElapsedTime(0);

    // optional: balik ke home
    navigation.goBack();
  };

  const handleDiscard = () => {
    setShowConfirmModal(false);
    resetTracking();
    setElapsedTime(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.mapWrapper}>
        <MapViewComponent
          ref={mapRef}
          coords={coords}
          hasPermission={true}
          currentLocation={userCurrentCoord}
        />
      </View>

      {!isTracking && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={30} color="#111827" strokeWidth={4} />
        </TouchableOpacity>
      )}

      {/* GPS BADGE */}
      <View style={styles.gpsBadge}>
        <View
          style={[
            styles.gpsDot,
            {
              backgroundColor:
                location?.status === 'good' ? '#22C55E' : '#EF4444',
            },
          ]}
        />
        <Text style={styles.gpsText}>
          {!location
            ? 'Mencari GPS...'
            : location.status === 'good'
            ? 'GPS Akturat'
            : 'GPS Lemah'}
        </Text>
      </View>

      {/* MAP CONTROLS */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.controlBtn}
          onPress={() => mapRef.current?.recenter()}
        >
          <Target size={24} color="#FC4C02" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.zoomGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.zoomBtn}
            onPress={() => mapRef.current?.zoomIn()}
          >
            <Plus size={24} color="#111827" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.zoomBtn}
            onPress={() => mapRef.current?.zoomOut()}
          >
            <Minus size={24} color="#111827" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS OVERLAY */}
      <View style={styles.topOverlay}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.statLabel}>Waktu</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalDistance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>KM</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{pace ? pace.toFixed(2) : '--'}</Text>
          <Text style={styles.statLabel}>Pace</Text>
        </View>
      </View>

      {/* DYNAMIC BOTTOM CONTROLS */}
      <View style={styles.bottomControls}>
        {!isTracking ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.actionButton, styles.buttonStart]}
            onPress={() => {
              resetTracking();
              setElapsedTime(0);
              startTracking();
            }}
          >
            <Play size={32} color="#fff" fill="#fff" />
          </TouchableOpacity>
        ) : !isPaused ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.actionButton, styles.buttonPause]}
            onPress={pauseTracking}
          >
            <Pause size={32} color="#fff" fill="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryButton}
              onPress={handleStop}
            >
              <Square size={24} color="#fff" fill="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.primaryButton}
              onPress={resumeTracking}
            >
              <Play size={36} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Simpan Aktivitas?</Text>

            <Text style={styles.confirmText}>
              Aktivitas yang sudah kamu lakukan akan disimpan ke riwayat.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={handleDiscard}
              >
                <Text style={styles.discardText}>Buang</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
