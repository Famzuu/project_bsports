import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapWrapper: {
    flex: 1,
    // Pastikan MapViewComponent Anda memiliki style { flex: 1 } atau StyleSheet.absoluteFill
  },
  topOverlay: {
    position: 'absolute',
    top: 50, // Jarak dari atas (Status Bar)
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Putih dengan sedikit transparansi
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  statUnit: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  actionButton: {
    width: 86,
    height: 86,
    borderRadius: 43, // Membuatnya bulat sempurna
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF', // Garis putih di pinggir tombol agar lebih kontras dengan peta
  },
  buttonStart: {
    backgroundColor: '#FC4C02', // Strava Orange
  },
  buttonStop: {
    backgroundColor: '#111827', // Hitam gelap untuk berhenti
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});