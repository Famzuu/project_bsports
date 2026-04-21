import React, {
  useImperativeHandle,
  useRef,
  forwardRef,
  useState,
} from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Coordinate } from '../types/tracking';

interface Props {
  coords: Coordinate[];
  hasPermission: boolean;
  currentLocation: [number, number] | null;
  isDark: boolean; // 🔥 Pastikan ini ada
}

MapLibreGL.setAccessToken(null);

const MapViewComponent = forwardRef(
  // 🔥 TAMBAHKAN isDark di sini (destructuring props)
  ({ coords, hasPermission, currentLocation, isDark }: Props, ref) => {
    const cameraRef = useRef<any>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(16);

    // URL Map Style dari Carto
    const LIGHT_STYLE =
      'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
    const DARK_STYLE =
      'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

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
        setCurrentZoom(16);
        if (currentLocation && cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: currentLocation,
            zoomLevel: 16,
            animationDuration: 1000,
          });
        }
      },
    }));

    // Logic Loading Izin
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
          // 🔥 GANTI STYLE SECARA DINAMIS
          mapStyle={isDark ? DARK_STYLE : LIGHT_STYLE}
          logoEnabled={false}
          attributionEnabled={false}
          onPress={() => setIsUserInteracting(true)}
        >
          <MapLibreGL.Camera
            ref={cameraRef}
            zoomLevel={currentZoom}
            centerCoordinate={currentLocation || [0, 0]}
            followUserLocation={!isUserInteracting}
            animationMode="flyTo"
            animationDuration={1500}
          />

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

          {coords.length > 1 && (
            <MapLibreGL.ShapeSource
              id="routeSource"
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coords.map(c => [c.longitude, c.latitude]),
                },
              }}
            >
              <MapLibreGL.LineLayer
                id="routeLine"
                style={{
                  lineColor: '#FC4C02',
                  lineWidth: 6,
                  lineJoin: 'round',
                  lineCap: 'round',
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
