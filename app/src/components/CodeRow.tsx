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
  high: '#00c853',
  medium: '#ffb300',
  low: '#f44336',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    shadowColor: '#00c853',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  code: { flex: 1, color: '#1a1a1a', fontFamily: 'monospace', fontSize: 15, letterSpacing: 1 },
  btns: { flexDirection: 'row', gap: 6 },
  btn: { paddingHorizontal: 8, paddingVertical: 4 },
  btnText: { color: '#00c853', fontSize: 13, fontWeight: '700' },
  deleteText: { color: '#f44336' },
});
