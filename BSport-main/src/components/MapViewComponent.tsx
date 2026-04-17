import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Coordinate } from '../types/tracking';

interface Props {
  coords: Coordinate[];
  hasPermission: boolean;
  currentLocation: [number, number] | null; // Data dari Context [longitude, latitude]
}

MapLibreGL.setAccessToken(null);

export default function MapViewComponent({
  coords,
  hasPermission,
  currentLocation,
}: Props) {
  // Tampilan Loading saat Permission belum di-allow
  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>
          Menunggu izin lokasi...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Tampilan Loading Transparan menunggu sinyal GPS pertama kali */}
      {!currentLocation && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.7)',
          }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: '#333', fontWeight: 'bold' }}>
            Mencari satelit GPS...
          </Text>
        </View>
      )}

      <MapLibreGL.MapView
        style={{ flex: 1 }}
        // ✅ GANTI BARIS INI: Gunakan peta gratis dari Carto (Voyager Style)
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        logoEnabled={false}
      >
        {/* ✅ KAMERA: Terbang otomatis mengikuti prop currentLocation */}
        {currentLocation && (
          <MapLibreGL.Camera
            zoomLevel={16}
            centerCoordinate={currentLocation}
            animationMode="flyTo"
            animationDuration={1500}
          />
        )}

        {/* ✅ TITIK BIRU: Menggunakan Custom Annotation (Anti-Crash) */}
        {currentLocation && (
          <MapLibreGL.PointAnnotation
            id="custom-user-location"
            coordinate={currentLocation}
          >
            <View style={styles.userDotContainer}>
              <View style={styles.userDot} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* ✅ RUTE TRACKING */}
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
                lineColor: '#007AFF',
                lineWidth: 5,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>
    </View>
  );
}

// Styling Titik Biru ala Google Maps / Strava
const styles = StyleSheet.create({
  userDotContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.25)', // Lingkaran luar transparan
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#007AFF', // Inti biru
    borderWidth: 3,
    borderColor: '#FFFFFF', // Border putih
  },
});
