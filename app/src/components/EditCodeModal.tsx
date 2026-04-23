import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ScannedCode } from '../types';
import { isValidCode } from '../utils/codeParser';

interface Props {
  code: ScannedCode;
  onSave: (id: string, newCode: string) => void;
  onClose: () => void;
}

export default function EditCodeModal({ code, onSave, onClose }: Props) {
  const [value, setValue] = useState(code.code);
  const valid = isValidCode(value);

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit Code</Text>
          <TextInput
            style={[styles.input, !valid && value.length > 0 && styles.inputError]}
            value={value}
            onChangeText={v => setValue(v.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            spellCheck={false}
            maxLength={19}
            placeholder="XXX-XXXX-XXX-XXX"
            placeholderTextColor="#aaa"
          />
          {!valid && value.length > 0 && (
            <Text style={styles.errorText}>Format: XXX-XXXX-XXX-XXX (letters and numbers)</Text>
          )}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !valid && styles.saveBtnDisabled]}
              onPress={() => valid && onSave(code.id, value)}
              disabled={!valid}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 20,
  },
  title: { color: '#1a1a1a', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: {
    backgroundColor: '#f7fdf9', color: '#1a1a1a', fontSize: 17,
    fontFamily: 'monospace', letterSpacing: 1,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#c8f0d8',
  },
  inputError: { borderColor: '#f44336' },
  errorText: { color: '#f44336', fontSize: 12, marginTop: 6 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, backgroundColor: '#f5f5f5', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  cancelText: { color: '#888', fontWeight: '600', fontSize: 16 },
  saveBtn: {
    flex: 1, backgroundColor: '#00c853', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#e0e0e0' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
