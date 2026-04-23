import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ScannedCode, Confidence } from '../types';

interface Props {
  item: ScannedCode;
  onDelete: (id: string) => void;
  onEdit: (code: ScannedCode) => void;
}

const CONFIDENCE_COLORS: Record<Confidence, string> = {
  high: '#30d158',
  medium: '#ffd60a',
  low: '#ff453a',
};

export default function CodeRow({ item, onDelete, onEdit }: Props) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(item.code);
  };

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: CONFIDENCE_COLORS[item.confidence] }]} />
      <Text style={styles.code} selectable>{item.code}</Text>
      <View style={styles.btns}>
        <TouchableOpacity onPress={handleCopy} style={styles.btn}>
          <Text style={styles.btnText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.btn}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.btn}>
          <Text style={[styles.btnText, styles.deleteText]}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1c1c1e', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8,
    gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  code: { flex: 1, color: '#fff', fontFamily: 'monospace', fontSize: 15, letterSpacing: 1 },
  btns: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 8, paddingVertical: 4 },
  btnText: { color: '#4a9eff', fontSize: 13, fontWeight: '600' },
  deleteText: { color: '#ff453a' },
});
