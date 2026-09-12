import { evaluate } from './domain';
import { linkCoefficient } from './defaults';
import type { ComparisonRequest, Evaluation, Preferences } from './types';
import { choice, InputError, object, text, validateRequest } from './validation';
export const STORAGE_KEY = 'staf.cable-position-comparison.v2';
export const MAX_BYTES = 1024 * 1024;
export type SavedCase = { schemaVersion: 2; modelVersion: string; savedAt: string; request: ComparisonRequest; uiPreferences: Preferences; resultSnapshot: Evaluation; catalogReferences: { id: string; revision: string }[] };
export function saveCase(input: ComparisonRequest, uiPreferences: Preferences, now = new Date().toISOString()): SavedCase {
  const request = validateRequest(linkCoefficient(input, uiPreferences.linkedCoefficient));
  const resultSnapshot = evaluate(request);
  if (resultSnapshot.status === 'invalid') throw new InputError('不正な入力は保存できません');
  return { schemaVersion: 2, modelVersion: 'comparison-v2', savedAt: now, request, uiPreferences, resultSnapshot, catalogReferences: [] };
}
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(',')}}`;
  return JSON.stringify(v);
}
export function readCase(raw: string): { saved: SavedCase; legacy: boolean; warning: string; archivedSnapshot: string } {
  if (new TextEncoder().encode(raw).length > MAX_BYTES) throw new InputError('JSONは1MB以下にしてください');
  const s = object(JSON.parse(raw));
  if (s.schemaVersion !== 2) throw new InputError('非対応の保存形式です。元のアプリで参照してください');
  const modelVersion = text(s.modelVersion), savedAt = text(s.savedAt);
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(savedAt) || !Number.isFinite(Date.parse(savedAt)) || new Date(savedAt).toISOString() !== savedAt) throw new InputError('保存日時が不正です');
  const p = object(s.uiPreferences);
  if (typeof p.linkedCoefficient !== 'boolean') throw new InputError('連動状態が不正です');
  const uiPreferences: Preferences = { lengthUnit: choice(p.lengthUnit, ['m', 'cm', 'mm']), frequencyUnit: choice(p.frequencyUnit, ['MHz', 'GHz']), linkedCoefficient: p.linkedCoefficient };
  const request = validateRequest(s.request);
  if (stable(request) !== stable(linkCoefficient(request, uiPreferences.linkedCoefficient))) throw new InputError('連動中の係数が一致しません');
  if (!Array.isArray(s.catalogReferences) || s.catalogReferences.length > 20) throw new InputError('資料参照が不正です');
  const catalogReferences = s.catalogReferences.map(r => { const ref = object(r); return { id: text(ref.id), revision: text(ref.revision) }; });
  const calculated = evaluate(request);
  if (calculated.status === 'invalid') throw new InputError(calculated.issues[0].message);
  const legacy = modelVersion !== 'comparison-v2';
  // 旧モデルは数値結論を採用しない。検証済み入力の参照と明示再計算だけを許す。
  if (!legacy && stable(calculated) !== stable(s.resultSnapshot)) throw new InputError('保存時点の結果と入力の再評価が一致しません');
  return { saved: { schemaVersion: 2, modelVersion, savedAt, request, uiPreferences, resultSnapshot: calculated, catalogReferences }, legacy, archivedSnapshot: legacy ? JSON.stringify(s.resultSnapshot, null, 2) : '', warning: raw.includes('approved-catalog') || catalogReferences.length ? '外部ファイルの承認申告は未確認です。当社承認済みとして扱いません。' : '' };
}
