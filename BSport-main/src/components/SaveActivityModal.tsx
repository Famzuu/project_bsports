import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface Props {
  visible: boolean;
  onDiscard: () => void;
  onSave: () => void;
  styles: any;
  isDarkMode?: boolean; // Terima isDarkMode sebagai props opsional
}

export default function SaveActivityModal({ visible, onDiscard, onSave, styles, isDarkMode }: Props) {
  // Jika dark mode, teks discard dibuat putih, jika terang, warna merah.
  const discardTextColor = isDarkMode ? '#FFFFFF' : '#FF3B30'; 
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Save Activity?</Text>
          <Text style={styles.confirmText}>
            This activity will be saved to your personal history.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalBtnDiscard} onPress={onDiscard}>
              <Text style={{ fontWeight: 'bold', color: discardTextColor }}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSave} onPress={onSave}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}