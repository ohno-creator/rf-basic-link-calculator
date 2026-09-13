import { conditionKeys, type Applicability, type ComparisonRequest, type Context, type Evidence, type FeedLoss, type Quantity, type Unit } from './types';

export class InputError extends Error {}
export function object(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new InputError('オブジェクトの形式が不正です');
  return v as Record<string, unknown>;
}
export function text(v: unknown): string {
  if (typeof v !== 'string' || v.length > 2000) throw new InputError('文字列は2,000文字以内にしてください');
  return v;
}
export function choice<T extends string>(v: unknown, values: readonly T[]): T {
  if (typeof v !== 'string' || !values.includes(v as T)) throw new InputError('選択値が不正です');
  return v as T;
}
function finite(v: unknown, min = -Infinity, exclusive = false): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || (exclusive ? v <= min : v < min)) throw new InputError('数値が範囲外または有限数ではありません');
  return v;
}
export function parseNumeric(raw: string): { state: 'valid'; value: number } | { state: 'empty' | 'editing' | 'invalid' } {
  // 対応表にある全角数字、小数点、符号だけを正規化する。単位やカンマは除去しない。
  const s = raw.trim().replace(/[０-９]/g, c => String(c.charCodeAt(0) - 0xff10)).replace(/．/g, '.').replace(/[−－]/g, '-').replace(/＋/g, '+');
  if (!s) return { state: 'empty' };
  if (/^[+-]?\.?$/.test(s) || /^[+-]?(?:\d+\.?\d*|\.\d+)[eE][+-]?$/.test(s)) return { state: 'editing' };
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(s) || !Number.isFinite(Number(s))) return { state: 'invalid' };
  return { state: 'valid', value: Number(s) };
}
function applicability(v: unknown): Applicability {
  const a = object(v);
  switch (a.kind) {
    case 'frequency-independent': return { kind: a.kind };
    case 'at-frequency': return { kind: a.kind, frequencyMHz: finite(a.frequencyMHz, 0, true) };
    case 'within-range': {
      const minMHz = finite(a.minMHz, 0, true), maxMHz = finite(a.maxMHz, minMHz);
      return { kind: a.kind, minMHz, maxMHz };
    }
    case 'unconfirmed': return { kind: a.kind, reason: text(a.reason) };
    default: throw new InputError('周波数適用条件が不正です');
  }
}
function evidence(v: unknown): Evidence {
  const e = object(v);
  const origin = choice(e.origin, ['example', 'user', 'approved-catalog']);
  const ref = e.sourceRef === undefined ? undefined : object(e.sourceRef);
  // P0同梱の公開承認データは0件。外部JSONの承認申告を信用しない。
  return {
    kind: choice(e.kind, ['assumption', 'datasheet', 'measurement']),
    origin: origin === 'approved-catalog' ? 'user' : origin,
    sourceLabel: text(e.sourceLabel), conditions: text(e.conditions),
    derivation: choice(e.derivation, ['direct', 'linear-interpolation']),
    ...(ref ? { sourceRef: { id: text(ref.id), revision: text(ref.revision) } } : {})
  };
}
export function quantity<U extends Unit>(v: unknown, unit: U, nonnegative = false, measured = false): Quantity<U> {
  const q = object(v);
  if (q.unit !== unit) throw new InputError('単位が不正です');
  if (q.kind === 'unknown') return { kind: 'unknown', unit, reason: text(q.reason) };
  if (q.kind !== 'known') throw new InputError('数値状態が不正です');
  const value = finite(q.value, unit === 'MHz' || nonnegative ? 0 : -Infinity, unit === 'MHz');
  const e = evidence(q.evidence), a = applicability(q.applicability);
  if (unit === 'dB/m' && a.kind === 'frequency-independent') throw new InputError('損失係数には適用周波数が必要です');
  if (measured && (e.kind !== 'measurement' || e.derivation !== 'direct')) throw new InputError('測定欄には直接の測定記録を入力してください');
  if (a.kind === 'within-range' && !e.conditions.trim()) throw new InputError('範囲内で使える資料の条件を記録してください');
  return { kind: 'known', value, unit, evidence: e, applicability: a };
}
function context(v: unknown): Context {
  const c = object(v);
  if (!Array.isArray(c.checks) || c.checks.length > conditionKeys.length) throw new InputError('比較条件の件数が不正です');
  const checks = c.checks.map(item => {
    const i = object(item);
    return { key: choice(i.key, conditionKeys), state: choice(i.state, ['confirmed', 'assumed', 'unknown', 'mismatch']), note: text(i.note) };
  });
  if (new Set(checks.map(c => c.key)).size !== checks.length) throw new InputError('比較条件が重複しています');
  for (const key of conditionKeys) if (!checks.some(c => c.key === key)) checks.push({ key, state: 'unknown', note: '未入力' });
  return { frequencyMHz: quantity(c.frequencyMHz, 'MHz'), checks, scope: choice(c.scope, ['passive-single-feed', 'unknown', 'out-of-scope']), notes: text(c.notes) };
}
function feed(v: unknown): FeedLoss {
  const f = object(v);
  switch (f.mode) {
    case 'unknown': return { mode: f.mode, reason: text(f.reason) };
    case 'per-length': return { mode: f.mode, lengthM: quantity(f.lengthM, 'm', true), lossDbPerM: quantity(f.lossDbPerM, 'dB/m', true), connectorsTotalLossDb: quantity(f.connectorsTotalLossDb, 'dB', true) };
    case 'assembly-total': return { mode: f.mode, totalLossDb: quantity(f.totalLossDb, 'dB', true), assemblyLabel: text(f.assemblyLabel), includedComponents: text(f.includedComponents), boundary: choice(f.boundary, ['radio-to-antenna-feed', 'unknown']) };
    default: throw new InputError('経路入力の方式が不正です');
  }
}
export function validateRequest(v: unknown): ComparisonRequest {
  const r = object(v), c = context(r.context);
  if (r.method === 'decomposed') {
    const placementOnlyChangeDb = quantity(r.placementOnlyChangeDb, 'dB');
    const placementBasis = choice(r.placementBasis, ['not-known', 'hypothesis', 'isolated-measurement', 'applicable-reference', 'unconfirmed']);
    if (placementOnlyChangeDb.kind === 'known') {
      const expected = { hypothesis: 'assumption', 'isolated-measurement': 'measurement', 'applicable-reference': 'datasheet', unconfirmed: null, 'not-known': null }[placementBasis];
      if (placementBasis === 'not-known' || (expected && placementOnlyChangeDb.evidence.kind !== expected)) throw new InputError('配置効果と根拠の区分が一致しません');
    }
    return { method: r.method, context: c, before: feed(r.before), after: feed(r.after), placementOnlyChangeDb, placementBasis };
  }
  if (r.method !== 'measured-net') throw new InputError('比較方式が不正です');
  const m = object(r.measured);
  const common = { method: r.method, context: c, captureKind: choice(r.captureKind, ['single-pair', 'summary-value']), measurementNote: text(r.measurementNote) } as const;
  if (m.mode === 'delta-only') return { ...common, measured: { mode: m.mode, metric: choice(m.metric, ['RSSI', 'RSRP']), deltaDb: quantity(m.deltaDb, 'dB', false, true) } };
  if (m.mode !== 'paired-levels') throw new InputError('測定入力方式が不正です');
  const b = object(m.before), a = object(m.after);
  const before = { metric: choice(b.metric, ['RSSI', 'RSRP']), levelDbm: quantity(b.levelDbm, 'dBm', false, true) };
  const after = { metric: choice(a.metric, ['RSSI', 'RSRP']), levelDbm: quantity(a.levelDbm, 'dBm', false, true) };
  if (before.metric !== after.metric) throw new InputError('RSSIとRSRPは差を計算できません。同一指標にしてください');
  return { ...common, measured: { mode: m.mode, before, after } };
}
