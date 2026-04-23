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
            placeholderTextColor="#555"
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
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1c1c1e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: {
    backgroundColor: '#2c2c2e', color: '#fff', fontSize: 17,
    fontFamily: 'monospace', letterSpacing: 1,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#3a3a3c',
  },
  inputError: { borderColor: '#ff453a' },
  errorText: { color: '#ff453a', fontSize: 12, marginTop: 6 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, backgroundColor: '#2c2c2e', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  cancelText: { color: '#aaa', fontWeight: '600', fontSize: 16 },
  saveBtn: {
    flex: 1, backgroundColor: '#4a9eff', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#2c2c2e' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
