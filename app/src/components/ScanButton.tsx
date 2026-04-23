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
        <ActivityIndicator color="#00c853" />
        <Text style={styles.scanningText}>Scanning...</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, styles.cameraBtn]} onPress={onCamera} activeOpacity={0.85}>
        <Text style={styles.cameraBtnText}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.galleryBtn]} onPress={onGallery} activeOpacity={0.85}>
        <Text style={styles.galleryBtnText}>From Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraBtn: { backgroundColor: '#00c853' },
  galleryBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00c853',
  },
  cameraBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  galleryBtnText: { color: '#00c853', fontWeight: '700', fontSize: 16 },
  scanningBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f1fdf5', paddingVertical: 16, borderRadius: 14,
    gap: 12, borderWidth: 1, borderColor: '#c8f0d8',
  },
  scanningText: { color: '#00c853', fontSize: 16, fontWeight: '600' },
});
