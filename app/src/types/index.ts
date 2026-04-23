export type Confidence = 'high' | 'medium' | 'low';

export interface ScannedCode {
  id: string;
  code: string;
  confidence: Confidence;
  scannedAt: number;
}

export interface ScanSession {
  id: string;
  codes: ScannedCode[];
  scannedAt: number;
}
