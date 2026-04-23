const CODE_REGEX = /\b[A-HJ-NP-Z2-9]{3}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{3}-[A-HJ-NP-Z2-9]{3}\b/g;

export function extractCode(raw: string): string | null {
  const upper = raw.toUpperCase();
  const match = upper.match(CODE_REGEX);
  return match ? match[0] : null;
}

export function isValidCode(code: string): boolean {
  return CODE_REGEX.test(code.toUpperCase());
}

export function findCodesInText(text: string): string[] {
  const upper = text.toUpperCase();
  const matches = upper.match(CODE_REGEX);
  return matches ? [...new Set(matches)] : [];
}
