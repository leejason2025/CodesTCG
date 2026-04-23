import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScannedCode } from '../types';
import { scanImageForCodes } from '../utils/scanner';
import { loadCodes, appendCodes, deleteCode, updateCode, clearAllCodes } from '../storage/codeStorage';
import CodeRow from '../components/CodeRow';
import ScanButton from '../components/ScanButton';
import EditCodeModal from '../components/EditCodeModal';
import OnboardingModal from '../components/OnboardingModal';

const ONBOARDING_KEY = 'onboarding_seen_v1';

export default function HomeScreen() {
  const [codes, setCodes] = useState<ScannedCode[]>([]);
  const [scanning, setScanning] = useState(false);
  const [editTarget, setEditTarget] = useState<ScannedCode | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadCodes().then(setCodes);
    AsyncStorage.getItem(ONBOARDING_KEY).then(seen => {
      if (!seen) setShowOnboarding(true);
    });
    // Request permissions upfront so gallery/camera open on first tap
    ImagePicker.requestMediaLibraryPermissionsAsync();
    ImagePicker.requestCameraPermissionsAsync();
  }, []);

  const dismissOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>CodesTCG</Text>
        <View style={styles.headerRight}>
          {codes.length > 0 && (
            <Text style={styles.count}>{codes.length} code{codes.length === 1 ? '' : 's'}</Text>
          )}
          <TouchableOpacity onPress={() => setShowOnboarding(true)} style={styles.helpBtn}>
            <Text style={styles.helpText}>?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {codes.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <View style={styles.emptyQr} />
            </View>
            <Text style={styles.emptyText}>No codes yet</Text>
            <Text style={styles.emptyHint}>Lay your cards flat in a grid, snap a photo, and all codes will be extracted automatically.</Text>
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
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyAll}>
              <Text style={styles.copyBtnText}>Copy All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
        <ScanButton scanning={scanning} onCamera={() => pickAndScan(true)} onGallery={() => pickAndScan(false)} />
      </View>

      {editTarget && (
        <EditCodeModal code={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />
      )}

      <OnboardingModal visible={showOnboarding} onDismiss={dismissOnboarding} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fdf9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { fontSize: 14, color: '#00a040', fontWeight: '600' },
  helpBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#00c853',
  },
  helpText: { color: '#00c853', fontWeight: '800', fontSize: 15, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#e8f5e9' },
  body: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 16,
    borderWidth: 2.5, borderColor: '#00c853',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  emptyQr: {
    width: 40, height: 40, backgroundColor: '#e8f5e9',
    borderWidth: 2, borderColor: '#00c853', borderRadius: 4,
  },
  emptyText: { fontSize: 20, color: '#1a1a1a', marginBottom: 10, fontWeight: '700' },
  emptyHint: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    paddingTop: 10,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8f5e9',
  },
  topActions: { flexDirection: 'row', gap: 10 },
  copyBtn: {
    flex: 1, backgroundColor: '#e8f5e9', paddingVertical: 12,
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#c8f0d8',
  },
  copyBtnText: { color: '#00a040', fontWeight: '700', fontSize: 15 },
  clearBtn: {
    flex: 1, backgroundColor: '#fff5f5', paddingVertical: 12,
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ffcdd2',
  },
  clearBtnText: { color: '#f44336', fontWeight: '700', fontSize: 15 },
});
