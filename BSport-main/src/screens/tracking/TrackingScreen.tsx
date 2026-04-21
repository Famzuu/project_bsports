import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal } from 'react-native';
import {
  Target,
  Plus,
  Minus,
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTrackingStore } from '../../store/useTrackingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocation } from '../../context/LocationContext';
import { getStyles } from '../../style/TrackingStyle';
import { darkTheme, lightTheme } from '../../context/ThemeContext';
import MapViewComponent from '../../components/MapViewComponent';
import api from '../../services/api';

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

  const isDarkMode = useAuthStore(state => state.isDarkMode);
  const styles = getStyles(isDarkMode);
  const THEME = isDarkMode ? darkTheme : lightTheme;

  const location = useLocation();
  const navigation = useNavigation<any>();
  const mapRef = useRef<any>(null);

  const [viewMode, setViewMode] = useState<'map' | 'stats'>('map');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [buffer, setBuffer] = useState<any[]>([]);
  const formatPace = (pace: number) => {
    if (!pace || pace === 0) return '--';

    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace % 1) * 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ✅ RESET LOCAL STATE SAAT SCREEN IDLE
  useEffect(() => {
    if (!isTracking) {
      setElapsedTime(0);
    }
  }, [isTracking]);

  // --- SAVE COORDS ---
  useEffect(() => {
    if (!isTracking || isPaused || !location) return;

    const coord = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    setBuffer(prev => [...prev, coord]);

    useTrackingStore.getState().addCoord({
      ...coord,
      timestamp: Date.now(),
    });
  }, [location, isTracking, isPaused]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { activityId, isTracking } = useTrackingStore.getState();

      if (!activityId || !isTracking) return; // 🔥 TAMBAHKAN INI

      setBuffer(prev => {
        if (prev.length === 0) return prev;

        api.post(`/activities/${activityId}/points`, {
          points: prev,
        });

        return [];
      });
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // --- TIMER ---
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

  // --- HELPERS ---
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

  // --- ACTIONS ---
  const handleStopRequest = () => {
    pauseTracking();
    setShowConfirmModal(true);
  };

  const handleDiscard = () => {
    setShowConfirmModal(false);

    resetTracking();
    setElapsedTime(0);
    setBuffer([]); // 🔥 TAMBAHKAN

    setTimeout(() => {
      navigation.goBack();
    }, 0);
  };

  const onConfirmSave = async () => {
    const { activityId } = useTrackingStore.getState();

    if (!activityId) return; // 🔥 TAMBAHKAN

    stopTracking();

    try {
      if (buffer.length > 0) {
        await api.post(`/activities/${activityId}/points`, {
          points: buffer,
        });
      }

      await api.post(`/activities/${activityId}/finish`);
    } catch (err) {
      console.log('FINISH ERROR', err);
    }

    setBuffer([]); // 🔥 tambahkan juga (biar clean)

    setShowConfirmModal(false);

    navigation.navigate('SaveActivityScreen', {
      activityId,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {!isTracking && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={THEME.TEXT_MAIN} />
        </TouchableOpacity>
      )}

      {/* MAP */}
      {viewMode === 'map' && (
        <View style={styles.mapWrapper}>
          <MapViewComponent
            ref={mapRef}
            coords={coords}
            isDark={isDarkMode}
            hasPermission={true}
            currentLocation={
              location ? [location.longitude, location.latitude] : null
            }
          />
        </View>
      )}

      {/* STATS FULL */}
      {viewMode === 'stats' && (
        <View style={styles.fullscreenStats}>
          <Text style={styles.fullTime}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.fullDist}>{totalDistance.toFixed(2)} KM</Text>
          <Text style={styles.fullPace}>Pace {formatPace(pace)}</Text>
        </View>
      )}

      {/* TOGGLE */}
      <TouchableOpacity
        style={styles.toggleViewBtn}
        onPress={() => setViewMode(viewMode === 'map' ? 'stats' : 'map')}
      >
        {viewMode === 'map' ? (
          <Maximize2 size={22} color={THEME.TEXT_MAIN} />
        ) : (
          <Minimize2 size={22} color={THEME.TEXT_MAIN} />
        )}
      </TouchableOpacity>

      {/* MINI STATS */}
      {viewMode === 'map' && (
        <View style={styles.topOverlay}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalDistance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>KM</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatPace(pace)}</Text>
            <Text style={styles.statLabel}>Pace</Text>
          </View>
        </View>
      )}

      {/* GPS */}
      {viewMode === 'map' && (
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
            {!location ? 'Searching GPS...' : 'GPS Active'}
          </Text>
        </View>
      )}

      {/* MAP CONTROLS */}
      {viewMode === 'map' && (
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => mapRef.current?.recenter()}
          >
            <Target size={24} color={THEME.TEXT_MAIN} />
          </TouchableOpacity>

          <View style={styles.zoomGroup}>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => mapRef.current?.zoomIn()}
            >
              <Plus size={24} color={THEME.TEXT_MAIN} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => mapRef.current?.zoomOut()}
            >
              <Minus size={24} color={THEME.TEXT_MAIN} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ACTION BUTTON */}
      <View style={styles.bottomControls}>
        {!isTracking ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: THEME.ACCENT }]}
            onPress={async () => {
              if (!location) {
                console.log('GPS belum ready');
                return;
              }

              console.log('START CLICKED');

              try {
                resetTracking();

                const res = await api.post('/activities/start', {
                  start_lat: location.latitude,
                  start_lng: location.longitude,
                });

                console.log('API RESPONSE:', res.data);

                const actId = res.data.act_id;

                useTrackingStore.getState().setActivityId(actId);

                setElapsedTime(0);
                startTracking();
                setViewMode('stats');
              } catch (err: any) {
                console.log(
                  'START ERROR FULL:',
                  err?.response?.data || err.message,
                );
              }
            }}
          >
            <Play size={32} color="#fff" fill="#fff" />
          </TouchableOpacity>
        ) : !isPaused ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: THEME.CARD }]}
            onPress={pauseTracking}
          >
            <Pause size={32} color={THEME.TEXT_MAIN} />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleStopRequest}
            >
              <Square size={24} color="#fff" fill="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={resumeTracking}
            >
              <Play size={36} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MODAL */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Save Activity?</Text>

            <Text style={styles.confirmText}>
              This activity will be saved to your personal history.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnDiscard}
                onPress={handleDiscard}
              >
                <Text style={{ fontWeight: 'bold' }}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnSave}
                onPress={onConfirmSave}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
