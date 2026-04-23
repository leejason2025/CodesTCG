import { NativeModules } from 'react-native';

const { VisionOCR } = NativeModules;

export async function recognizeText(imagePath: string): Promise<string> {
  if (!VisionOCR) {
    throw new Error('VisionOCR native module not available');
  }
  return VisionOCR.recognize(imagePath);
}
