import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// PALET WARNA BARU B'SPORTS
const BSports_ORANGE = '#F8AD3C'; // Warna utama baru
const Live_BLUE_TEXT = '#0284C7'; // Teks biru untuk Live
const Live_BLUE_BG = '#E0F2FE';   // Background biru untuk Live

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Latar belakang feed abu-abu muda
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 40, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: BSports_ORANGE, // Gunakan warna orange baru
    letterSpacing: -0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
  },
  
  // --- TAB TOGGLE STYLES ---
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: BSports_ORANGE, // Gunakan warna orange baru
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '800',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Ruang lega untuk CustomTabBar di bawah
  },

  // --- ACTIVITY FEED STYLES ---
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  userName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  activityTime: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  activityTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statUnit: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  mapPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapText: { color: '#9CA3AF', fontWeight: '600' },

  // --- EVENT CARD STYLES ---
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Tambahkan border kiri untuk pembeda warna
    borderLeftWidth: 6,
  },
  
  // Gaya khusus pembeda Live vs Virtual
  liveCard: {
    borderLeftColor: Live_BLUE_TEXT, // Border kiri biru untuk Live
  },
  virtualCard: {
    borderLeftColor: BSports_ORANGE, // Border kiri orange untuk Virtual
  },

  eventImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  eventContent: {
    padding: 16,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    flex: 1,
  },
  
  // Badge Styles (Diupdate)
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: Live_BLUE_BG,
  },
  virtualBadge: {
    backgroundColor: '#FFEDD5', // Light Orange BG
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 4,
  },
  liveBadgeText: {
    color: Live_BLUE_TEXT,
  },
  virtualBadgeText: {
    color: '#EA580C', // Dark Orange Text
  },

  eventDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  eventInfoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  eventInfoText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
  },
  joinButton: {
    backgroundColor: BSports_ORANGE, // Gunakan warna orange baru
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  // Style khusus untuk tombol yang sudah diklik
  joinedButton: {
    backgroundColor: '#6B7280', // Warna abu-abu untuk status "Terdaftar/Gagal Mendaftar"
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    marginRight: 8,
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40,
    fontSize: 14,
  },
});