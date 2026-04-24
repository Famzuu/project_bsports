import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
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
import { startGPS, stopGPS } from '../../services/gpsService';
import { loadTracking, clearTracking } from '../../services/trackingStorage';
import { addQueue, flushQueue } from '../../services/offlineQueue';
import BackgroundService from 'react-native-background-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 Import Service Latar Belakang & Baterai HANYA DARI SINI
import {
  startTrackingService,
  stopTrackingService,
} from '../../services/backgroundTracking';

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
  const intervalRef = useRef<any>(null);
  const offlineIntervalRef = useRef<any>(null);
  const lastCoord = coords[coords.length - 1];

  const [viewMode, setViewMode] = useState<'map' | 'stats'>('map');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  type Coord = {
    latitude: number;
    longitude: number;
  };

  const kalmanFilter = (() => {
    let lastLat = 0;
    let lastLng = 0;
    let lastVelocity = 0;
    let initialized = false;

    let P_lat = 1;
    let P_lng = 1;

    return (lat: number, lng: number, speed: number) => {
      if (!initialized) {
        lastLat = lat;
        lastLng = lng;
        initialized = true;
        return { latitude: lat, longitude: lng };
      }

      // 🔥 ADAPTIVE NOISE
      let R = 0.00001;
      let Q = 0.000001;

      // 🚶 kalau pelan → lebih smooth
      if (speed < 1) {
        R = 0.00002;
        Q = 0.0000005;
      }

      // 🏃 kalau cepat → lebih responsif
      if (speed > 3) {
        R = 0.000005;
        Q = 0.000005;
      }

      // 🔥 PREDICT
      P_lat += Q;
      P_lng += Q;

      // 🔥 UPDATE
      const K_lat = P_lat / (P_lat + R);
      const K_lng = P_lng / (P_lng + R);

      lastLat = lastLat + K_lat * (lat - lastLat);
      lastLng = lastLng + K_lng * (lng - lastLng);

      P_lat = (1 - K_lat) * P_lat;
      P_lng = (1 - K_lng) * P_lng;

      lastVelocity = speed;

      return {
        latitude: lastLat,
        longitude: lastLng,
      };
    };
  })();

  const [buffer, setBuffer] = useState<Coord[]>([]);

  const safePost = async (url: string, data: any) => {
    try {
      await api.post(url, data);
    } catch (e) {
      await addQueue({ url, data }); // 🔥 simpan offline
    }
  };

  const syncOffline = async () => {
    const queue = await flushQueue();

    for (const item of queue) {
      try {
        await api.post(item.url, item.data);
      } catch {
        await addQueue(item); // balik lagi kalau gagal
      }
    }
  };

  const formatPace = (pace: number) => {
    if (!pace || pace === 0) return '--';
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace % 1) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const smoothCoordinate = (
    prev: { latitude: number; longitude: number },
    current: { latitude: number; longitude: number },
    lastRaw: { latitude: number; longitude: number },
  ) => {
    // 🔥 deteksi arah (belokan)
    const dx1 = prev.latitude - lastRaw.latitude;
    const dy1 = prev.longitude - lastRaw.longitude;

    const dx2 = current.latitude - prev.latitude;
    const dy2 = current.longitude - prev.longitude;

    const angle = Math.abs(dx1 * dy2 - dy1 * dx2);

    // 🔥 kalau belok → smoothing dikurangi
    const alpha = angle > 0.0000005 ? 0.35 : 0.12;

    const ema = {
      latitude: prev.latitude + alpha * (current.latitude - prev.latitude),
      longitude: prev.longitude + alpha * (current.longitude - prev.longitude),
    };

    return {
      latitude: (ema.latitude + current.latitude) / 2,
      longitude: (ema.longitude + current.longitude) / 2,
    };
  };

  useEffect(() => {
    if (offlineIntervalRef.current) return;

    offlineIntervalRef.current = setInterval(syncOffline, 15000);

    return () => {
      clearInterval(offlineIntervalRef.current);
      offlineIntervalRef.current = null;
    };
  }, []);

  useEffect(() => {
    const restore = async () => {
      const data = await loadTracking();

      if (data) {
        useTrackingStore.setState({
          coords: data.coords || [],
          totalDistance: data.totalDistance || 0,
          isTracking: true,
          startTime: data.startTime || Date.now(),
        });

        // 🔥 RESTORE BUFFER
        const savedBuffer = await AsyncStorage.getItem('TEMP_BUFFER');
        if (savedBuffer) {
          setBuffer(JSON.parse(savedBuffer));
        }

        await startTrackingService();
      }
    };

    restore();
  }, []);

  useEffect(() => {
    if (!isTracking) setElapsedTime(0);
  }, [isTracking]);

  // --- SYNC TO API ---
  useEffect(() => {
    if (intervalRef.current) return; // 🔥 guard

    intervalRef.current = setInterval(async () => {
      const { activityId, isTracking: currentTracking } =
        useTrackingStore.getState();

      if (!activityId || !currentTracking) return;

      setBuffer(prev => {
        if (prev.length === 0) return prev;

        safePost(`/activities/${activityId}/points`, { points: prev });

        AsyncStorage.removeItem('TEMP_BUFFER'); // 🔥 clear setelah sync

        return [];
      });
    }, 20000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // 🔥 reset
    };
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

  const totalDistance = useTrackingStore(state => state.totalDistance);

  const pace = totalDistance > 0 ? elapsedTime / 60 / totalDistance : 0;

  const handleStopRequest = () => {
    pauseTracking();
    setShowConfirmModal(true);
  };

  const handleDiscard = async () => {
    setShowConfirmModal(false);
    stopGPS();
    await stopTrackingService();
    await clearTracking();
    await AsyncStorage.removeItem('TEMP_BUFFER');
    resetTracking();
    setElapsedTime(0);
    setBuffer([]);
    setTimeout(() => navigation.goBack(), 0);
  };

  const onConfirmSave = async () => {
    const { activityId } = useTrackingStore.getState();
    if (!activityId) return;

    stopTracking();
    stopGPS();
    await stopTrackingService();
    await clearTracking(); // 🔥 WAJIB
    await AsyncStorage.removeItem('TEMP_BUFFER');

    try {
      if (buffer.length > 0) {
        await safePost(`/activities/${activityId}/points`, { points: buffer });
      }
      await api.post(`/activities/${activityId}/finish`);
    } catch (err) {
      console.log('FINISH ERROR', err);
    }

    setBuffer([]);
    setShowConfirmModal(false);
    navigation.navigate('SaveActivityScreen', { activityId });
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

      {viewMode === 'map' && (
        <View style={styles.mapWrapper}>
          <MapViewComponent
            ref={mapRef}
            coords={coords.map(c => [c.longitude, c.latitude])} // 🔥 FIX DI SINI
            isDark={isDarkMode}
            hasPermission={true}
            currentLocation={
              lastCoord ? [lastCoord.longitude, lastCoord.latitude] : null
            }
          />
        </View>
      )}

      {viewMode === 'stats' && (
        <View style={styles.fullscreenStats}>
          <Text style={styles.fullTime}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.fullDist}>{totalDistance.toFixed(2)} KM</Text>
          <Text style={styles.fullPace}>Pace {formatPace(pace)}</Text>
        </View>
      )}

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

      <View style={styles.bottomControls}>
        {!isTracking ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: THEME.ACCENT }]}
            onPress={async () => {
              if (!location) {
                Alert.alert(
                  'Menunggu GPS',
                  'Mohon tunggu hingga sinyal GPS didapatkan.',
                );
                return;
              }

              try {
                if (Platform.OS === 'android') {
                  const grantedLoc = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                  );

                  // 🔥 TAMBAHKAN PENGECEKAN HASIL IZIN NOTIFIKASI DI SINI
                  if (Platform.Version >= 33) {
                    const grantedNotif = await PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                    );

                    // Jika izin notifikasi ditolak, HENTIKAN proses agar tidak force close
                    if (grantedNotif !== PermissionsAndroid.RESULTS.GRANTED) {
                      Alert.alert(
                        'Izin Dibutuhkan',
                        'Aplikasi wajib memiliki izin Notifikasi agar tracking bisa tetap berjalan di latar belakang (Background).',
                      );
                      return; // 🛑 Proses berhenti di sini
                    }
                  }

                  if (grantedLoc !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Izin Ditolak', 'Aplikasi butuh akses GPS.');
                    return; // 🛑 Proses berhenti di sini
                  }
                }

                resetTracking();

                // Mulai tracking
                let actId: number | null = null;

                try {
                  const res = await api.post('/activities/start', {
                    start_lat: location.latitude,
                    start_lng: location.longitude,
                  });

                  actId = res.data.act_id;
                } catch (e) {
                  await addQueue({
                    url: '/activities/start',
                    data: {
                      start_lat: location.latitude,
                      start_lng: location.longitude,
                    },
                  });
                }

                if (!actId) {
                  actId = Date.now(); // 🔥 fallback local id
                }

                useTrackingStore.getState().setActivityId(actId);

                if (!BackgroundService.isRunning()) {
                  await startTrackingService();
                }

                startGPS(coord => {
                  if (!coord?.latitude || !coord?.longitude) return;

                  const prevCoords = useTrackingStore.getState().coords;
                  const last = prevCoords[prevCoords.length - 1];
                  const lastRaw =
                    prevCoords.length > 1
                      ? prevCoords[prevCoords.length - 2]
                      : last;

                  let speed = 0;

                  if (last) {
                    const d = getDistance(last, coord);
                    const timeDiff =
                      (Date.now() - (last?.timestamp || Date.now())) / 1000;

                    speed = (d * 1000) / timeDiff;
                  }

                  let finalCoord = kalmanFilter(
                    coord.latitude,
                    coord.longitude,
                    speed,
                  );

                  // 🔥 extra smoothing ringan
                  finalCoord = {
                    latitude: (finalCoord.latitude + coord.latitude) / 2,
                    longitude: (finalCoord.longitude + coord.longitude) / 2,
                  };

                  if (last && prevCoords.length > 5) {
                    // 🔥 STOP DETECTION (pakai speed dari atas)
                    if (speed < 0.3 && prevCoords.length > 10) return;

                    // 🔥 SMART SMOOTHING
                    finalCoord = smoothCoordinate(last, finalCoord, lastRaw);

                    // 🔥 FILTER JITTER
                    const d2 = getDistance(last, finalCoord);
                    if (d2 < 0.002) return;
                  }

                  setBuffer(prev => {
                    const newBuffer = [...prev.slice(-200), finalCoord];

                    AsyncStorage.setItem(
                      'TEMP_BUFFER',
                      JSON.stringify(newBuffer),
                    );

                    return newBuffer;
                  });

                  useTrackingStore.getState().addCoord({
                    ...finalCoord,
                    timestamp: Date.now(),
                  });
                });

                startTracking();
                setViewMode('stats');
              } catch (err) {
                console.log(err);
                Alert.alert('Error', 'Gagal memulai tracking');
                await stopTrackingService();
                stopGPS();
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
