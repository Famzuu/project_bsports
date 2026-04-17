import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function EventSkeleton() {
  return (
    <SkeletonPlaceholder borderRadius={10}>
      <View style={{ marginBottom: 20 }}>
        <View style={{ width: '100%', height: 150 }} />
        <View style={{ marginTop: 10 }}>
          <View style={{ width: '60%', height: 20 }} />
          <View style={{ width: '40%', height: 15, marginTop: 6 }} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
}