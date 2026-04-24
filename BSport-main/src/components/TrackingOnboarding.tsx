import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestDisableBatteryOptimization } from '../services/battery';

const KEY = 'TRACKING_ONBOARDING_DONE';

export default function TrackingOnboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = async () => {
      const done = await AsyncStorage.getItem(KEY);
      if (!done) setVisible(true);
    };
    check();
  }, []);

  const handleDone = async () => {
    await AsyncStorage.setItem(KEY, 'true');
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent>
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000088' }}>
        <View style={{ margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Izinkan Background Tracking
          </Text>

          <Text style={{ marginTop: 10 }}>
            Agar tracking tetap berjalan saat layar mati, izinkan pengaturan berikut.
          </Text>

          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={async () => {
              await requestDisableBatteryOptimization();
              handleDone();
            }}
          >
            <Text>Izinkan</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDone}>
            <Text>Lewati</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}