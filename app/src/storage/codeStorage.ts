import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScannedCode } from '../types';

const STORAGE_KEY = 'tcg_codes';

export async function loadCodes(): Promise<ScannedCode[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCodes(codes: ScannedCode[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
}

export async function appendCodes(newCodes: ScannedCode[]): Promise<ScannedCode[]> {
  const existing = await loadCodes();
  const merged = [...existing, ...newCodes];
  await saveCodes(merged);
  return merged;
}

export async function deleteCode(id: string): Promise<ScannedCode[]> {
  const existing = await loadCodes();
  const updated = existing.filter(c => c.id !== id);
  await saveCodes(updated);
  return updated;
}

export async function updateCode(id: string, code: string): Promise<ScannedCode[]> {
  const existing = await loadCodes();
  const updated = existing.map(c => c.id === id ? { ...c, code } : c);
  await saveCodes(updated);
  return updated;
}

export async function clearAllCodes(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
