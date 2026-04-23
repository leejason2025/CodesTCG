import { scanFromURLAsync } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { extractCode, findCodesInText } from './codeParser';
import { recognizeText } from './visionOCR';
import { ScannedCode, Confidence } from '../types';

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function resolveToFileUri(uri: string): Promise<string> {
  // Re-save the image through ImageManipulator — this bakes in EXIF rotation
  // so Vision always receives correctly-oriented pixels regardless of source
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
}

export async function scanImageForCodes(imageUri: string): Promise<ScannedCode[]> {
  const results: ScannedCode[] = [];
  const seenCodes = new Set<string>();

  const fileUri = await resolveToFileUri(imageUri);

  // QR scan from still image
  let qrValues: string[] = [];
  try {
    const scanned = await scanFromURLAsync(fileUri, ['qr']);
    qrValues = scanned.map(r => r.data);
  } catch {
    qrValues = [];
  }

  // Apple Vision OCR — full resolution, no downsampling
  let ocrCodes: string[] = [];
  try {
    const text = await recognizeText(fileUri);
    ocrCodes = findCodesInText(text);
  } catch {
    ocrCodes = [];
  }

  // Process QR detections
  for (const raw of qrValues) {
    const code = extractCode(raw);
    if (!code || seenCodes.has(code)) continue;
    seenCodes.add(code);
    const confidence: Confidence = ocrCodes.includes(code) ? 'high' : 'medium';
    results.push({ id: makeId(), code, confidence, scannedAt: Date.now() });
  }

  // OCR-only codes
  for (const code of ocrCodes) {
    if (seenCodes.has(code)) continue;
    seenCodes.add(code);
    results.push({ id: makeId(), code, confidence: 'low', scannedAt: Date.now() });
  }

  return results;
}
