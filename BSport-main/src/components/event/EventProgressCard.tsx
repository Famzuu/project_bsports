import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';
import { styles, } from '../../style/EventDetailStyle';

const formatDurationText = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

interface ProgressCardProps {
  progress: any;
  isLoading: boolean;
  targetJarakEvent: number; // 🔥 Ambil langsung dari master event.target_jarak
}

export default function EventProgressCard({ progress, isLoading, targetJarakEvent }: Readonly<ProgressCardProps>) {
  if (isLoading) return null;

  // Jika user belum lari sama sekali, set default object agar UI tidak kosong
  const safeProgress = progress || {};

const distance =
  safeProgress.total_distance ??
  safeProgress.distance ??
  0;

const duration =
  safeProgress.total_duration ??
  safeProgress.duration ??
  0;

const target =
  safeProgress.target && safeProgress.target > 0
    ? safeProgress.target
    : targetJarakEvent || 0;

const percentage =
  target > 0
    ? Math.min(Math.round((distance / target) * 100), 100)
    : 0;

const safePercentage = Number.isNaN(percentage) ? 0 : percentage;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleGroup}>
          <Activity size={18} color="#FC6100" />
          <Text style={styles.progressTitle}>Progress Lari Saya</Text>
        </View>
        <View style={styles.progressPercentBadge}>
          <Text style={styles.progressPercentText}>{safePercentage}%</Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${safePercentage}%` }]} />
      </View>

      <View style={styles.progressStatsGrid}>
        <View style={styles.progressStatItem}>
          <Text style={styles.progressValue}>{distance} <Text style={{fontSize: 10, fontWeight: 'normal', color: '#64748B'}}>KM</Text></Text>
          <Text style={styles.progressLabel}>Tercapai</Text>
        </View>
        
        <View style={{ width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 4 }} />

        <View style={[styles.progressStatItem, { alignItems: 'center' }]}>
          <Text style={styles.progressValue}>{formatDurationText(duration)}</Text>
          <Text style={styles.progressLabel}>Durasi</Text>
        </View>

        <View style={{ width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 4 }} />

        <View style={[styles.progressStatItem, { alignItems: 'flex-end' }]}>
          <Text style={styles.progressValue}>{target} <Text style={{fontSize: 10, fontWeight: 'normal', color: '#64748B'}}>KM</Text></Text>
          <Text style={styles.progressLabel}>Target</Text>
        </View>
      </View>
    </View>
  );
}