import React, {
  useImperativeHandle,
  useRef,
  forwardRef,
  useState,
  useEffect,
} from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

interface Props {
  coords: number[][]; // 🔥 FIX: sekarang format [lng, lat]
  hasPermission: boolean;
  currentLocation: [number, number] | null;
  isDark: boolean;
}

MapLibreGL.setAccessToken(null);

const MapViewComponent = forwardRef(
  ({ coords, hasPermission, currentLocation, isDark }: Props, ref) => {
    const cameraRef = useRef<any>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(14);

    const LIGHT_STYLE =
      'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
    const DARK_STYLE =
      'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    // ==========================================
    // 🔥 AUTO FIT ROUTE (INI YANG BIKIN KELIATAN)
    // ==========================================
    const hasFittedRef = useRef(false);
    const lastCameraUpdate = useRef(0);

    useEffect(() => {
      if (
        !coords ||
        coords.length < 2 ||
        !cameraRef.current ||
        hasFittedRef.current
      )
        return;

      const lats = coords.map(c => c[1]);
      const lngs = coords.map(c => c[0]);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // 🔥 BLOCK kalau jarak terlalu jauh (GPS error)
      if (maxLat - minLat > 0.01 || maxLng - minLng > 0.01) return;

      cameraRef.current.fitBounds([minLng, minLat], [maxLng, maxLat], 50, 1000);

      hasFittedRef.current = true;
    }, [coords]);

    useEffect(() => {
      if (!cameraRef.current || !currentLocation) return;

      const now = Date.now();

      if (!isUserInteracting && now - lastCameraUpdate.current > 2000) {
        cameraRef.current.setCamera({
          centerCoordinate: currentLocation,
          animationDuration: 500,
        });

        lastCameraUpdate.current = now;
      }
    }, [currentLocation]);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        setCurrentZoom(prev => {
          const newZoom = prev + 1;
          cameraRef.current?.setCamera({
            zoomLevel: newZoom,
            animationDuration: 300,
          });
          return newZoom;
        });
      },
      zoomOut: () => {
        setCurrentZoom(prev => {
          const newZoom = prev - 1;
          cameraRef.current?.setCamera({
            zoomLevel: newZoom,
            animationDuration: 300,
          });
          return newZoom;
        });
      },
      recenter: () => {
        setIsUserInteracting(false);

        if (coords.length > 1) {
          // 🔥 kalau ada route → fit route
          const lats = coords.map(c => c[1]);
          const lngs = coords.map(c => c[0]);

          cameraRef.current.fitBounds(
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
            50,
            1000,
          );
        } else if (currentLocation) {
          cameraRef.current.setCamera({
            centerCoordinate: currentLocation,
            zoomLevel: 16,
            animationDuration: 1000,
          });
        }
      },
    }));

    if (!hasPermission) {
      return (
        <View
          style={[
            styles.center,
            { backgroundColor: isDark ? '#050505' : '#F3F4F6' },
          ]}
        >
          <ActivityIndicator size="large" color="#FC4C02" />
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? '#8E8E93' : '#6B7280' },
            ]}
          >
            Menunggu izin lokasi...
          </Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {!currentLocation && (
          <View
            style={[
              styles.gpsLoadingOverlay,
              {
                backgroundColor: isDark
                  ? 'rgba(0,0,0,0.8)'
                  : 'rgba(255,255,255,0.85)',
              },
            ]}
          >
            <ActivityIndicator size="large" color="#FC4C02" />
            <Text
              style={[
                styles.gpsLoadingText,
                { color: isDark ? '#FFFFFF' : '#111827' },
              ]}
            >
              Mencari satelit GPS...
            </Text>
          </View>
        )}

        <MapLibreGL.MapView
          style={{ flex: 1 }}
          mapStyle={isDark ? DARK_STYLE : LIGHT_STYLE}
          logoEnabled={false}
          attributionEnabled={false}
          onRegionWillChange={() => setIsUserInteracting(true)}
        >
          <MapLibreGL.Camera
            ref={cameraRef}
            zoomLevel={currentZoom}
            centerCoordinate={currentLocation || [0, 0]}
            animationMode="flyTo"
            animationDuration={1500}
          />

          {/* 🔥 USER DOT */}
          {currentLocation && (
            <MapLibreGL.PointAnnotation
              id="user-pos"
              coordinate={currentLocation}
            >
              <View style={styles.userDotContainer}>
                <View style={styles.userDot} />
              </View>
            </MapLibreGL.PointAnnotation>
          )}

          {/* 🔥 POLYLINE */}
          {/* 🔥 POLYLINE */}
          {coords && coords.length > 1 && (
            <MapLibreGL.ShapeSource
              id="routeSource" // ✅ Biarkan tanpa properti "key"
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coords, // MapLibre akan otomatis mendeteksi perubahan array ini
                },
              }}
            >
              <MapLibreGL.LineLayer
                id="routeLine"
                style={{
                  lineColor: '#FC4C02', // Warna Strava
                  lineWidth: 6,
                  lineOpacity: 0.9,
                  lineJoin: 'round', // Tikungan halus
                  lineCap: 'round', // Ujung membulat
                }}
              />
            </MapLibreGL.ShapeSource>
          )}
          
        </MapLibreGL.MapView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontWeight: '600',
  },
  gpsLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gpsLoadingText: {
    marginTop: 12,
    fontWeight: '700',
    fontSize: 16,
  },
  userDotContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(252, 76, 2, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FC4C02',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default MapViewComponent;
