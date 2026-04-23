import { scanFromURLAsync } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as ImageManipulator from 'expo-image-manipulator';
import { extractCode, findCodesInText } from './codeParser';
import { ScannedCode, Confidence } from '../types';

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function resolveToFileUri(uri: string): Promise<string> {
  // Re-save the image through ImageManipulator — this bakes in EXIF rotation
  // so ML Kit always receives correctly-oriented pixels regardless of source
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
  console.log('[Scanner] original URI:', imageUri);
  console.log('[Scanner] resolved URI:', fileUri);

  // QR scan from still image
  let qrValues: string[] = [];
  try {
    const scanned = await scanFromURLAsync(fileUri, ['qr']);
    qrValues = scanned.map(r => r.data);
    console.log('[Scanner] QR results:', qrValues.length, qrValues);
  } catch (e) {
    console.log('[Scanner] QR error:', e);
    qrValues = [];
  }

  // OCR scan for cross-validation
  let ocrCodes: string[] = [];
  try {
    const result = await TextRecognition.recognize(fileUri);
    const fullText = result.blocks.map((b: any) => b.text).join(' ');
    console.log('[Scanner] OCR full text:', fullText.slice(0, 500));
    ocrCodes = findCodesInText(fullText);
    console.log('[Scanner] OCR codes found:', ocrCodes);
  } catch (e) {
    console.log('[Scanner] OCR error:', e);
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

  // OCR-only codes not caught by QR
  for (const code of ocrCodes) {
    if (seenCodes.has(code)) continue;
    seenCodes.add(code);
    results.push({ id: makeId(), code, confidence: 'low', scannedAt: Date.now() });
  }

  return results;
}
