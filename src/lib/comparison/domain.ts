import type { Artifact, ComparisonRequest, Evaluation, FeedLoss, Interpretation, Issue, Quantity } from './types';
import { validateRequest } from './validation';

export function evaluate(input: unknown): Evaluation {
  let r: ComparisonRequest;
  try { r = validateRequest(input); } catch (e) { return { status: 'invalid', artifacts: [], issues: [{ code: 'invalid-input', fieldPath: '', severity: 'error', message: e instanceof Error ? e.message : '入力が不正です' }] }; }
  const issues: Issue[] = [], artifacts: Artifact[] = [], used: Quantity[] = [];
  const notice = (path: string, message: string) => issues.push({ code: 'review', fieldPath: path, severity: 'review', message });
  const f = r.context.frequencyMHz.kind === 'known' ? r.context.frequencyMHz.value : null;
  if (f === null) notice('context.frequencyMHz', '使用周波数が未確認です');
  const checks = r.context.checks.filter(c => r.method === 'measured-net' || c.key !== 'measurement-method');
  let interpretation: Interpretation = r.context.scope === 'out-of-scope' ? 'out-of-scope'
    : checks.some(c => c.state === 'mismatch') ? 'not-comparable'
    : r.context.scope === 'unknown' || f === null || checks.some(c => c.state === 'unknown') ? 'needs-review'
    : checks.some(c => c.state === 'assumed') ? 'conditional' : 'comparable';
  if (r.context.scope !== 'passive-single-feed') notice('context.scope', '単一の受動給電経路のモデルに適用できるか未確認、または対象外です');
  for (const c of checks) if (c.state === 'unknown' || c.state === 'mismatch') notice(`context.checks.${c.key}`, `比較条件 ${c.key}：${c.state === 'mismatch' ? '異なる' : '未確認'}`);
  const value = (q: Quantity, path: string, record = false): number | null => {
    if (q.kind === 'unknown') { notice(path, `${path}：未確認（${q.reason}）`); return null; }
    const a = q.applicability;
    // 前後の表示値そのものの記録は周波数未確認でも残す。効果の解釈は別に制限する。
    if (!record && (a.kind === 'unconfirmed' || (a.kind === 'at-frequency' && (f === null || f !== a.frequencyMHz)) || (a.kind === 'within-range' && (f === null || f < a.minMHz || f > a.maxMHz)))) {
      notice(path, `${path}：今回の周波数への適用が未確認です`); return null;
    }
    used.push(q); return q.value;
  };
  function loss(feed: FeedLoss, side: 'before' | 'after'): number | null {
    if (feed.mode === 'unknown') { notice(side, `${side}：経路損失が未確認です`); return null; }
    if (feed.mode === 'assembly-total') {
      if (feed.boundary === 'unknown') { notice(side, '完成経路に含めた部品と基準点を確認してください'); return null; }
      return value(feed.totalLossDb, `${side}.totalLossDb`);
    }
    const l = value(feed.lengthM, `${side}.lengthM`), k = value(feed.lossDbPerM, `${side}.lossDbPerM`), c = value(feed.connectorsTotalLossDb, `${side}.connectorsTotalLossDb`);
    // L[dB] = 長さ[m] × 損失係数[dB/m] + コネクタ合計損失[dB]。
    return l === null || k === null || c === null ? null : l * k + c;
  }
  if (r.method === 'measured-net') {
    const m = r.measured;
    let delta: number | null;
    if (m.mode === 'delta-only') delta = value(m.deltaDb, 'measured.deltaDb', true);
    else {
      const b = value(m.before.levelDbm, 'measured.before', true), a = value(m.after.levelDbm, 'measured.after', true);
      delta = a === null || b === null ? null : a - b;
    }
    if (delta !== null) artifacts.push({ kind: 'measurement-record', metric: m.mode === 'delta-only' ? m.metric : m.before.metric, recordedDeltaDb: delta, variability: 'not-evaluated' });
  } else {
    const b = loss(r.before, 'before'), a = loss(r.after, 'after');
    if (b !== null) artifacts.push({ kind: 'feed-loss', side: 'before', lossDb: b });
    if (a !== null) artifacts.push({ kind: 'feed-loss', side: 'after', lossDb: a });
    if (a !== null && b !== null) {
      const delta = a - b;
      artifacts.push({ kind: 'feed-difference', deltaLossDb: delta });
      if (interpretation === 'comparable' || interpretation === 'conditional') {
        artifacts.push({ kind: 'break-even', placementChangeDb: delta });
        const g = value(r.placementOnlyChangeDb, 'placementOnlyChangeDb');
        if (g !== null && r.placementBasis !== 'unconfirmed') artifacts.push({ kind: 'prediction', predictedNetDb: g - delta });
        else if (r.placementBasis === 'unconfirmed') notice('placementOnlyChangeDb', '配置効果の切り分け・適用条件が未確認のため予測は保留です');
      }
    }
  }
  if (artifacts.some(a => Object.values(a).some(v => typeof v === 'number' && !Number.isFinite(v)))) return { status: 'invalid', artifacts: [], issues: [{ code: 'overflow', fieldPath: '', severity: 'error', message: '計算値が有限範囲を超えました。入力を確認してください' }] };
  used.push(r.context.frequencyMHz);
  const containsAssumptions = checks.some(c => c.state === 'assumed') || used.some(q => q.kind === 'known' && q.evidence.kind === 'assumption');
  if (interpretation === 'comparable' && containsAssumptions) interpretation = 'conditional';
  return { status: 'evaluated', method: r.method, modelVersion: 'comparison-v2', coverage: artifacts.some(a => a.kind === 'prediction' || a.kind === 'measurement-record') ? 'complete' : 'partial', interpretation, artifacts, issues, containsAssumptions, containsExamples: used.some(q => q.kind === 'known' && q.evidence.origin === 'example'), evidenceRefs: [...new Set(used.flatMap(q => q.kind === 'known' ? [q.evidence.sourceLabel || '出典名未記入'] : []))] };
}
