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
}

// MapLibre tidak memerlukan token untuk base maps gratis dari Carto
MapLibreGL.setAccessToken(null);

const MapViewComponent = forwardRef(
  ({ coords, hasPermission, currentLocation }: Props, ref) => {
    // Menggunakan any untuk menghindari konflik tipe internal MapLibre pada Camera
    const cameraRef = useRef<any>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(16);

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
        setCurrentZoom(16); // Reset zoom saat recenter
        if (currentLocation && cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: currentLocation,
            zoomLevel: 16,
            animationDuration: 1000,
          });
        }
      },
    }));

    // State Loading jika izin lokasi belum diberikan
    if (!hasPermission) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FC4C02" />
          <Text style={styles.loadingText}>Menunggu izin lokasi...</Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {/* Overlay saat mencari sinyal GPS pertama kali */}
        {!currentLocation && (
          <View style={styles.gpsLoadingOverlay}>
            <ActivityIndicator size="large" color="#FC4C02" />
            <Text style={styles.gpsLoadingText}>Mencari satelit GPS...</Text>
          </View>
        )}

        <MapLibreGL.MapView
          style={{ flex: 1 }}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
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

          {/* Marker Lokasi User (Titik Oranye) */}
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

          {/* Gambar Rute (Polyline) */}
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
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  gpsLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gpsLoadingText: {
    marginTop: 12,
    color: '#111827',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default MapViewComponent;
