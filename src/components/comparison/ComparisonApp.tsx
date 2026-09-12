'use client';
import Link from 'next/link';
import { useState } from 'react';
import { QuantityInput, type NumericDraft } from './QuantityInput';
import { decomposed, measured, unknown, linkCoefficient } from '@/lib/comparison/defaults';
import { evaluate } from '@/lib/comparison/domain';
import { describe, labels, report, viewModel } from '@/lib/comparison/presentation';
import { MAX_BYTES, readCase, saveCase, STORAGE_KEY, type SavedCase } from '@/lib/comparison/persistence';
import { CONTACT_URL } from '@/lib/rf/presets';
import type { ComparisonRequest, Context, Decomposed, Evaluation, FeedLoss, Measured, Preferences, Quantity, Unit } from '@/lib/comparison/types';
import './comparison.css';

const initialPreferences: Preferences = { lengthUnit: 'm', frequencyUnit: 'MHz', linkedCoefficient: true };
export default function ComparisonApp() {
  const [method, setMethod] = useState<ComparisonRequest['method']>('decomposed');
  const [d, setD] = useState<Decomposed>(() => decomposed());
  const [m, setM] = useState<Measured>(() => measured());
  const [preferences, setPreferences] = useState(initialPreferences);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, NumericDraft>>({});
  const [generation, setGeneration] = useState(0);
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState('');
  const [old, setOld] = useState<SavedCase | null>(null);
  const [oldSnapshot, setOldSnapshot] = useState('');
  const [savedAt, setSavedAt] = useState('');
  const request = linkCoefficient(method === 'decomposed' ? d : m, preferences.linkedCoefficient);
  const fieldErrors = Object.entries(errors).filter(([key, value]) => key.startsWith(method + '.') && value);
  const evaluation: Evaluation = fieldErrors.length ? { status: 'invalid', artifacts: [], issues: fieldErrors.map(([fieldPath, message]) => ({ code: 'draft', severity: 'error', fieldPath, message })) } : evaluate(request);
  const vm = viewModel(request, evaluation);
  const frequency = request.context.frequencyMHz.kind === 'known' ? request.context.frequencyMHz.value : null;
  const factor = preferences.lengthUnit === 'mm' ? 0.001 : preferences.lengthUnit === 'cm' ? 0.01 : 1;
  const update = (r: ComparisonRequest) => { if (r.method === 'decomposed') setD(r); else setM(r); setOutput(''); setSavedAt(''); };
  const context = (c: Context) => update({ ...request, context: c });
  const clearErrors = (prefix: string) => { setErrors(current => Object.fromEntries(Object.entries(current).filter(([k]) => !k.startsWith(`${method}.${prefix}`)))); setDrafts(current => Object.fromEntries(Object.entries(current).filter(([k]) => !k.startsWith(`${method}.${prefix}`)))); };
  const errorFor = (path: string) => (message: string) => { setErrors(current => ({ ...current, [`${method}.${path}`]: message })); setOutput(''); };
  function q<U extends Unit>(path: string, label: string, value: Quantity<U>, onChange: (q: Quantity<U>) => void, options: { nonnegative?: boolean; measured?: boolean; displayUnit?: string; factor?: number } = {}) {
    return <QuantityInput key={`${generation}-${method}-${path}-${options.displayUnit || value.unit}`} label={label} value={value} onChange={onChange} onError={errorFor(path)} draft={drafts[`${method}.${path}`]} onDraft={draft => setDrafts(current => ({ ...current, [`${method}.${path}`]: draft }))} frequency={frequency} {...options} />;
  }
  function feedEditor(side: 'before' | 'after') {
    if (request.method !== 'decomposed') return null;
    const f = request[side];
    const setFeed = (feed: FeedLoss) => update({ ...request, [side]: feed });
    return <fieldset className="route"><legend>{side === 'before' ? '現在' : '変更後'}</legend>
      <div className="schematic" aria-label="無線機側の基準点からアンテナ給電点まで">無線機 <span>── 給電経路 ──</span> アンテナ</div>
      <label>経路損失の入力方法<select value={f.mode} onChange={e => {
        clearErrors(side); setGeneration(g => g + 1);
        setFeed(e.target.value === 'unknown' ? { mode: 'unknown', reason: '経路損失未確認' } : e.target.value === 'assembly-total' ? { mode: 'assembly-total', totalLossDb: unknown('dB'), assemblyLabel: '', includedComponents: '', boundary: 'unknown' } : { mode: 'per-length', lengthM: unknown('m'), lossDbPerM: unknown('dB/m'), connectorsTotalLossDb: unknown('dB') });
      }}><option value="per-length">長さと損失係数で計算</option><option value="assembly-total">ケーブル・コネクタ込みの損失</option><option value="unknown">まだ分からない</option></select></label>
      {f.mode === 'per-length' && <>
        {q(`${side}.length`, `${side === 'before' ? '現在' : '変更後'}の長さ`, f.lengthM, lengthM => setFeed({ ...f, lengthM }), { displayUnit: preferences.lengthUnit, factor, nonnegative: true })}
        {side === 'after' && <label className="check"><input type="checkbox" checked={preferences.linkedCoefficient} onChange={e => { clearErrors('after.coefficient'); setOutput(''); setSavedAt(''); setPreferences(p => ({ ...p, linkedCoefficient: e.target.checked })); if (!e.target.checked) update(request); }} />損失係数は現在と同じ（オンの間は連動）</label>}
        {side === 'after' && preferences.linkedCoefficient && request.before.mode === 'per-length' ? <p>現在の係数と連動：{describe(request.before.lossDbPerM)}</p> : q(`${side}.coefficient`, `${side === 'before' ? '現在' : '変更後'}の損失係数`, f.lossDbPerM, lossDbPerM => setFeed({ ...f, lossDbPerM }), { nonnegative: true })}
        {q(`${side}.connectors`, `${side === 'before' ? '現在' : '変更後'}のコネクタ合計損失`, f.connectorsTotalLossDb, connectorsTotalLossDb => setFeed({ ...f, connectorsTotalLossDb }), { nonnegative: true })}
        <p className="hint">損失0 dBと未確認は別です。含めた変換部品・位置は構成メモに残してください。</p>
      </>}
      {f.mode === 'assembly-total' && <>
        {q(`${side}.total`, `${side === 'before' ? '現在' : '変更後'}の完成経路損失`, f.totalLossDb, totalLossDb => setFeed({ ...f, totalLossDb }), { nonnegative: true })}
        <p>コネクタを含む全体損失です。長さで割ったり、コネクタ損失を再加算したりしません。</p>
        <label>品番・構成名<input maxLength={2000} value={f.assemblyLabel} onChange={e => setFeed({ ...f, assemblyLabel: e.target.value })} /></label>
        <label>含めたケーブル・コネクタ・変換部品<textarea maxLength={2000} value={f.includedComponents} onChange={e => setFeed({ ...f, includedComponents: e.target.value })} /></label>
        <label className="check"><input type="checkbox" checked={f.boundary === 'radio-to-antenna-feed'} onChange={e => setFeed({ ...f, boundary: e.target.checked ? 'radio-to-antenna-feed' : 'unknown' })} />無線機側の基準点からアンテナ給電点までの損失と確認した</label>
      </>}
    </fieldset>;
  }
  function reset(example: boolean) {
    if (!window.confirm(`現在の両方式の編集内容を${example ? '説明例' : '空の自分の条件'}に置き換えます。`)) return;
    setD(decomposed(example)); setM(measured(example)); setErrors({}); setDrafts({}); setGeneration(g => g + 1); setOutput(''); setOld(null); setSavedAt(''); setPreferences(initialPreferences);
  }
  function restore(saved: SavedCase) { setMethod(saved.request.method); update(saved.request); setPreferences(saved.uiPreferences); setErrors({}); setDrafts({}); setGeneration(g => g + 1); setSavedAt(saved.savedAt); setOld(null); }
  function load(raw: string) {
    try {
      const result = readCase(raw);
      if (result.legacy) { setOld(result.saved); setOldSnapshot(result.archivedSnapshot); setMessage(`旧モデル ${result.saved.modelVersion} の入力記録です。数値結論は採用していません。${result.warning}`); return; }
      if (window.confirm('選択中の編集内容を、保存した入力で置き換えます。')) { restore(result.saved); setMessage(`保存時点：${result.saved.savedAt}。現在モデルで再評価しました。${result.warning}`); }
    } catch (e) { setMessage(`読込できません。現在の入力は保持しました。${e instanceof Error ? e.message : ''}`); }
  }
  function store() {
    if (evaluation.status === 'invalid') { setMessage('入力未完了・不正のため保存できません'); return; }
    try { if (window.confirm('この端末・ブラウザーに1件保存し、以前の1件を上書きします。共有端末では機密情報を保存しないでください。')) { localStorage.setItem(STORAGE_KEY, JSON.stringify(saveCase(request, preferences))); setMessage('このブラウザーに1件保存しました'); } } catch { setMessage('ブラウザーに保存できません。JSON書き出し、または相談用まとめの手動コピーをご利用ください'); }
  }
  function exportJson() {
    if (evaluation.status === 'invalid') return;
    try { const blob = new Blob([JSON.stringify(saveCase(request, preferences), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'staf-comparison-v2.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage('JSONを書き出しました。ダウンロード先をご確認ください'); } catch { setMessage('書き出せませんでした。相談用まとめを手動コピーしてください'); }
  }
  function makeOutput() { setOutput(report(request, evaluation, new Date().toISOString())); }
  async function copy() {
    const content = output || report(request, evaluation, new Date().toISOString()); setOutput(content);
    try { await navigator.clipboard.writeText(content); setMessage('相談用まとめをコピーしました'); } catch { setMessage('自動コピーが利用できません。下の文章を選択して手動コピーしてください'); }
  }
  return <main className="comparison-app">
    <header className="no-print"><Link href="/">スタッフ株式会社｜計算ツール一覧</Link><span>社内・営業伴走β</span></header>
    <div className="no-print">
      <p className="eyebrow">条件整理とケーブル比較</p>
      <h1>ケーブルを延ばすと、<br />アンテナを移した効果はどう変わる？</h1>
      <p className="lead">ケーブルで失う分と、移動して変わる分を整理します。分からない条件を残したまま、次の評価へ進めます。</p>
      <nav className="method" aria-label="測定状況"><button aria-pressed={method === 'decomposed'} onClick={() => { setMethod('decomposed'); setOutput(''); }}>まだ測っていない</button><button aria-pressed={method === 'measured-net'} onClick={() => { setMethod('measured-net'); setOutput(''); }}>変更前後を測った</button></nav>
      <div className="actions"><button onClick={() => reset(true)}>説明例を試す（編集を置換）</button><button onClick={() => reset(false)}>自分の条件で始める（編集を置換）</button></div>
      {evaluation.status === 'evaluated' && evaluation.containsExamples && <p className="example">説明用の仮定。実製品値ではありません。測定画面の数値も架空の説明例です。</p>}
      <section className="context"><h2>使用する条件</h2>
        <div className="units"><label>周波数の単位<select disabled={fieldErrors.length > 0} value={preferences.frequencyUnit} onChange={e => setPreferences(p => ({ ...p, frequencyUnit: e.target.value as Preferences['frequencyUnit'] }))}><option>MHz</option><option>GHz</option></select></label>{method === 'decomposed' && <label>長さの単位<select disabled={fieldErrors.length > 0} value={preferences.lengthUnit} onChange={e => setPreferences(p => ({ ...p, lengthUnit: e.target.value as Preferences['lengthUnit'] }))}><option>m</option><option>cm</option><option>mm</option></select></label>}</div>
        {q('frequency', '使用周波数', request.context.frequencyMHz, frequencyMHz => context({ ...request.context, frequencyMHz }), { displayUnit: preferences.frequencyUnit, factor: preferences.frequencyUnit === 'GHz' ? 1000 : 1 })}
        <label>対象の構成<select value={request.context.scope} onChange={e => context({ ...request.context, scope: e.target.value as Context['scope'] })}><option value="unknown">まだ確認していない</option><option value="passive-single-feed">一つの受動給電経路（アンプ等を含まない）</option><option value="out-of-scope">LNA・アンプ・分配器・MIMO全体・両側の同時変更等</option></select></label>
        <p className="hint">品番からの自動入力は、公開承認データの確認後に提供します。このβ版は手入力・未確認・説明例で条件を整理します。</p>
      </section>
      {request.method === 'decomposed' ? <>
        <div className="routes">{feedEditor('before')}{feedEditor('after')}</div>
        <details className="placement"><summary>配置の効果も仮定してみる</summary><p>ケーブル変更の影響を含まない値だけを入力します。最終構成同士の測定差は「変更前後を測った」で記録してください。</p>
          {q('placement', '配置だけの変化', request.placementOnlyChangeDb, placementOnlyChangeDb => update({ ...request, placementOnlyChangeDb, placementBasis: placementOnlyChangeDb.kind === 'unknown' ? 'not-known' : placementOnlyChangeDb.evidence.kind === 'measurement' ? 'isolated-measurement' : placementOnlyChangeDb.evidence.kind === 'datasheet' ? 'applicable-reference' : 'hypothesis' }))}
        </details>
      </> : <section className="measurement"><h2>同じ指標の表示値を記録</h2>
        <label>入力方法<select value={request.measured.mode} onChange={e => { clearErrors('reading'); setGeneration(g => g + 1); update({ ...request, measured: e.target.value === 'delta-only' ? { mode: 'delta-only', metric: 'RSSI', deltaDb: unknown('dB') } : { mode: 'paired-levels', before: { metric: 'RSSI', levelDbm: unknown('dBm') }, after: { metric: 'RSSI', levelDbm: unknown('dBm') } } }); }}><option value="paired-levels">変更前と変更後のdBm</option><option value="delta-only">測定差を直接入れる（切替時に測定欄をクリア）</option></select></label>
        {request.measured.mode === 'paired-levels' ? <div className="routes">{(['before', 'after'] as const).map(side => {
          const mi = request.measured;
          if (mi.mode !== 'paired-levels') return null;
          return <fieldset key={side}><legend>{side === 'before' ? '現在' : '変更後'}</legend><label>測定指標<select value={mi[side].metric} onChange={e => update({ ...request, measured: { ...mi, [side]: { ...mi[side], metric: e.target.value } } })}><option>RSSI</option><option>RSRP</option></select></label>{q(`reading.${side}`, `${side === 'before' ? '現在' : '変更後'}の表示`, mi[side].levelDbm, levelDbm => update({ ...request, measured: { ...mi, [side]: { ...mi[side], levelDbm } } }), { measured: true })}</fieldset>;
        })}</div> : <><label>測定指標<select value={request.measured.metric} onChange={e => request.measured.mode === 'delta-only' && update({ ...request, measured: { ...request.measured, metric: e.target.value as 'RSSI' | 'RSRP' } })}><option>RSSI</option><option>RSRP</option></select></label>{q('reading.delta', '最終構成の測定差', request.measured.deltaDb, deltaDb => request.measured.mode === 'delta-only' && update({ ...request, measured: { ...request.measured, deltaDb } }), { measured: true })}</>}
        <p>＋は変更後の表示レベルが高い、−は低いことを示します。RSSI／RSRP以外のバー表示・速度等は入力しないでください。</p>
        <label>記録の種類<select value={request.captureKind} onChange={e => update({ ...request, captureKind: e.target.value as Measured['captureKind'] })}><option value="single-pair">各構成1回の記録</option><option value="summary-value">利用者が集計した値（方法をメモ）</option></select></label>
        <label>変更前後のケーブル・位置・測定方法のメモ<textarea value={request.measurementNote} maxLength={2000} onChange={e => update({ ...request, measurementNote: e.target.value })} /></label>
      </section>}
      <section id="comparison-conditions"><h2>その他の条件はそろっていますか？</h2><p>利用者による確認・仮定の申告です。アプリが実験を認証するものではありません。</p>
        <div className="checks">{request.context.checks.filter(c => method === 'measured-net' || c.key !== 'measurement-method').map(c => <label key={c.key}>{labels[c.key]}<select value={c.state} onChange={e => context({ ...request.context, checks: request.context.checks.map(check => check.key === c.key ? { ...check, state: e.target.value as typeof c.state } : check) })}>{(['unknown', 'confirmed', 'assumed', 'mismatch'] as const).map(state => <option key={state} value={state}>{labels[state]}</option>)}</select></label>)}</div>
        <label>目的・品番・位置・構成と未確認事項（任意）<textarea maxLength={2000} value={request.context.notes} onChange={e => context({ ...request.context, notes: e.target.value })} /></label>
      </section>
      <section className="result" aria-labelledby="result-title"><p className="eyebrow">今回分かること</p>
        {request.method === 'decomposed' && evaluation.status !== 'invalid' && <p>現在 {request.before.mode === 'per-length' && request.before.lengthM.kind === 'known' ? `${request.before.lengthM.value} m` : '経路を確認'} → 変更後 {request.after.mode === 'per-length' && request.after.lengthM.kind === 'known' ? `${request.after.lengthM.value} m` : '経路を確認'}</p>}
        <h2 id="result-title">{vm.headline}</h2><p className="basis">{vm.basisLabel}</p><ul>{vm.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
        <h3>分からないこと・制約</h3><ul>{vm.limitations.map((l, i) => <li key={i}>{l}</li>)}</ul>
        <a className="primary" href="#next-check">{vm.nextAction}</a>
        <details><summary>条件・根拠・数式を詳しく見る</summary><p>受動経路の近似モデル：経路損失＝長さ×係数＋コネクタ合計。完成経路は全体損失のみ。差し引き＝配置だけの変化−（変更後損失−現在損失）。測定値は変更後dBm−現在dBm。</p><p>整合、外導体、基板・筐体の相互作用を推定しません。単点の比較は帯域全体を保証しません。丸め前で計算し、ゼロの演算許容誤差1e−9 dBは測定誤差とは別です。</p><pre>{vm.details}</pre><p>モデル：comparison-v2／公開製品データ：0件</p></details>
      </section>
      <section id="next-check"><h2>次の確認：{vm.nextAction}</h2><p>周波数・チャネル、相手機器、送信設定、ケーブル・位置、端末の姿勢、筐体、周囲の人や金属、読み方・時間条件をそろえます。可能ならA→B→Aや繰り返し測定を行い、切断・再送等も別途確認してください。</p><p>回数や時間は機器・現場条件に応じて決めます。配置だけの切り分け値を完成構成へ使う場合は、適用条件の確認が必要です。</p></section>
      <section className="output"><h2>保存・説明</h2><p>比較入力・メモをアプリから送信しません。保存はこの端末・ブラウザーに残ります。共有端末では機密情報を保存しないでください。</p>
        <div className="actions"><button className="primary" onClick={makeOutput}>相談用まとめを作る</button><button onClick={store}>このブラウザーに1件保存</button><button onClick={() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) load(raw); else setMessage('保存データがありません'); } catch { setMessage('ブラウザー保存を読み込めません。JSONをお使いください'); } }}>保存した1件を復元</button><button onClick={() => { try { if (window.confirm('このアプリの保存済み1件を削除します。')) { localStorage.removeItem(STORAGE_KEY); setMessage('保存済み1件を削除しました'); } } catch { setMessage('保存データを削除できませんでした'); } }}>保存した1件を削除</button><button disabled={evaluation.status === 'invalid'} onClick={exportJson}>別ファイルへJSON書き出し</button></div>
        <label>JSON読込（1MBまで・確認後に編集を置換）<input type="file" accept=".json,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > MAX_BYTES) setMessage('JSONは1MB以下にしてください。現在入力は保持しました'); else { try { load(await file.text()); } catch { setMessage('ファイルを読み込めません。現在入力は保持しました'); } } e.target.value = ''; }} /></label>
        <p role="status">{message}</p>{savedAt && <p>復元元の保存日時：{savedAt}／画面は現在の入力から再評価</p>}
        {old && <aside><p>旧モデル {old.modelVersion}／保存日時 {old.savedAt}。旧記録は今回の数値結論に採用していません。</p><details><summary>旧記録の入力・保存時点の結果（未検証）</summary><pre>{JSON.stringify(old.request, null, 2)}</pre><pre>{oldSnapshot}</pre></details><button onClick={() => { if (window.confirm('旧記録の入力から現在モデルで別の比較を作ります。編集内容を置き換えます。')) { restore(old); setMessage('旧記録から現在モデルで再計算しました。元ファイルは変更していません'); } }}>入力から現在モデルで再計算</button></aside>}
      </section>
    </div>
    {output && <section className="report-preview"><div className="no-print"><h2>相談用まとめの内容確認</h2><p>内容を確認してコピーし、必要に応じて既存窓口へ貼り付けてください。自動送信・自動入力は行いません。</p><div className="actions"><button onClick={copy}>内容をコピー</button><button onClick={() => window.print()}>比較シートを印刷</button><a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">既存問い合わせ窓口を開く</a><a href="https://www.staf.co.jp/faq.html" target="_blank" rel="noopener noreferrer">サービス・認証の確認先（FAQ）</a></div></div><div className="print-mark">スタッフ株式会社｜comparison-v2｜{vm.basisLabel}</div><pre className="report-text" tabIndex={0}>{output}</pre></section>}
  </main>;
}
