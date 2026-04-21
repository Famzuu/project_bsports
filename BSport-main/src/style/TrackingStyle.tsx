import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  mapWrapper: {
    flex: 1,
  },

  // --- STATS OVERLAY (ATAS) ---
  topOverlay: {
    position: 'absolute',
    top: 70, // Disesuaikan untuk Notch/StatusBar
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  statBox: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    fontVariant: ['tabular-nums'], // Agar angka tidak goyang saat berubah
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // --- GPS BADGE ---
  gpsBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 30,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  gpsText: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // --- MAP CONTROLS (SIDE) ---
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    gap: 12,
  },

  controlBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  zoomGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  zoomBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 10,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '60%',
    alignSelf: 'center',
  },

  // --- BOTTOM CONTROLS (MODERN PANEL) ---
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  // Mode Tombol Tunggal (Start atau Pause)
  actionButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },

  // Mode Jeda (Row Button)
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  secondaryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    backgroundColor: '#EF4444', // Merah untuk Stop
    borderWidth: 2,
    borderColor: '#fff',
  },

  primaryButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    backgroundColor: '#10B981', // Hijau untuk Resume
    borderWidth: 4,
    borderColor: '#fff',
  },

  // Warna khusus untuk tombol aksi
  buttonStart: { backgroundColor: '#FC4C02' }, // Strava Orange
  buttonPause: { backgroundColor: '#111827' }, // Hitam Elegan
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },

  // --- MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 28,
    alignItems: 'center',
    width: '85%',
    elevation: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
    color: '#111827',
  },

  modalContent: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
  },

  modalText: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '700',
  },

  okButton: {
    backgroundColor: '#FC4C02',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
  },

  okButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  confirmText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  discardButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  discardText: {
    color: '#111827',
    fontWeight: '700',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
