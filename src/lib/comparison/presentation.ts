import type { ComparisonRequest, Evaluation, FeedLoss, Quantity } from './types';
export const labels: Record<string, string> = { 'device-and-settings': '無線機・送信設定', counterparty: '相手機器', 'other-configuration': 'ケーブル・位置以外の構成', 'measurement-method': '測り方・平均化・時間', environment: '姿勢・筐体・周囲の環境', confirmed: '確認した（利用者の申告）', assumed: '同じと仮定', unknown: 'まだ不明', mismatch: '異なる', comparable: '確認した条件でのモデル上の比較', conditional: '仮定を含む条件付きの比較', 'needs-review': '条件未確認：変更の効果は判断していません', 'not-comparable': '条件が異なる：変更の効果は判断していません', 'out-of-scope': '単純モデルの対象外：適用を保留', assumption: '仮定', datasheet: '資料（利用者入力）', measurement: '測定記録（利用者入力）', example: '説明例', user: '利用者入力' };
export const formatDb = (v: number, signed = true) => {
  const rounded = Math.round(v * 100) / 100;
  if (Math.abs(v) > 1e-9 && rounded === 0) return '表示桁ではほぼ0 dB';
  return `${signed && rounded > 0 ? '＋' : ''}${Object.is(rounded, -0) ? 0 : rounded} dB`;
};
export function describe(q: Quantity): string {
  if (q.kind === 'unknown') return `未確認（${q.reason}）`;
  const a = q.applicability;
  const applies = a.kind === 'at-frequency' ? `${a.frequencyMHz} MHzで適用` : a.kind === 'within-range' ? `${a.minMHz}～${a.maxMHz} MHzの範囲` : a.kind === 'unconfirmed' ? `適用未確認：${a.reason}` : '周波数に依存しない項目';
  return `${q.value} ${q.unit}［${labels[q.evidence.kind]}／${labels[q.evidence.origin] || '外部資料'}／${q.evidence.sourceLabel || '出典名未記入'}／${applies}${q.evidence.conditions ? `／条件：${q.evidence.conditions}` : ''}${q.evidence.sourceRef ? `／資料ID：${q.evidence.sourceRef.id}・版：${q.evidence.sourceRef.revision}（参照申告）` : ''}${q.evidence.derivation === 'linear-interpolation' ? '／補間値' : ''}］`;
}
export function feedSummary(f: FeedLoss): string {
  if (f.mode === 'unknown') return `経路未確認：${f.reason}`;
  if (f.mode === 'assembly-total') return `完成経路 ${f.assemblyLabel || '名称未記入'}：${describe(f.totalLossDb)}／含む部品：${f.includedComponents || '未記入'}／基準点：${f.boundary === 'unknown' ? '未確認' : '無線機側～アンテナ給電点'}`;
  return `長さ ${describe(f.lengthM)}／係数 ${describe(f.lossDbPerM)}／コネクタ合計 ${describe(f.connectorsTotalLossDb)}`;
}
export function viewModel(r: ComparisonRequest, e: Evaluation) {
  const facts: string[] = [];
  let headline = '未確認の条件を整理できます。全体差は未算出です。';
  const limitations = ['通信成功、到達距離、認証適合、量産採用を保証する計算ではありません。'];
  if (e.status === 'invalid') return { headline: '入力未完了・不正：現在の数値結論は保留しています', basisLabel: '入力を修正してください', facts, limitations: [...limitations, ...e.issues.map(i => i.message)], nextAction: '入力エラーを修正する', details: '' };
  const basisLabel = [labels[e.interpretation], e.containsExamples ? '説明用の仮定。実製品値ではありません' : '', e.containsAssumptions ? '仮定を含みます' : ''].filter(Boolean).join('／');
  for (const a of e.artifacts) {
    if (a.kind === 'feed-loss') facts.push(`${a.side === 'before' ? '現在' : '変更後'}の経路損失：${formatDb(a.lossDb, false)}`);
    if (a.kind === 'feed-difference') {
      headline = `ケーブルの損失${Math.abs(a.deltaLossDb) < 1e-9 ? '差は0 dBです' : `が約${formatDb(Math.abs(a.deltaLossDb), false)}${a.deltaLossDb > 0 ? '増えます' : '減ります'}`}。配置の効果・全体差は未算出です。`;
      facts.push(`ケーブル変更による差：${formatDb(-a.deltaLossDb)}`);
    }
    if (a.kind === 'break-even') facts.push(`モデル上、配置だけの変化が約${formatDb(a.placementChangeDb)}と同等なら差し引きは同等、これを上回ればプラスです（判定は丸め前の値で実施）。`);
    if (a.kind === 'prediction') { headline = `仮定・入力条件の範囲で、差し引き ${formatDb(a.predictedNetDb)}${Math.abs(a.predictedNetDb) <= 1e-9 ? '（計算上同等）' : ''}。`; facts.push(`配置効果と経路損失差の試算：${formatDb(a.predictedNetDb)}`); }
    if (a.kind === 'measurement-record') { headline = `入力された${a.metric}の差：${formatDb(a.recordedDeltaDb)}`; facts.push(headline); limitations.push('表示レベルの記録です。原因の内訳は未分離です。ケーブル損失を再び引いていません。', r.method === 'measured-net' && r.captureKind === 'summary-value' ? '利用者が与えた集計値の記録。集計方法・ばらつきはアプリでは評価していません。' : '各構成1回の記録。ばらつき未評価。', 'RSSIには干渉・雑音が含まれる場合があります。指標の機器定義を確認し、通信品質は別に評価してください。'); }
  }
  limitations.push(...e.issues.map(i => {
    let message = i.message;
    for (const [key, label] of Object.entries(labels)) message = message.replace(key, label);
    return message.replaceAll('placementOnlyChangeDb', '配置効果').replaceAll('connectorsTotalLossDb', 'コネクタ損失').replaceAll('lossDbPerM', '損失係数').replaceAll('totalLossDb', '完成経路損失').replaceAll('lengthM', '長さ').replaceAll('before', '現在').replaceAll('after', '変更後').replaceAll('measured.deltaDb', '測定差');
  }));
  const nextAction = r.context.frequencyMHz.kind === 'unknown' ? '周波数・チャネルを確認する'
    : e.interpretation === 'needs-review' || e.interpretation === 'not-comparable' ? '比較条件を確認する'
    : e.interpretation === 'out-of-scope' ? '構成を整理して技術相談する'
    : r.method === 'decomposed' && !e.artifacts.some(a => a.kind === 'feed-difference') ? '品番・ケーブル仕様書を確認する' : '最終構成同士の実機比較を準備する';
  return { headline, basisLabel, facts, limitations, nextAction, details: JSON.stringify(e.artifacts, null, 2) };
}
export function report(r: ComparisonRequest, e: Evaluation, createdAt: string): string {
  const v = viewModel(r, e);
  const configuration = r.method === 'decomposed' ? [`現在：${feedSummary(r.before)}`, `変更後：${feedSummary(r.after)}`, `配置だけの変化：${describe(r.placementOnlyChangeDb)}`]
    : r.measured.mode === 'paired-levels' ? [`現在 ${r.measured.before.metric}：${describe(r.measured.before.levelDbm)}`, `変更後 ${r.measured.after.metric}：${describe(r.measured.after.levelDbm)}`, `測定・構成メモ：${r.measurementNote}`]
    : [`${r.measured.metric}の直接入力差：${describe(r.measured.deltaDb)}`, `測定・構成メモ：${r.measurementNote}`];
  // 入力途中の相談メモに、最後に有効だった数値を混ぜない。
  return [ 'スタッフ株式会社｜ケーブル・位置変更 比較シート', '相談したいこと：ケーブル・アンテナ位置を変える際の条件を整理したい', `comparison-v2／schemaVersion 2／作成日時：${createdAt}`, v.basisLabel, '', v.headline, ...v.facts, '', '未確認・制約：', ...v.limitations, '', `次の確認：${v.nextAction}`, '最終構成のA→B→Aや繰り返し測定を検討。回数・時間は機器と現場に応じて決め、切断・再送なども別途確認。', '', ...(e.status === 'invalid' ? ['入力未完了のため数値・構成値の出力を保留しています。'] : [`使用周波数：${describe(r.context.frequencyMHz)}`, ...configuration]), ...r.context.checks.filter(c => r.method === 'measured-net' || c.key !== 'measurement-method').map(c => `${labels[c.key]}：${labels[c.state]} ${c.note}`), `構成・目的・未確認事項メモ：${r.context.notes}`, '相談対象は当社アンテナの検討です。他社品の測定のみの受託案内ではありません。認証への影響は認証会社へ確認してください。' ].join('\n');
}
