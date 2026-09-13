'use client';
import { useId, useState } from 'react';
import { known, unknown } from '@/lib/comparison/defaults';
import { parseNumeric } from '@/lib/comparison/validation';
import { describe } from '@/lib/comparison/presentation';
import type { Quantity, Unit } from '@/lib/comparison/types';

export type NumericDraft = { raw: string; active: boolean; error: string; factor: number };
type Props<U extends Unit> = { label: string; value: Quantity<U>; onChange: (q: Quantity<U>) => void; onError: (message: string) => void; draft?: NumericDraft; onDraft: (draft: NumericDraft) => void; frequency: number | null; nonnegative?: boolean; measured?: boolean; displayUnit?: string; factor?: number };
export function QuantityInput<U extends Unit>({ label, value, onChange, onError, draft, onDraft, frequency, nonnegative = false, measured = false, displayUnit, factor = 1 }: Props<U>) {
  const id = useId();
  const [active, setActive] = useState(draft?.active ?? value.kind === 'known');
  const [raw, setRaw] = useState(draft && draft.factor === factor ? draft.raw : value.kind === 'known' ? String(value.value / factor) : '');
  const [error, setError] = useState(draft?.error || '');
  const mark = (message: string, nextRaw = raw, nextActive = active) => { setError(message); onError(message); onDraft({ raw: nextRaw, active: nextActive, error: message, factor }); };
  function change(s: string) {
    setRaw(s);
    const parsed = parseNumeric(s);
    if (parsed.state !== 'valid') { mark(parsed.state === 'empty' || parsed.state === 'editing' ? '入力途中です。数値を完成させるか「まだ分からない」を選んでください' : '数値全体を確認してください（単位・カンマは入力できません）', s); return; }
    const n = parsed.value * factor;
    if (!Number.isFinite(n) || ((nonnegative || value.unit === 'm' || value.unit === 'dB/m') && n < 0) || (value.unit === 'MHz' && n <= 0)) { mark('値が範囲外です', s); return; }
    let q = value.kind === 'known' ? { ...value, value: n, evidence: { ...value.evidence, origin: 'user' as const } } : known(value.unit, n, false, measured ? 'measurement' : 'assumption');
    if (q.kind === 'known' && value.kind === 'unknown' && value.unit !== 'm' && value.unit !== 'MHz' && !measured) q = { ...q, applicability: frequency === null ? { kind: 'unconfirmed', reason: '使用周波数が未確認' } : { kind: 'at-frequency', frequencyMHz: frequency } };
    mark('', s); onChange(q);
  }
  return <div className="quantity">
    <div className="quantity-label"><label htmlFor={id}>{label}（{displayUnit || value.unit}）</label>
      <label className="unknown-toggle"><input type="checkbox" checked={!active} onChange={e => {
        const next = !e.target.checked; setActive(next); setRaw('');
        onChange(unknown(value.unit)); mark(next ? '数値を入力してください' : '', '', next);
      }} />まだ分からない</label></div>
    {active && <><input id={id} type="text" inputMode="decimal" value={raw} aria-invalid={Boolean(error)} aria-describedby={`${id}-error`} onChange={e => change(e.target.value)} autoComplete="off" spellCheck={false} />
      <p id={`${id}-error`} className="field-error">{error}</p></>}
    {value.kind === 'known' && active && !error && <details className="evidence"><summary>根拠・適用条件</summary>
      <p>{describe(value)}</p>
      {!measured && <label>根拠の区分<select value={value.evidence.kind} onChange={e => onChange({ ...value, evidence: { ...value.evidence, origin: 'user', kind: e.target.value as 'assumption' | 'datasheet' | 'measurement' } })}><option value="assumption">仮定</option><option value="datasheet">条件を確認した資料</option><option value="measurement">切り分けた測定</option></select></label>}
      <label>資料名・記録名<input value={value.evidence.sourceLabel} maxLength={2000} onChange={e => onChange({ ...value, evidence: { ...value.evidence, sourceLabel: e.target.value } })} /></label>
      <label>資料・測定の適用条件<textarea maxLength={2000} value={value.evidence.conditions} onChange={e => onChange({ ...value, evidence: { ...value.evidence, conditions: e.target.value } })} /></label>
      {!measured && value.unit !== 'm' && value.unit !== 'MHz' && <div className="actions"><button type="button" disabled={frequency === null} onClick={() => onChange({ ...value, applicability: { kind: 'at-frequency', frequencyMHz: frequency! } })}>今回の周波数で使う根拠を確認した</button><button type="button" onClick={() => onChange({ ...value, applicability: { kind: 'unconfirmed', reason: '適用を確認中' } })}>適用は未確認</button></div>}
    </details>}
  </div>;
}
