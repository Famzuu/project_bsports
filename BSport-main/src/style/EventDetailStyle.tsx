import { StyleSheet, Platform } from 'react-native';

// 🔥 Centralized Design Tokens
export const COLORS = {
  primary: '#FC6100',       
  primaryLight: '#FFF0E5',
  success: '#10B981',       
  successLight: '#ECFDF5',
  successText: '#059669', 
  danger: '#EF4444',        
  dangerLight: '#FEF2F2',
  dangerText: '#DC2626',
  warning: '#FCD34D',       
  warningLight: '#FFFBEB',
  warningText: '#D97706',
  warningDarkText: '#92400E',
  textMain: '#0F172A',
  textSecondary: '#334155',
  textSub: '#64748B',
  border: '#F1F5F9', 
  white: '#FFFFFF',
  gold: '#F59E0B',
  silver: '#94A3B8',
  bronze: '#C2410C',
  textLight: '#4B5563',
  textMuted: '#9CA3AF',
  borderLight: '#E5E7EB',
  bgCard: '#F8FAFC',
  bgContainer: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.3)',
  modalOverlay: 'rgba(0,0,0,0.5)',
  disabled: '#E5E7EB',
};

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.bgContainer 
  },
  imageContainer: { 
    width: '100%', 
    height: 300, 
    position: 'relative' 
  },
  image: { 
    width: '100%', 
    height: '100%' 
  },
  overlay: { 
    ...StyleSheet.absoluteFill, 
    backgroundColor: COLORS.overlay 
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  titleWrapper: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20 
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: COLORS.white 
  },
  content: { 
    padding: 20 
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginTop: -45,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 24,
  },
  statItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  statDivider: { 
    width: 1, 
    backgroundColor: '#F3F4F6', 
    marginHorizontal: 5 
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  statLabel: { 
    fontSize: 12, 
    color: COLORS.textLight, 
    marginTop: 2 
  },
  section: { 
    marginBottom: 10 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  dateCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 12,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dateDivider: {
    height: 1,
    borderColor: COLORS.border,
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: 12,
    marginLeft: 52,
  },
  description: { 
    fontSize: 15, 
    color: COLORS.textLight, 
    lineHeight: 24 
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  btnContainer: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  adminSection: {
    marginTop: 10,
    padding: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.textMain 
  },
  adminSubtitle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    padding: 10,
    borderRadius: 12,
  },
  filterContainer: { 
    marginBottom: 12, 
    gap: 8, 
    paddingBottom: 4 
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: { 
    backgroundColor: COLORS.textMain, 
    borderColor: COLORS.textMain 
  },
  filterText: { 
    fontSize: 13, 
    color: COLORS.textSub, 
    fontWeight: '500' 
  },
  filterTextActive: { 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: COLORS.textMain,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  selectAllText: {
    fontSize: 13,
    color: COLORS.textSub,
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyPending: { 
    alignItems: 'center', 
    paddingVertical: 20 
  },
  emptyPendingText: { 
    color: COLORS.textMuted, 
    marginTop: 8, 
    fontSize: 13 
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pendingCardSelected: { 
    borderColor: COLORS.primary, 
    backgroundColor: '#FFF7F2' 
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  pendingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pendingAvatarText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLORS.textSub 
  },
  pendingName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  pendingEmail: { 
    fontSize: 12, 
    color: COLORS.textSub 
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: { 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  bulkActionRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 12 
  },
  bulkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  bulkReject: { 
    backgroundColor: COLORS.dangerLight, 
    borderColor: '#FECACA' 
  },
  bulkRejectText: {
    color: COLORS.dangerText,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  bulkApprove: { 
    backgroundColor: COLORS.successLight, 
    borderColor: '#A7F3D0' 
  },
  bulkApproveText: {
    color: COLORS.successText,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputModal: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  modalCancelBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 16 
  },
  modalCancelText: { 
    color: COLORS.textLight, 
    fontWeight: '600' 
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  modalSubmitText: { 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
  sectionCard: {
    marginBottom: 24,
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  lbMeta: {
    color: COLORS.textSub,
    marginTop: 2,
    fontSize: 13,
  },
  lbDuration: {
    color: COLORS.textMain,
    fontWeight: '700',
    fontSize: 14,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#FC6100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressPercentBadge: {
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  progressPercentText: {
    color: '#FC6100',
    fontWeight: '800',
    fontSize: 12,
  },
  progressBarBg: {
    height: 8, 
    backgroundColor: '#F1F5F9',
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FC6100',
    borderRadius: 100,
  },
  progressStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  progressStatItem: {
    flex: 1,
  },
  progressValue: {
    fontSize: 15, 
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  // 🔥 LEADERBOARD LIST - DESAIN BARU
  leaderboardList: {
    marginTop: 6,
  },
  lbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative', // 🔥 Penting untuk pita absolute
    overflow: 'hidden',   // 🔥 Agar pita mengikuti lengkungan border radius
  },

  // 🔥 PITA PERINGKAT (Absolute Pojok Kiri Atas)
  lbRankAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomRightRadius: 14, // Lengkungan ke dalam
    zIndex: 10,
  },
  lbRankTextAbsolute: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  lbInfo: {
    flex: 1,
  },
  lbName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  lbPace: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  lbStatsWrapper: {
    alignItems: 'flex-end',
  },
  lbDistance: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FC6100',
  },
  lbUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },

  // 🔥 AVATAR DIPERBARUI
  lbAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 8, // Memberikan sedikit ruang bernapas karena rank absolute di atas
    overflow: 'hidden',
  },
  lbAvatarImage: {
    width: '100%',
    height: '100%',
  },
  lbAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  lbItemCurrentUser: {
  borderWidth: 2,
  borderColor: '#FC6100',
  backgroundColor: '#FFF7ED',
},

lbYouBadge: {
  marginTop: 4,
  alignSelf: 'flex-start',
  backgroundColor: '#FC6100',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 999,
},

lbYouBadgeText: {
  color: '#FFF',
  fontSize: 10,
  fontWeight: '800',
},
});