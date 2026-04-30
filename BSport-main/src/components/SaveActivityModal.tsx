// src/components/SaveActivityModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface Props {
  visible: boolean;
  onDiscard: () => void;
  onSave: () => void;
  styles: any;
}

export default function SaveActivityModal({ visible, onDiscard, onSave, styles }: Props) {
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
              <Text style={{ fontWeight: 'bold' }}>Discard</Text>
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