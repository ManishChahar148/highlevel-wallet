// Handle money in integer micro-units (×10000)
export const SCALE = 10000n; // 4 decimal places

export function parseAmountToUnits(input: unknown): bigint {
  if (typeof input !== 'number' && typeof input !== 'string') {
    throw new Error('amount must be a number or string');
  }
  const s = String(input).trim();
  if (!/^[-+]?\d+(?:\.\d{1,4})?$/.test(s)) {
    throw new Error('amount must have up to 4 decimal places');
  }
  const [intPart, fracPart = ''] = s.replace('+', '').split('.');
  const frac = (fracPart + '0000').slice(0, 4); // right-pad to 4
  const sign = s.startsWith('-') ? -1n : 1n;
  const units = BigInt(intPart.replace('-', '')) * SCALE + BigInt(frac);
  return sign * units;
}

export function unitsToDecimal(units: bigint): number {
  const sign = units < 0n ? -1 : 1;
  const abs = units < 0n ? -units : units;
  const intPart = abs / SCALE;
  const fracPart = abs % SCALE;
  const str = `${intPart}.${fracPart.toString().padStart(4, '0')}`;
  return sign * Number(str);
}

export function format4(units: bigint): string {
  const n = unitsToDecimal(units);
  return n.toFixed(4);
}
