import React, {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  NativeModules,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { launchImageLibrary } from 'react-native-image-picker';
import Share from 'react-native-share';
import {
  Image as ImageIcon,
  Share as ShareIcon,
  X,
  Map as MapIcon,
} from 'lucide-react-native';
import { ShareStatsOverlay } from './ShareStatsOverlay';
import Svg, { Polyline } from 'react-native-svg';

interface ShareBottomSheetProps {
  activityData: any;
}

const { InstagramStories } = NativeModules;
// 🔥 MESIN PENGGAMBAR RUTE SVG
const PolylineSticker = ({ points }: { points: number[][] }) => {
  if (!points || points.length < 2) return null;

  const lngs = points.map(p => p[0]);
  const lats = points.map(p => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const lngDiff = maxLng - minLng || 0.0001;
  const latDiff = maxLat - minLat || 0.0001;

  const pointsString = points
    .map(p => {
      const x = ((p[0] - minLng) / lngDiff) * 100;
      const y = 100 - ((p[1] - minLat) / latDiff) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View
      style={{
        flex: 1,
        padding: 40,
        paddingBottom: 100,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Svg height="100%" width="100%" viewBox="-10 -10 120 120">
        <Polyline
          points={pointsString}
          fill="none"
          stroke="#FC6100"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export const ShareBottomSheet = forwardRef<any, ShareBottomSheetProps>(
  ({ activityData }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shareMode, setShareMode] = useState<'photo' | 'map'>('photo');
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const viewShotRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      present: () => setIsVisible(true),
      dismiss: () => setIsVisible(false),
    }));

    const handlePickImage = async () => {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets?.[0].uri) {
        setBackgroundImage(result.assets[0].uri);
        setShareMode('photo');
      }
    };

    // 🔥 LOGIKA FINAL SHARE (ANTI-CRASH INSTAGRAM)
    const handleCaptureAndShare = async () => {
      if (!viewShotRef.current) return;
      setLoading(true);

      setTimeout(async () => {
        try {
          // 🔥 1. Ambil URI file asli (Bukan Base64 agar memori Android tidak jebol)
          const uri = await viewShotRef.current.capture();

          if (shareMode === 'map' && Platform.OS === 'android') {
            try {
              // 🔥 2. Kirim URI fisik sebagai Sticker ke Instagram
              if (shareMode === 'map' && Platform.OS === 'android') {
                await InstagramStories.shareSticker(uri);

                setLoading(false);
                return;
              }

              setLoading(false);
              return;
            } catch (igError: any) {
              console.log('Instagram error: ', igError);
            }
          }

          // 🔥 JIKA MODE FOTO / JIKA INSTAGRAM ERROR
          const shareOptions = {
            title: "B'Sports Activity",
            url: uri,
            type: shareMode === 'photo' ? 'image/jpeg' : 'image/png',
            failOnCancel: false,
          };
          await Share.open(shareOptions);
        } catch (error: any) {
          if (error.message !== 'User did not share') {
            Alert.alert('Error', 'Gagal memproses gambar untuk dibagikan.');
          }
        } finally {
          setLoading(false);
        }
      }, 800);
    };

    if (!isVisible) return null;

    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.sheetContent}>
            <View style={styles.handleIndicator} />

            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bagikan Aktivitas</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeBtn}
              >
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  shareMode === 'photo' && styles.toggleBtnActive,
                ]}
                onPress={() => setShareMode('photo')}
              >
                <ImageIcon
                  size={18}
                  color={shareMode === 'photo' ? '#FFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.toggleText,
                    shareMode === 'photo' && styles.toggleTextActive,
                  ]}
                >
                  Foto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  shareMode === 'map' && styles.toggleBtnActive,
                ]}
                onPress={() => setShareMode('map')}
              >
                <MapIcon
                  size={18}
                  color={shareMode === 'map' ? '#FFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.toggleText,
                    shareMode === 'map' && styles.toggleTextActive,
                  ]}
                >
                  Stiker Rute
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
              <ViewShot
                ref={viewShotRef}
                options={{
                  format: 'png',
                  quality: 1,
                  result: 'tmpfile',
                }}
                style={styles.viewShotArea}
              >
                {shareMode === 'photo' ? (
                  <ImageBackground
                    source={{
                      uri:
                        backgroundImage ||
                        'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop',
                    }}
                    style={styles.fullScreen}
                    resizeMode="cover"
                  >
                    <ShareStatsOverlay
                      distance={activityData?.distance ?? '0 km'}
                      time={activityData?.duration ?? '00:00'}
                      pace={activityData?.average_pace ?? '0:00'}
                    />
                  </ImageBackground>
                ) : (
                  <View
                    collapsable={false}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0,0,0,0.001)',
                    }}
                  >
                    <PolylineSticker points={activityData?.points || []} />
                    <View style={styles.statsOverlayWrapper}>
                      <ShareStatsOverlay
                        distance={activityData?.distance ?? '0 km'}
                        time={activityData?.duration ?? '00:00'}
                        pace={activityData?.average_pace ?? '0:00'}
                      />
                    </View>
                  </View>
                )}
              </ViewShot>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={handlePickImage}
              >
                <ImageIcon
                  size={20}
                  color="#E5E7EB"
                  style={styles.iconSpaced}
                />
                <Text style={styles.outlineBtnText}>Ganti Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                onPress={handleCaptureAndShare}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <ShareIcon
                      size={20}
                      color="#FFF"
                      style={styles.iconSpaced}
                    />
                    <Text style={styles.primaryBtnText}>Bagikan ke Story</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  customModalRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  sheetContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  handleIndicator: {
    backgroundColor: '#4B5563',
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 4, backgroundColor: '#374151', borderRadius: 20 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: { color: '#9CA3AF', fontWeight: '600', fontSize: 14 },
  toggleTextActive: { color: '#FFF', fontWeight: 'bold' },

  previewContainer: {
    width: '65%',
    aspectRatio: 9 / 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4B5563',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  viewShotArea: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.001)',
},
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  statsOverlayWrapper: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    elevation: 10,
  },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnText: { color: '#E5E7EB', fontWeight: '700', fontSize: 15 },
  primaryBtn: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: '#FC6100',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  iconSpaced: { marginRight: 8 },
});
