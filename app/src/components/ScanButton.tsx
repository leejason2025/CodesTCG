import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

interface Props {
  scanning: boolean;
  onCamera: () => void;
  onGallery: () => void;
}

export default function ScanButton({ scanning, onCamera, onGallery }: Props) {
  if (scanning) {
    return (
      <View style={styles.scanningBox}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.scanningText}>Scanning...</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, styles.cameraBtn]} onPress={onCamera} activeOpacity={0.8}>
        <Text style={styles.btnText}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.galleryBtn]} onPress={onGallery} activeOpacity={0.8}>
        <Text style={styles.btnText}>From Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraBtn: { backgroundColor: '#4a9eff' },
  galleryBtn: { backgroundColor: '#2c2c2e' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  scanningBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1c1c1e', paddingVertical: 16, borderRadius: 12, gap: 12,
  },
  scanningText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
