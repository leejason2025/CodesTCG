import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { ScannedCode } from '../types';
import { scanImageForCodes } from '../utils/scanner';
import { loadCodes, appendCodes, deleteCode, updateCode, clearAllCodes } from '../storage/codeStorage';
import CodeRow from '../components/CodeRow';
import ScanButton from '../components/ScanButton';
import EditCodeModal from '../components/EditCodeModal';

export default function HomeScreen() {
  const [codes, setCodes] = useState<ScannedCode[]>([]);
  const [scanning, setScanning] = useState(false);
  const [editTarget, setEditTarget] = useState<ScannedCode | null>(null);

  useEffect(() => {
    loadCodes().then(setCodes);
  }, []);

  const runScan = useCallback(async (uri: string) => {
    setScanning(true);
    try {
      const found = await scanImageForCodes(uri);
      if (found.length === 0) {
        Alert.alert('No codes found', 'No TCG codes were detected. Try a clearer photo with better lighting.');
        return;
      }
      const merged = await appendCodes(found);
      setCodes(merged);
      Alert.alert(`Found ${found.length} code${found.length === 1 ? '' : 's'}`, found.map(c => c.code).join('\n'));
    } catch (e) {
      Alert.alert('Scan failed', 'Something went wrong. Please try again.');
    } finally {
      setScanning(false);
    }
  }, []);

  const pickAndScan = useCallback(async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to take photos.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library access is required to select images.');
        return;
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 1,
      exif: false,
      base64: false,
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets?.length) return;
    await runScan(result.assets[0].uri);
  }, [runScan]);

  const handleDelete = useCallback(async (id: string) => {
    const updated = await deleteCode(id);
    setCodes(updated);
  }, []);

  const handleEdit = useCallback((code: ScannedCode) => {
    setEditTarget(code);
  }, []);

  const handleSaveEdit = useCallback(async (id: string, newCode: string) => {
    const updated = await updateCode(id, newCode);
    setCodes(updated);
    setEditTarget(null);
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (codes.length === 0) return;
    await Clipboard.setStringAsync(codes.map(c => c.code).join('\n'));
    Alert.alert('Copied', `${codes.length} codes copied to clipboard.`);
  }, [codes]);

  const handleClearAll = useCallback(() => {
    Alert.alert('Clear all codes?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: async () => {
          await clearAllCodes();
          setCodes([]);
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <Text style={styles.title}>TCG Code Scanner</Text>
        {codes.length > 0 && (
          <Text style={styles.count}>{codes.length} code{codes.length === 1 ? '' : 's'}</Text>
        )}
      </View>

      <View style={styles.body}>
        {codes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No codes yet.</Text>
            <Text style={styles.emptyHint}>Lay your cards flat, snap a photo, and all codes will be extracted automatically.</Text>
          </View>
        ) : (
          <FlatList
            data={codes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CodeRow item={item} onDelete={handleDelete} onEdit={handleEdit} />
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      <View style={styles.actions}>
        {codes.length > 0 && (
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleCopyAll}>
              <Text style={styles.secondaryBtnText}>Copy All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleClearAll}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
        <ScanButton scanning={scanning} onCamera={() => pickAndScan(true)} onGallery={() => pickAndScan(false)} />
      </View>

      {editTarget && (
        <EditCodeModal code={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  count: { fontSize: 14, color: '#888' },
  body: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 18, color: '#555', marginBottom: 12, fontWeight: '600' },
  emptyHint: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 22 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    gap: 10,
    backgroundColor: '#0a0a0a',
  },
  topActions: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1, backgroundColor: '#1c1c1e', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center',
  },
  secondaryBtnText: { color: '#4a9eff', fontWeight: '600', fontSize: 15 },
  clearBtnText: { color: '#ff453a', fontWeight: '600', fontSize: 15 },
});
