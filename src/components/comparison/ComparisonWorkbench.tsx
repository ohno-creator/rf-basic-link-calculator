'use client';

import type { Artifact, ComparisonRequest, Evaluation, Preferences } from '@/lib/comparison/types';
import { feedSummary, formatDb, labels, report, viewModel } from '@/lib/comparison/presentation';

export type ComparisonSnapshot = { request: ComparisonRequest; evaluation: Evaluation; preferences: Preferences };
type Props = { current: ComparisonSnapshot; baseline: ComparisonSnapshot | null; onPin: () => void; onClear: () => void; onMessage: (message: string) => void };

const artifact = <K extends Artifact['kind']>(evaluation: Evaluation, kind: K, side?: 'before' | 'after') => evaluation.artifacts.find(item => item.kind === kind && (!side || ('side' in item && item.side === side))) as Extract<Artifact, { kind: K }> | undefined;
const finite = (value: number | undefined) => typeof value === 'number' && Number.isFinite(value) ? value : null;

function routeText(request: ComparisonRequest, side: 'before' | 'after') {
  if (request.method === 'measured-net') return side === 'before' ? '現在の完成構成' : '変更後の完成構成';
  const feed = request[side];
  if (feed.mode === 'unknown') return '経路未確認';
  if (feed.mode === 'assembly-total') return feed.assemblyLabel || '完成経路';
  return feed.lengthM.kind === 'known' ? `${feed.lengthM.value} m の給電経路` : '長さ未確認の給電経路';
}

function evidenceKinds(request: ComparisonRequest) {
  const kinds = new Set<string>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    if ('kind' in value && (value.kind === 'assumption' || value.kind === 'datasheet' || value.kind === 'measurement')) kinds.add(labels[value.kind]);
    Object.values(value).forEach(visit);
  };
  visit(request);
  return [...kinds];
}

function unresolved(snapshot: ComparisonSnapshot) {
  if (snapshot.evaluation.status === 'invalid') return ['入力未完了・不正'];
  const items = snapshot.evaluation.issues.map(issue => issue.message);
  if (snapshot.evaluation.containsAssumptions) items.push('仮定を含む');
  if (snapshot.evaluation.coverage === 'partial') items.push('一部の数値は未算出');
  return items.length ? items : ['なし'];
}

function compatibility(a: ComparisonSnapshot, b: ComparisonSnapshot) {
  const reasons: string[] = [];
  if (a.request.method !== b.request.method) reasons.push('比較方式が異なります');
  if (a.request.method === 'measured-net' && b.request.method === 'measured-net') {
    const am = a.request.measured.mode === 'paired-levels' ? a.request.measured.before.metric : a.request.measured.metric;
    const bm = b.request.measured.mode === 'paired-levels' ? b.request.measured.before.metric : b.request.measured.metric;
    if (am !== bm) reasons.push('測定指標が異なります');
  }
  const af = a.request.context.frequencyMHz, bf = b.request.context.frequencyMHz;
  if (af.kind !== 'known' || bf.kind !== 'known') reasons.push('周波数が未確認です');
  else if (af.value !== bf.value) reasons.push('周波数が異なります');
  if (a.request.context.scope !== b.request.context.scope) reasons.push('対象構成が異なります');
  if (a.request.context.checks.map(check => `${check.key}:${check.state}`).join('|') !== b.request.context.checks.map(check => `${check.key}:${check.state}`).join('|')) reasons.push('比較条件の確認状態が異なります');
  if (a.evaluation.status === 'invalid' || b.evaluation.status === 'invalid') reasons.push('入力未完了・不正の案があります');
  else if (!['comparable', 'conditional'].includes(a.evaluation.interpretation) || !['comparable', 'conditional'].includes(b.evaluation.interpretation)) reasons.push('モデルが横断比較を許可していません');
  return [...new Set(reasons)];
}

function RouteDiagram({ snapshot, title, scale }: { snapshot: ComparisonSnapshot; title: string; scale: number }) {
  const before = finite(artifact(snapshot.evaluation, 'feed-loss', 'before')?.lossDb);
  const after = finite(artifact(snapshot.evaluation, 'feed-loss', 'after')?.lossDb);
  const measurement = artifact(snapshot.evaluation, 'measurement-record');
  return <article className="workbench-plan"><h3>{title}</h3><p className="workbench-basis">{viewModel(snapshot.request, snapshot.evaluation).basisLabel}</p><p className="hint">{snapshot.evaluation.status === 'invalid' ? '周波数：入力修正待ち' : snapshot.request.context.frequencyMHz.kind === 'known' ? `${snapshot.request.context.frequencyMHz.value} MHz` : '周波数：未確認'}</p><div className="route-pair">
    {(['before', 'after'] as const).map(side => <div className="route-line" key={side} aria-label={`${side === 'before' ? '現在' : '変更後'}：無線機、ケーブル、コネクタ、アンテナ`}><strong>{side === 'before' ? '現在' : '変更後'}</strong><span>無線機</span><i aria-hidden="true" /><span>ケーブル</span><i aria-hidden="true" /><span>コネクタ</span><i aria-hidden="true" /><span>アンテナ</span><small>{snapshot.evaluation.status === 'invalid' ? '入力を修正すると経路条件を表示します' : routeText(snapshot.request, side)}</small></div>)}
  </div>{snapshot.evaluation.status === 'invalid' ? <p className="workbench-pending">未算出：入力エラーを修正してください。数値とバーは表示していません。</p> : measurement ? <div className="measurement-reading" aria-label={`実測差 ${formatDb(measurement.recordedDeltaDb)}`}><span>{measurement.metric}：変更前後の実測差</span><strong>{formatDb(measurement.recordedDeltaDb)}</strong>{snapshot.request.method === 'measured-net' && snapshot.request.measured.mode === 'paired-levels' && <small>現在 {snapshot.request.measured.before.levelDbm.kind === 'known' ? `${snapshot.request.measured.before.levelDbm.value} dBm` : '未確認'} → 変更後 {snapshot.request.measured.after.levelDbm.kind === 'known' ? `${snapshot.request.measured.after.levelDbm.value} dBm` : '未確認'}</small>}<small>完成構成の差。ケーブル寄与は分離せず、再控除していません。{snapshot.request.method === 'measured-net' && snapshot.request.captureKind === 'single-pair' ? '各構成1回の記録で、ばらつき未評価です。' : '集計方法・ばらつきはアプリでは評価していません。'}</small></div> : <div className="loss-bars" aria-label="現在と変更後の経路損失">
    {([['現在', before], ['変更後', after]] as const).map(([label, value]) => <div className="loss-row" key={label}><span>{label}</span>{value === null ? <strong>未算出</strong> : <><span className="bar-track" aria-hidden="true"><span style={{ width: `${value / scale * 100}%` }} /></span><strong>{formatDb(value, false)}</strong></>}</div>)}
  </div>}</article>;
}

function Summary({ snapshot }: { snapshot: ComparisonSnapshot }) {
  if (snapshot.evaluation.status === 'invalid') return <p className="workbench-pending">入力未完了・不正のため、今回の数値は未算出です。</p>;
  const difference = artifact(snapshot.evaluation, 'feed-difference'), breakEven = artifact(snapshot.evaluation, 'break-even'), prediction = artifact(snapshot.evaluation, 'prediction'), measurement = artifact(snapshot.evaluation, 'measurement-record');
  return <dl className="workbench-summary"><div><dt>{measurement ? '実測差' : '追加の経路損失（＋は損失増）'}</dt><dd>{measurement ? formatDb(measurement.recordedDeltaDb) : difference ? formatDb(difference.deltaLossDb) : '未算出'}</dd></div><div><dt>配置による損益分岐</dt><dd>{breakEven ? formatDb(breakEven.placementChangeDb) : '未算出'}</dd></div><div><dt>{measurement ? '読み方' : '予測'}</dt><dd>{measurement ? '完成構成の実測値。原因の内訳は未分離' : prediction ? formatDb(prediction.predictedNetDb) : '未算出'}</dd></div></dl>;
}

const xml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
function svgLines(snapshot: ComparisonSnapshot, name: string) {
  if (snapshot.evaluation.status === 'invalid') return [name, '無線機 → ケーブル → コネクタ → アンテナ', ...report(snapshot.request, snapshot.evaluation, '書き出し時点').split('\n')];
  const evaluation = snapshot.evaluation;
  const values = evaluation.artifacts.map(item => item.kind === 'feed-loss' ? `${item.side === 'before' ? '現在' : '変更後'}損失：${formatDb(item.lossDb, false)}` : item.kind === 'feed-difference' ? `損失差：${formatDb(item.deltaLossDb)}` : item.kind === 'break-even' ? `配置の損益分岐：${formatDb(item.placementChangeDb)}` : item.kind === 'prediction' ? `予測差：${formatDb(item.predictedNetDb)}` : `実測差：${formatDb(item.recordedDeltaDb)}（ケーブル寄与は未分離）`);
  const configuration = snapshot.request.method === 'decomposed' ? [feedSummary(snapshot.request.before), feedSummary(snapshot.request.after)] : snapshot.request.measured.mode === 'paired-levels' ? [`現在：${snapshot.request.measured.before.levelDbm.kind === 'known' ? `${snapshot.request.measured.before.levelDbm.value} dBm` : '未確認'}`, `変更後：${snapshot.request.measured.after.levelDbm.kind === 'known' ? `${snapshot.request.measured.after.levelDbm.value} dBm` : '未確認'}`, snapshot.request.measurementNote || '測定・構成メモ未記入'] : [snapshot.request.measurementNote || '測定・構成メモ未記入'];
  return [name, '無線機 → ケーブル → コネクタ → アンテナ', `周波数：${snapshot.request.context.frequencyMHz.kind === 'known' ? `${snapshot.request.context.frequencyMHz.value} MHz` : '未確認'}`, ...configuration, ...values, `モデル：${evaluation.modelVersion}`, `根拠種別：${evidenceKinds(snapshot.request).join('、') || '未確認'}`, `判定：${labels[evaluation.interpretation]}`, `未確認・仮定：${unresolved(snapshot).join('／')}`, ...report(snapshot.request, snapshot.evaluation, '書き出し時点').split('\n')];
}

export default function ComparisonWorkbench({ current, baseline, onPin, onClear, onMessage }: Props) {
  const reasons = baseline ? compatibility(baseline, current) : [];
  const allLosses = [current, baseline].flatMap(snapshot => snapshot ? [finite(artifact(snapshot.evaluation, 'feed-loss', 'before')?.lossDb), finite(artifact(snapshot.evaluation, 'feed-loss', 'after')?.lossDb)] : []).filter((value): value is number => value !== null);
  const scale = Math.max(...allLosses, 0.01);
  function downloadSvg() {
    try {
      const comparisonLines = baseline && reasons.length ? ['基準との比較：保留', ...reasons] : baseline ? ['基準との比較：条件一致'] : [];
      const lines = [...comparisonLines, ...svgLines(current, '編集中の案'), ...(baseline ? ['', ...svgLines(baseline, '固定した基準案')] : [])].flatMap(line => line.match(/.{1,64}/gu) || ['']);
      const height = 250 + lines.length * 28;
      const text = lines.map((line, index) => `<text x="40" y="${222 + index * 28}" font-family="sans-serif" font-size="16" fill="#183433">${xml(line)}</text>`).join('');
      const description = xml(lines.join('。'));
      const barSnapshots = [current, baseline].filter((item): item is ComparisonSnapshot => item !== null);
      const planLabels = barSnapshots.map((_, index) => `<text x="${40 + index * 560}" y="112" font-family="sans-serif" font-size="14" fill="#183433">${index === 0 ? '編集中の案' : '固定した基準案'}</text>`).join('');
      const bars = barSnapshots.flatMap((item, plan) => (['before', 'after'] as const).map((side, row) => { const value = finite(artifact(item.evaluation, 'feed-loss', side)?.lossDb); if (item.evaluation.status === 'invalid' || value === null) return ''; const x = 40 + plan * 560, y = 140 + row * 34, width = value / scale * 430; return `<text x="${x}" y="${y}" font-family="sans-serif" font-size="13" fill="#183433">${side === 'before' ? '現在' : '変更後'} ${xml(formatDb(value, false))}</text><rect x="${x + 95}" y="${y - 13}" width="${width}" height="14" rx="7" fill="#327765"/>`; })).join('');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title description"><title id="title">ケーブル・位置変更の比較図</title><desc id="description">${description}</desc><rect width="1200" height="${height}" fill="#f7faf8"/><g aria-hidden="true" stroke="#327765" stroke-width="3"><line x1="90" y1="48" x2="510" y2="48"/><circle cx="90" cy="48" r="18" fill="#fff"/><rect x="218" y="30" width="94" height="36" rx="8" fill="#e7f0ec"/><rect x="378" y="30" width="82" height="36" rx="8" fill="#e7f0ec"/><path d="M510 26 L538 48 L510 70 Z" fill="#e7f0ec"/></g><text x="40" y="94" font-family="sans-serif" font-size="22" font-weight="700" fill="#174f43">ケーブル・位置変更の比較図</text>${planLabels}${bars}${text}</svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'staf-cable-position-comparison.svg'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); onMessage('比較図SVGを書き出しました。ダウンロード先をご確認ください');
    } catch { onMessage('比較図SVGを書き出せませんでした。画面の代替値をご確認ください'); }
  }
  return <section id="comparison-workbench" tabIndex={-1} className="comparison-workbench" aria-labelledby="workbench-title"><div className="workbench-heading"><div><p className="eyebrow">ライブ比較</p><h2 id="workbench-title">経路と差を先に確認</h2></div><div className="actions"><button className="primary" onClick={onPin}>この条件を基準に固定</button>{baseline && <button onClick={onClear}>固定した基準を破棄</button>}<button onClick={downloadSvg}>比較図をSVGで保存</button></div></div><p className="hint">固定案はこのタブ内だけに保持します。「このブラウザーに1件保存」とは別で、再固定できます。</p><div className={`workbench-grid${baseline ? ' has-baseline' : ''}`}><div><RouteDiagram snapshot={current} title="編集中の案" scale={scale} /><Summary snapshot={current} /></div>{baseline && <div><RouteDiagram snapshot={baseline} title="固定した基準案" scale={scale} /><Summary snapshot={baseline} /></div>}</div>{baseline && <div className={reasons.length ? 'cross-compare held' : 'cross-compare'}><h3>基準との比較</h3>{reasons.length ? <><strong>比較を保留</strong><ul>{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></> : <p>方式・周波数・構成・比較条件が一致しています。各案の評価値を並べて確認できます。</p>}</div>}<details><summary>図のHTML代替値</summary><pre>{svgLines(current, '編集中の案').join('\n')}{baseline ? `\n\n${svgLines(baseline, '固定した基準案').join('\n')}` : ''}</pre></details><div className="actions"><a href="#comparison-input">下の入力を編集する</a><a href="#comparison-result">詳しい結果と次の確認へ</a></div></section>;
}
