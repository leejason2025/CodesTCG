import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView,
} from 'react-native';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

function GridDemo() {
  const rows = Array.from({ length: 5 }, (_, r) => r);
  const cols = Array.from({ length: 5 }, (_, c) => c);
  return (
    <View style={grid.container}>
      {rows.map(r => (
        <View key={r} style={grid.row}>
          {cols.map(c => (
            <View key={c} style={grid.card}>
              <View style={grid.qrBox} />
              <View style={grid.line} />
              <View style={grid.lineShort} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const grid = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 16,
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  card: {
    width: 46, height: 60,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#00c853',
    padding: 4,
    alignItems: 'center',
    gap: 3,
  },
  qrBox: {
    width: 26, height: 26,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#00c853',
    borderRadius: 2,
  },
  line: {
    width: 30, height: 3,
    backgroundColor: '#c8e6c9',
    borderRadius: 2,
  },
  lineShort: {
    width: 20, height: 3,
    backgroundColor: '#e8f5e9',
    borderRadius: 2,
  },
});

export default function OnboardingModal({ visible, onDismiss }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.iconWrap}>
            <View style={styles.iconCard}>
              <View style={styles.iconQr} />
            </View>
          </View>

          <Text style={styles.title}>Welcome to CodesTCG</Text>
          <Text style={styles.subtitle}>Scan dozens of codes at once — no typing required.</Text>

          <View style={styles.step}>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Lay cards in a flat square grid</Text>
              <Text style={styles.stepDesc}>Place your cards face-up on a flat surface in any square arrangement — works up to a 5×5 grid. Keep them close together but not overlapping.</Text>
              <GridDemo />
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Take a photo or pick from gallery</Text>
              <Text style={styles.stepDesc}>Hold your phone directly above the cards. Make sure all codes are visible and the image is in focus. Good lighting helps — avoid glare.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Review and copy your codes</Text>
              <Text style={styles.stepDesc}>Codes are colour-coded by confidence. Green = high confidence. Yellow = detected by QR only. Red = OCR only — double-check these before using.</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Tips for best results</Text>
            <Text style={styles.tipItem}>• Shoot in bright, even light — avoid direct sunlight glare</Text>
            <Text style={styles.tipItem}>• Hold the phone parallel to the surface (no angle)</Text>
            <Text style={styles.tipItem}>• Cards can be in any orientation — the app handles it</Text>
            <Text style={styles.tipItem}>• Tap any code to edit if a character was misread</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.btnText}>Got it — let's scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 8 },
  iconWrap: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  iconCard: {
    width: 72, height: 72, borderRadius: 16,
    borderWidth: 3, borderColor: '#00c853',
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  iconQr: {
    width: 40, height: 40, backgroundColor: '#e8f5e9',
    borderWidth: 2, borderColor: '#00c853', borderRadius: 4,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  step: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  stepNum: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#00c853', alignItems: 'center', justifyContent: 'center',
    marginTop: 2, flexShrink: 0,
  },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#555', lineHeight: 21 },
  tipBox: {
    backgroundColor: '#f1fdf5', borderRadius: 14,
    borderWidth: 1, borderColor: '#c8f0d8',
    padding: 16, marginTop: 4, marginBottom: 8, gap: 6,
  },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#00a040', marginBottom: 4 },
  tipItem: { fontSize: 13, color: '#444', lineHeight: 20 },
  footer: {
    padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#00c853', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
