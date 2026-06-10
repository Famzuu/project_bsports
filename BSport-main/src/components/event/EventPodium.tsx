import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import LottieView from 'lottie-react-native';

interface EventPodiumProps {
  leaderboard: any[];
  currentUser: any;
}

export default function EventPodium({
  leaderboard,
  currentUser,
}: Readonly<EventPodiumProps>) {
  if (!leaderboard || leaderboard.length < 3) return null;

  // 🔥 Top 3
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  const renderPodium = (
    item: any,
    rank: number,
    height: number,
    bgColor: string,
    isFirst: boolean = false,
  ) => {
    // Ekstraksi huruf pertama untuk Avatar
    const initial = item?.name ? item.name.charAt(0).toUpperCase() : '?';
    const isCurrentUser =
      Number(item?.user_id) === Number(currentUser?.id) ||
      Number(item?.id) === Number(currentUser?.id);

    return (
      <View style={[styles.podiumItem, { zIndex: isFirst ? 10 : 1 }]}>
        {/* === AVATAR & TROPHY SECTION === */}
        <View style={styles.avatarWrapper}>
          <LottieView
            source={require('../../assets/animations/confetti.json')}
            autoPlay={isFirst}
            loop={isFirst}
            style={[
              styles.lottieConfetti,
              { display: isFirst ? 'flex' : 'none' },
            ]}
            resizeMode="cover"
          />

          {/* 🔥 LINGKARAN AVATAR (WARNA BORDER SESUAI MEDALI) 🔥 */}
          <View
            style={[
              styles.avatar,
              isFirst && styles.avatarFirst,
              { borderColor: bgColor }, // <-- Warnanya disamakan dengan bgColor podium
            ]}
          >
            {item?.foto_profil ? (
              <Image
                source={{ uri: item.foto_profil }}
                style={[styles.avatarImage, isFirst && styles.avatarImageFirst]}
              />
            ) : (
              <Text
                style={[
                  styles.avatarText,
                  isFirst && styles.avatarTextFirst,
                  { color: bgColor }, // <-- Warna teks inisial disamakan dengan bgColor
                ]}
              >
                {initial}
              </Text>
            )}
          </View>
        </View>

        {isCurrentUser && (
          <View style={styles.youBadge}>
            <Text style={styles.youBadgeText}>YOU</Text>
          </View>
        )}

        {/* === NAMA PESERTA === */}
        <Text
          numberOfLines={1}
          style={[styles.nameText, isFirst && styles.nameTextFirst]}
        >
          {item?.name || '-'}
        </Text>

        {/* === DISTANCE BADGE === */}
        <View
          style={[styles.distanceBadge, isFirst && styles.distanceBadgeFirst]}
        >
          <Text
            style={[
              styles.distanceText,
              isFirst && styles.distanceTextFirst,
              { color: isFirst ? '#92400E' : bgColor }, // Agar emas tetap kontras
            ]}
          >
            {item?.distance || 0} KM
          </Text>
        </View>

        {/* === PODIUM BLOCK 3D EFFECT === */}
        <View
          style={[
            styles.podiumBlock,
            isCurrentUser && styles.currentUserPodium,
            { height, backgroundColor: bgColor },
            isFirst && styles.podiumBlockFirst,
          ]}
        >
          {/* Angka Rank */}
          <Text style={styles.rankText}>{rank}</Text>

          {/* Efek Kilap Kaca di bagian atas balok podium */}
          <View style={styles.glassHighlight} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Rank 2 - Perak (Silver) */}
      {renderPodium(second, 2, 110, '#94A3B8')}

      {/* Rank 1 - Emas (Gold) */}
      {renderPodium(first, 1, 150, '#F59E0B', true)}

      {/* Rank 3 - Perunggu (Bronze) */}
      {renderPodium(third, 3, 85, '#CD7F32')}
    </View>
  );
}

// 🔥 STYLING PREMIUM 🔥
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },

  // --- Avatar Styles ---
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },

  // 🔥 STYLING UNTUK LOTTIE CONFETTI 🔥
  lottieConfetti: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -20,
    zIndex: 0,
    elevation: 0,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3, // Ditebalkan agar warna medali terlihat jelas
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  avatarFirst: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFBEB', // Latar emas super muda
    borderWidth: 4, // Juara 1 bordernya lebih tebal
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },

  avatarImageFirst: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  avatarTextFirst: {
    fontSize: 22,
    fontWeight: '900',
  },

  // --- Typography ---
  nameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    maxWidth: 80,
    textAlign: 'center',
  },
  nameTextFirst: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },

  // --- Distance Badge ---
  distanceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  distanceBadgeFirst: {
    backgroundColor: '#FEF3C7', // Latar badge emas muda
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '800',
  },
  distanceTextFirst: {
    fontWeight: '900',
  },

  // --- Podium Blocks ---
  podiumBlock: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  podiumBlockFirst: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 10 },
    }),
  },
  rankText: {
    fontSize: 40,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.95)',
    zIndex: 2,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Aksen kaca slightly lebih terang
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  youBadge: {
    backgroundColor: '#FC6100',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 6,
  },

  youBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  currentUserPodium: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
