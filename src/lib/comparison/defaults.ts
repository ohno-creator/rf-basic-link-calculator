import { conditionKeys, type ComparisonRequest, type Context, type Decomposed, type Evidence, type Measured, type Quantity, type Unit } from './types';
export const unknown = <U extends Unit>(unit: U): Quantity<U> => ({ kind: 'unknown', unit, reason: 'まだ分からない' });
export function known<U extends Unit>(unit: U, value: number, example = false, kind: Evidence['kind'] = 'assumption'): Quantity<U> {
  return { kind: 'known', unit, value, evidence: { kind, origin: example ? 'example' : 'user', sourceLabel: example ? '説明用の仮定。実製品値ではありません' : '', conditions: '', derivation: 'direct' }, applicability: unit === 'm' || unit === 'MHz' || unit === 'dBm' ? { kind: 'frequency-independent' } : { kind: 'at-frequency', frequencyMHz: 2400 } };
}
export function newContext(example = false): Context {
  return { frequencyMHz: example ? known('MHz', 2400, true) : unknown('MHz'), scope: example ? 'passive-single-feed' : 'unknown', checks: conditionKeys.map(key => ({ key, state: example ? 'assumed' : 'unknown', note: example ? '説明例の仮定' : '' })), notes: '' };
}
export function decomposed(example = false): Decomposed {
  const feed = (length: number) => ({ mode: 'per-length' as const, lengthM: example ? known('m', length, true) : unknown('m'), lossDbPerM: example ? known('dB/m', 0.6, true) : unknown('dB/m'), connectorsTotalLossDb: example ? known('dB', 0, true) : unknown('dB') });
  return { method: 'decomposed', context: newContext(example), before: feed(1), after: feed(3), placementOnlyChangeDb: unknown('dB'), placementBasis: 'not-known' };
}
export function measured(example = false): Measured {
  return { method: 'measured-net', context: newContext(example), measured: { mode: 'paired-levels', before: { metric: 'RSSI', levelDbm: example ? known('dBm', -80, true, 'measurement') : unknown('dBm') }, after: { metric: 'RSSI', levelDbm: example ? known('dBm', -77, true, 'measurement') : unknown('dBm') } }, captureKind: 'single-pair', measurementNote: '' };
}
export function linkCoefficient(r: ComparisonRequest, linked: boolean): ComparisonRequest {
  if (!linked || r.method !== 'decomposed' || r.before.mode !== 'per-length' || r.after.mode !== 'per-length') return r;
  return { ...r, after: { ...r.after, lossDbPerM: r.before.lossDbPerM } };
}
