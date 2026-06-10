import React from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import EventPodium from './EventPodium';
import { styles } from '../../style/EventDetailStyle';
import { useAuthStore } from '../../store/useAuthStore';

const formatDurationText = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
};

export default function EventLeaderboard({ leaderboard, isLoading }: any) {
  const currentUser = useAuthStore(state => state.user);

  if (isLoading) {
    return (
      <ActivityIndicator
        size="small"
        color="#FC6100"
        style={{ marginVertical: 20 }}
      />
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return <Text style={styles.emptyText}>Belum ada aktivitas tercatat.</Text>;
  }

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <View>
      {top3.length >= 3 ? (
        <EventPodium leaderboard={top3} currentUser={currentUser} />
      ) : null}

      <View style={styles.leaderboardList}>
        {(top3.length < 3 ? leaderboard : remaining).map(
          (item: any, index: number) => {
            const rank = top3.length < 3 ? index + 1 : index + 4;

            // 🔥 DETECT CURRENT USER
            const isCurrentUser =
              Number(item?.user_id) === Number(currentUser?.id) ||
              Number(item?.id) === Number(currentUser?.id);

            return (
              <View
                key={index.toString()}
                style={[
                  styles.lbItem,
                  isCurrentUser && styles.lbItemCurrentUser,
                ]}
              >
                {/* 🔥 BADGE RANK POJOK KIRI ATAS */}
                <View style={styles.lbRankAbsolute}>
                  <Text style={styles.lbRankTextAbsolute}>#{rank}</Text>
                </View>

                {/* AVATAR (Tanpa lingkaran rank abu-abu di sampingnya) */}
                <View style={styles.lbAvatar}>
                  {item?.foto_profil ? (
                    <Image
                      source={{ uri: item.foto_profil }}
                      style={styles.lbAvatarImage}
                    />
                  ) : (
                    <Text style={styles.lbAvatarText}>
                      {item?.name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  )}
                </View>

                {/* INFO NAMA & PACE */}
                <View style={styles.lbInfo}>
                  <Text style={styles.lbName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {isCurrentUser && (
                    <View style={styles.lbYouBadge}>
                      <Text style={styles.lbYouBadgeText}>YOU</Text>
                    </View>
                  )}
                  <Text style={styles.lbPace}>
                    Pace: {item.avg_pace || '0:00'}/km • Waktu:{' '}
                    {formatDurationText(item.duration)}
                  </Text>
                </View>

                {/* STATS JARAK */}
                <View style={styles.lbStatsWrapper}>
                  <Text style={styles.lbDistance}>{item.distance}</Text>
                  <Text style={styles.lbUnit}>KM</Text>
                </View>
              </View>
            );
          },
        )}
      </View>
    </View>
  );
}
