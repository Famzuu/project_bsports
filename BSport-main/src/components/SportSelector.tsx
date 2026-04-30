import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Flame, Bike, Footprints } from 'lucide-react-native';

interface Props {
  sportType: string;
  setSportType: (type: string) => void;
  isDarkMode: boolean;
  THEME: any;
}

export default function SportSelector({ sportType, setSportType, isDarkMode, THEME }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderRadius: 30,
        padding: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
    >
      {[
        { id: 'run', label: 'Lari', icon: Flame },
        { id: 'ride', label: 'Sepeda', icon: Bike },
        { id: 'walk', label: 'Jalan', icon: Footprints },
      ].map(item => {
        const isActive = sportType === item.id;
        const IconComp = item.icon;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSportType(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: isActive ? 20 : 16,
              borderRadius: 24,
              backgroundColor: isActive ? THEME.ACCENT : 'transparent',
            }}
          >
            <IconComp size={20} color={isActive ? '#FFFFFF' : '#9CA3AF'} />
            {isActive && (
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 8, fontSize: 14 }}>
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}