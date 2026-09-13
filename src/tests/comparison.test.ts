import { describe, expect, it } from 'vitest';
import { decomposed, known, linkCoefficient, measured, unknown } from '@/lib/comparison/defaults';
import { evaluate } from '@/lib/comparison/domain';
import { formatDb, report, viewModel } from '@/lib/comparison/presentation';
import { MAX_BYTES, readCase, saveCase } from '@/lib/comparison/persistence';
import { parseNumeric, validateRequest } from '@/lib/comparison/validation';
import type { Artifact, Decomposed, Evaluation } from '@/lib/comparison/types';
const prefs = { lengthUnit: 'm', frequencyUnit: 'MHz', linkedCoefficient: false } as const;
function artifact<K extends Artifact['kind']>(e: Evaluation, kind: K): Extract<Artifact, { kind: K }> | undefined { return e.artifacts.find(a => a.kind === kind) as Extract<Artifact, { kind: K }> | undefined; }
function setup(b = 1, a = 3, g: number | null = null, kb = .6, ka = .6, cb = 0, ca = 0): Decomposed {
  const r = decomposed(true);
  if (r.before.mode === 'per-length') r.before = { ...r.before, lengthM: known('m', b, true), lossDbPerM: known('dB/m', kb, true), connectorsTotalLossDb: known('dB', cb, true) };
  if (r.after.mode === 'per-length') r.after = { ...r.after, lengthM: known('m', a, true), lossDbPerM: known('dB/m', ka, true), connectorsTotalLossDb: known('dB', ca, true) };
  if (g !== null) { r.placementOnlyChangeDb = known('dB', g, true); r.placementBasis = 'hypothesis'; }
  return r;
}
describe('comparison-v2 固定数値 A01–A22', () => {
  it.each([
    ['A01', 1,3,null,.6,.6,0,0,1.2,null], ['A02',1,3,3,.6,.6,0,0,1.2,1.8], ['A03',1,3,1.2,.6,.6,0,0,1.2,0], ['A04',1,3,0,.6,.6,0,0,1.2,-1.2], ['A05',1,1,0,.6,.6,0,0,0,0], ['A06',3,1,null,.6,.6,0,0,-1.2,null], ['A07',3,1,-.5,.6,.6,0,0,-1.2,.7], ['A09',1,3,3,.6,.4,0,0,.6,2.4], ['A10',1,3,3,.6,.6,.1,.3,1.4,1.6]
  ] as const)('%s', (_id,b,a,g,kb,ka,cb,ca,delta,net) => {
    const e = evaluate(setup(b,a,g,kb,ka,cb,ca));
    expect(artifact(e, 'feed-difference')?.deltaLossDb).toBeCloseTo(delta, 12);
    expect(artifact(e, 'break-even')?.placementChangeDb).toBeCloseTo(delta, 12);
    if (net === null) expect(artifact(e, 'prediction')).toBeUndefined(); else expect(artifact(e, 'prediction')?.predictedNetDb).toBeCloseTo(net, 12);
  });
  it('A08 完成経路は二重計上しない', () => {
    const r = setup(1,3,3);
    r.before = { mode:'assembly-total', totalLossDb:known('dB',.6), boundary:'radio-to-antenna-feed',assemblyLabel:'試験用',includedComponents:'コネクタ込み' };
    r.after = { ...r.before,totalLossDb:known('dB',1.8) };
    expect(artifact(evaluate(r),'prediction')?.predictedNetDb).toBeCloseTo(1.8);
  });
  it.each([1.8,-2])('A11/A12 直接の測定差 %s', n => { const r=measured(true); r.measured={mode:'delta-only',metric:'RSSI',deltaDb:known('dB',n,false,'measurement')}; const e=evaluate(r); expect(artifact(e,'measurement-record')?.recordedDeltaDb).toBe(n); expect(artifact(e,'prediction')).toBeUndefined(); });
  it('A13 測定欄へ仮定値は拒否', () => { const r=measured(true); r.measured={mode:'delta-only',metric:'RSSI',deltaDb:known('dB',3)}; expect(evaluate(r).status).toBe('invalid'); });
  it('A14 不明→0→3→不明', () => { expect([null,0,3,null].map(g => artifact(evaluate(setup(1,3,g)),'prediction')?.predictedNetDb)).toEqual([undefined,expect.closeTo(-1.2),expect.closeTo(1.8),undefined]); });
  it.each(['','-','+','.','3abc','NaN','Infinity','1,2','3 m','1e','1e999'])('A15/B31 不正・未完了 %s', raw => expect(parseNumeric(raw).state).not.toBe('valid'));
  it.each(['１．２','−1.2','1.2e-2'])('B31 明示正規化 %s', raw => expect(parseNumeric(raw).state).toBe('valid'));
  it.each([[-1,1,0,.6,.6,0,0],[1,1,0,-.6,.6,0,0],[1,1,0,.6,.6,-.1,0]])('A16 受動経路に負の損失を拒否 %j', (b,a,g,kb,ka,cb,ca) => expect(evaluate(setup(b,a,g,kb,ka,cb,ca)).status).toBe('invalid'));
  it('A17a/A18 周波数不明・変更で旧係数を使わない', () => { const r=setup(1,3,3); for (const frequencyMHz of [unknown('MHz'),known('MHz',900)]) {r.context.frequencyMHz=frequencyMHz; const e=evaluate(r); expect(artifact(e,'prediction')).toBeUndefined(); expect(artifact(e,'break-even')).toBeUndefined(); expect(artifact(e,'feed-difference')).toBeUndefined();} });
  it('A19/A20 部分編集でも例・仮定を残す', () => { const r=setup(1,3,3); if(r.before.mode==='per-length')r.before.lengthM=known('m',2,false,'measurement'); expect(evaluate(r)).toMatchObject({containsExamples:true,containsAssumptions:true,interpretation:'conditional'}); });
  it('A21 小さな値を丸めて判断しない', () => { const e=evaluate(setup(1,1,.004)); expect(artifact(e,'prediction')?.predictedNetDb).toBe(.004); expect(formatDb(.004)).toContain('表示桁ではほぼ0'); expect(formatDb(-0)).toBe('0 dB'); });
  it('A22 有限入力からのオーバーフロー', () => { expect(evaluate(setup(1,1e308,3,.6,1e308)).status).toBe('invalid'); });
});
describe('比較・保存の境界 B01–B36', () => {
  it('B01/B02/B05/B07 同じ指標の記録は未確認でも保持', () => { const r=measured(true); r.context.frequencyMHz=unknown('MHz'); expect(evaluate(r)).toMatchObject({interpretation:'needs-review'}); expect(artifact(evaluate(r),'measurement-record')?.recordedDeltaDb).toBe(3); if(r.measured.mode==='paired-levels') [r.measured.before,r.measured.after]=[r.measured.after,r.measured.before]; expect(artifact(evaluate(r),'measurement-record')?.recordedDeltaDb).toBe(-3); });
  it('B03 RSSIとRSRPは拒否', () => { const r=measured(true); if(r.measured.mode==='paired-levels')r.measured.after.metric='RSRP'; expect(evaluate(r).status).toBe('invalid'); });
  it('B06/B08 条件相違と復帰', () => { const r=measured(true); r.context.checks[0].state='mismatch'; expect(evaluate(r)).toMatchObject({interpretation:'not-comparable'}); expect(artifact(evaluate(r),'measurement-record')?.recordedDeltaDb).toBe(3); r.context.checks.forEach(c=>c.state='confirmed'); r.context.frequencyMHz=known('MHz',2400,false,'measurement'); expect(evaluate(r)).toMatchObject({interpretation:'comparable'}); });
  it('欠落・重複の比較条件', () => { const r=setup(); r.context.checks=[]; expect(validateRequest(r).context.checks).toHaveLength(5); expect(evaluate(r)).toMatchObject({interpretation:'needs-review'}); r.context.checks=[{key:'environment',state:'confirmed',note:''},{key:'environment',state:'confirmed',note:''}]; expect(evaluate(r).status).toBe('invalid'); });
  it('B11 連動はオン時のみ、保存でも維持', () => { const r=setup(1,3,3,.6,.4); const on=linkCoefficient(r,true); expect(artifact(evaluate(on),'prediction')?.predictedNetDb).toBeCloseTo(1.8); expect(artifact(evaluate(linkCoefficient(r,false)),'prediction')?.predictedNetDb).toBeCloseTo(2.4); const s=readCase(JSON.stringify(saveCase(r,{...prefs,linkedCoefficient:true}))); expect(s.saved.uiPreferences.linkedCoefficient).toBe(true); });
  it('B15 未確認係数・コネクタを0で埋めない', () => { const r=setup(); if(r.before.mode==='per-length')r.before.connectorsTotalLossDb=unknown('dB'); expect(artifact(evaluate(r),'feed-difference')).toBeUndefined(); });
  it('B16 対象外は予測・分岐点なし', () => { const r=setup(1,3,3); r.context.scope='out-of-scope'; const e=evaluate(r); expect(e).toMatchObject({interpretation:'out-of-scope'}); expect(artifact(e,'prediction')).toBeUndefined(); expect(artifact(e,'break-even')).toBeUndefined(); });
  it('B17 新規ケースに説明例なし', () => { expect(JSON.stringify(decomposed())).not.toContain('2400'); expect(evaluate(decomposed())).toMatchObject({containsExamples:false}); });
  it('B20/B27 文章に同じ結論・根拠・未確認を出力', () => {const r=setup();r.context.notes='<script>alert(1)</script>';const e=evaluate(r),v=viewModel(r,e),t=report(r,e,'2026-09-12T00:00:00.000Z');expect(t).toContain(v.headline);expect(t).toContain('説明用の仮定');expect(t).toContain('comparison-v2');expect(t).toContain(r.context.notes);});
  it('B21 壊れたJSON・非対応版・過大ファイル', () => { expect(()=>readCase('{')).toThrow(); expect(()=>readCase(JSON.stringify({schemaVersion:1}))).toThrow(); expect(()=>readCase(' '.repeat(MAX_BYTES+1))).toThrow(); });
  it('B21 enum・unit・日時・巨大文字列の検証', () => { const original=saveCase(setup(),prefs); for(const change of [(s:typeof original)=>{s.savedAt='2026-02-30T00:00:00.000Z';},(s:typeof original)=>{s.request.context.notes='x'.repeat(2001);},(s:typeof original)=>{s.uiPreferences.lengthUnit='px' as 'm';}]) { const s=structuredClone(original);change(s);expect(()=>readCase(JSON.stringify(s))).toThrow(); } });
  it('B22 approved-catalog文字列は信用しない', () => { const r=setup(); if(r.before.mode==='per-length'&&r.before.lossDbPerM.kind==='known')r.before.lossDbPerM.evidence.origin='approved-catalog';const valid=validateRequest(r);expect(JSON.stringify(valid)).not.toContain('approved-catalog'); });
  it('B23 旧モデルは明示再計算まで参照', () => { const s=saveCase(setup(),prefs);s.modelVersion='comparison-old';const loaded=readCase(JSON.stringify(s));expect(loaded.legacy).toBe(true); });
  it('結果スナップショットの改ざんを拒否', () => { const s=saveCase(setup(),prefs);s.resultSnapshot.artifacts=[];expect(()=>readCase(JSON.stringify(s))).toThrow('一致'); });
  it('B32/B33 変化に対する不変条件', () => { const net=(r:Decomposed)=>artifact(evaluate(r),'prediction')!.predictedNetDb;expect(net(setup(1,3,4))-net(setup(1,3,3))).toBeCloseTo(1);expect(net(setup(1,3,3,.6,.6,0,1))-net(setup(1,3,3))).toBeCloseTo(-1); });
  it('B34 丸め前の分岐点で判定',()=>{expect(artifact(evaluate(setup(0,1,1.20001,0,1.20002)),'prediction')?.predictedNetDb).toBeLessThan(0);});
  it('分岐点の表示に浮動小数点の内部表現を露出しない',()=>{const v=viewModel(setup(1,4,3,0.4,0.4),evaluate(setup(1,4,3,0.4,0.4)));expect(v.facts.join('\n')).toContain('約＋1.2 dB');expect(v.facts.join('\n')).toContain('丸め前の値で実施');expect(v.facts.join('\n')).not.toContain('1.2000000000000002');});
  it('仮定なしの測定例を下書きの仮定と混同しない',()=>{const r=measured(true);expect(evaluate(r).artifacts.every(a=>a.kind==='measurement-record')).toBe(true);});
  it('無効ケースの相談文に古い値を含めない',()=>{const r=setup(1,3,3);const e:Evaluation={status:'invalid',artifacts:[],issues:[]};const t=report(r,e,'test');expect(t).toContain('入力未完了');expect(t).not.toContain('1.8');expect(t).not.toContain('2400');});
  it('周波数非依存の係数と不正範囲を拒否',()=>{const r=setup();if(r.before.mode==='per-length'&&r.before.lossDbPerM.kind==='known')r.before.lossDbPerM.applicability={kind:'frequency-independent'};expect(evaluate(r).status).toBe('invalid');});
  it('JSONに不要プロパティがあっても設定へマージしない',()=>{const r=JSON.parse(JSON.stringify(setup()));r.__proto__={polluted:true};r.context.extra='ignored';expect(validateRequest(r)).not.toHaveProperty('polluted');expect(validateRequest(r).context).not.toHaveProperty('extra');});
});
