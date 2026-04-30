import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
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

// State & Context
import { useTrackingStore } from '../../store/useTrackingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocation } from '../../context/LocationContext';
import { darkTheme, lightTheme } from '../../context/ThemeContext';

// Komponen & Utils
import { getStyles } from '../../style/TrackingStyle';
import MapViewComponent from '../../components/MapViewComponent';
import SportSelector from '../../components/SportSelector';
import SaveActivityModal from '../../components/SaveActivityModal';
import {
  formatTime,
  formatPace,
  getDistance,
  smoothCoordinate,
  createKalmanFilter,
} from '../../utils/trackingMath';

// Services
import api from '../../services/api';
import { startGPS, stopGPS } from '../../services/gpsService';
import { loadTracking, clearTracking } from '../../services/trackingStorage';
import { addQueue, flushQueue } from '../../services/offlineQueue';
import BackgroundService from 'react-native-background-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  startTrackingService,
  stopTrackingService,
} from '../../services/backgroundTracking';

type Coord = {
  latitude: number;
  longitude: number;
};

export default function TrackingScreen() {
  // 🔥 AMBIL STATE DARI ZUSTAND (Hanya untuk render UI)
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
    totalDistance,
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
  const [sportType, setSportType] = useState('run');
  const [buffer, setBuffer] = useState<Coord[]>([]);

  const pace = totalDistance > 0.01 ? elapsedTime / 60 / totalDistance : 0;

  const safePost = async (url: string, data: any) => {
    try {
      await api.post(url, data);
    } catch (e) {
      await addQueue({ url, data });
    }
  };

  const syncOffline = async () => {
    const queue = await flushQueue();
    for (const item of queue) {
      try {
        await api.post(item.url, item.data);
      } catch {
        await addQueue(item);
      }
    }
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
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      // ✅ AMAN: Menggunakan .getState() tanpa tanda kurung ()
      const { activityId, isTracking: currentTracking } = useTrackingStore.getState();

      if (!activityId || !currentTracking) return;

      setBuffer(prev => {
        if (prev.length === 0) return prev;
        safePost(`/activities/${activityId}/points`, { points: prev });
        AsyncStorage.removeItem('TEMP_BUFFER');
        return [];
      });
    }, 20000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);

  // --- TIMER ---
  useEffect(() => {
    let interval: any;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const { pauseTime } = useTrackingStore.getState();
        const pausedTime = totalPausedDuration + (isPaused ? now - (pauseTime || now) : 0);
        setElapsedTime(Math.floor((now - startTime - pausedTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, startTime, totalPausedDuration]);

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
    // ✅ AMAN: Tarik data segar dari store
    const { activityId, totalDistance: finalDist } = useTrackingStore.getState();
    if (!activityId) return;

    stopTracking();
    stopGPS();
    await stopTrackingService();
    await clearTracking();
    await AsyncStorage.removeItem('TEMP_BUFFER');

    try {
      if (buffer.length > 0) {
        await safePost(`/activities/${activityId}/points`, { points: buffer });
      }
      await api.post(`/activities/${activityId}/finish`, {
        total_distance: parseFloat(finalDist.toFixed(2)),
        duration: elapsedTime,
        pace: pace === Infinity || !isFinite(pace) ? 0 : parseFloat(pace.toFixed(2)),
      });
    } catch (err) {
      console.log('FINISH ERROR', err);
    }

    setBuffer([]);
    setShowConfirmModal(false);
    navigation.navigate('SaveActivityScreen', {
      activityId,
      finalDistance: finalDist.toFixed(2),
      finalDuration: elapsedTime,
      finalPace: pace,
      initialSportType: sportType,
    });
  };

  const startLiveTracking = async () => {
    if (!location) {
      Alert.alert('Menunggu GPS', 'Mohon tunggu hingga sinyal GPS didapatkan.');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const grantedLoc = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (Platform.Version >= 33) {
          const grantedNotif = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (grantedNotif !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Izin Dibutuhkan', 'Aplikasi wajib memiliki izin Notifikasi.');
            return;
          }
        }
        if (grantedLoc !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Izin Ditolak', 'Aplikasi butuh akses GPS.');
          return;
        }
      }

      resetTracking();
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
          data: { start_lat: location.latitude, start_lng: location.longitude },
        });
      }

      if (!actId) actId = Date.now();

      // ✅ AMAN: Menyimpan state lewat .getState()
      useTrackingStore.getState().setActivityId(actId);

      if (!BackgroundService.isRunning()) {
        await startTrackingService();
      }

      const kalmanFilter = createKalmanFilter();

      startGPS(coord => {
        if (!coord?.latitude || !coord?.longitude) return;
        if (coord.accuracy && coord.accuracy > 20) return;

        const prevCoords = useTrackingStore.getState().coords;
        const last = prevCoords[prevCoords.length - 1];
        const lastRaw = prevCoords.length > 1 ? prevCoords[prevCoords.length - 2] : last;
        let speed = coord.speed || 0;

        if (last) {
          const d = getDistance(last, coord);
          const timeDiff = (Date.now() - (last?.timestamp || Date.now())) / 1000;
          if (timeDiff > 0 && !speed) speed = (d * 1000) / timeDiff;
          if (speed > 25) return;
          if (d < 0.0015) return;
        }

        let finalCoord = kalmanFilter(coord.latitude, coord.longitude, speed);

        if (last && prevCoords.length > 5) {
          finalCoord = smoothCoordinate(last, finalCoord, lastRaw);
        }

        setBuffer(prev => {
          const newBuffer = [...prev.slice(-200), finalCoord];
          AsyncStorage.setItem('TEMP_BUFFER', JSON.stringify(newBuffer));
          return newBuffer;
        });

        // ✅ AMAN
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
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {!isTracking && (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={THEME.TEXT_MAIN} />
        </TouchableOpacity>
      )}

      {viewMode === 'map' && (
        <View style={styles.mapWrapper}>
          <MapViewComponent
            ref={mapRef}
            coords={coords.map(c => [c.longitude, c.latitude])} 
            isDark={isDarkMode}
            hasPermission={true}
            currentLocation={
              lastCoord 
                ? [lastCoord.longitude, lastCoord.latitude] 
                : location 
                ? [location.longitude, location.latitude] 
                : null
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

      <TouchableOpacity style={styles.toggleViewBtn} onPress={() => setViewMode(viewMode === 'map' ? 'stats' : 'map')}>
        {viewMode === 'map' ? <Maximize2 size={22} color={THEME.TEXT_MAIN} /> : <Minimize2 size={22} color={THEME.TEXT_MAIN} />}
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
          <View style={[styles.gpsDot, { backgroundColor: location?.status === 'good' ? '#22C55E' : '#EF4444' }]} />
          <Text style={styles.gpsText}>{!location ? 'Searching GPS...' : 'GPS Active'}</Text>
        </View>
      )}

      {viewMode === 'map' && (
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => mapRef.current?.recenter()}>
            <Target size={24} color={THEME.TEXT_MAIN} />
          </TouchableOpacity>
          <View style={styles.zoomGroup}>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => mapRef.current?.zoomIn()}>
              <Plus size={24} color={THEME.TEXT_MAIN} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.zoomBtn} onPress={() => mapRef.current?.zoomOut()}>
              <Minus size={24} color={THEME.TEXT_MAIN} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.bottomControls}>
        {!isTracking ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <SportSelector sportType={sportType} setSportType={setSportType} isDarkMode={isDarkMode} THEME={THEME} />
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: THEME.ACCENT }]} onPress={startLiveTracking}>
              <Play size={32} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </View>
        ) : !isPaused ? (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: THEME.CARD }]} onPress={pauseTracking}>
            <Pause size={32} color={THEME.TEXT_MAIN} />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleStopRequest}>
              <Square size={24} color="#fff" fill="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={resumeTracking}>
              <Play size={36} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <SaveActivityModal visible={showConfirmModal} onDiscard={handleDiscard} onSave={onConfirmSave} styles={styles} />
    </View>
  );
}