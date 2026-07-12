# Codex 発注 — フェージング統計マージン 第2段（エリアカバレッジ・Jakes近似）

**対象**: 既存 `/tools/shadowing-margin/`。第1段（セルエッジ信頼率）は完成済み・**表示/API/既存e2eは不変**。第2段は**エキスパートモード追加**（OTAエキスパート・バッテリー寿命エキスパートと同じ「トグルで拡張」流儀）。
**ブランチ**: `track/area-coverage`（origin/feature から・専用worktree必須）。
**必読**: `src/lib/rf/shadowingMargin.ts`（第1段。`inverseStandardNormalCdf`を流用）／`ShadowingMarginPanel.tsx`／`ShadowingMarginColumn.tsx`／`DesensePanel.tsx`のnチップ選択UI（`pathLossExponent`命名规约）。

## 背景（roadmap E2の決定事項）
`docs/improvement-roadmap.md` E2行: 「第1段はセルエッジ信頼率のみ。エリアカバレッジのJakes近似は第2段として別Work Order化」。本発注書がその第2段。

## 設計（Claudeが自己導出→数値積分で検証済み。教科書からの転記ではない）

セル半径Rの円内で、中央値パスロス＋対数正規シャドウイングを仮定すると、距離r（t=r/R, 0<t≤1）での受信レベルがしきい値を上回る確率は
```
u(t) = Φ( (M + 10n·log10(1/t)) / σ ) = Φ(a − b·ln t)
  a = M/σ = Φ⁻¹(edgeReliability)   ← 第1段のinverseStandardNormalCdfそのもの
  b = 10n / (σ・ln10)
```
面積被覆率（一様分布仮定・面積重み 2t dt）は
```
F_u = 2∫₀¹ t・Φ(a − b·ln t) dt
```
これを部分積分・ガウス積分の完全平方で閉形式に解くと（導出は本ファイル末尾の検算メモ参照）:
```
F_u = Φ(a) + exp(2a/b + 2/b²)・Q(a + 2/b)      Q(x) = 1 − Φ(x)
```
**この閉形式は Python で `2∫₀¹ t・Φ(a−b·ln t) dt` を台形則で直接数値積分し、複数の(a,b)で誤差<1e-6であることを確認済み**（教科書に出回る式は版によって a,b の定義が微妙に異なり誤記も多いため、本libでは自己導出＋数値検証済みのこの形を正とする）。

### 新規: 標準正規分布の順方向CDF Φ(x)
第1段には逆関数（分位点 `inverseStandardNormalCdf`）しかなく、F_u の計算には順方向Φ(x)が要る。
Abramowitz & Stegun 26.2.17 の有理近似（`p=0.2316419`, `b1..b5 = 0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429`）を採用。**最大絶対誤差 7.5×10⁻⁸ を x∈[-6,6]で実測確認済み**（第1段のAcklam近似と同水準の精度）。

## lib（テスト先行）: `src/lib/rf/areaCoverage.ts`
```ts
export function standardNormalCdf(x: number): number       // Φ(x)。A&S 26.2.17近似
export function upperTailNormal(x: number): number          // Q(x) = 1 - Φ(x)
export function areaCoverageFraction(
  edgeReliability: number,      // 0<r<1（第1段と同じ「セルエッジ信頼率」）
  sigmaDb: number,               // >0
  pathLossExponentN: number      // >0（命名は既存 pathLossExponent 規約に合わせる）
): number                        // 面積被覆率 0<F_u<1
```
`edgeReliability` は内部で `inverseStandardNormalCdf`（shadowingMargin.tsからimport）に通して a を得る。0/1境界・非有限は既存と同じ `RfError(OutOfDomain)` 規約。`sigmaDb`/`pathLossExponentN` は `assertPositiveFinite`。

### 期待値（自己導出→数値積分で検算済み。テストに固定すること）
| edgeReliability | σ[dB] | n | F_u（面積被覆率） |
|---|---|---|---|
| 50% | 8（都市） | 3.5 | **75.45%** |
| 80% | 8（都市） | 3.5 | **92.28%** |
| 90% | 8（都市） | 3.5 | **96.57%** |
| 95% | 8（都市） | 3.5 | **98.43%** |
| 99% | 8（都市） | 3.5 | **99.73%** |
| 75% | 6（郊外） | 3.0 | **90.73%** |
| 95% | 4（開放） | 2.0 | **98.58%** |

Φ(x)自体の単体テスト用参照値: `Φ(0)=0.5`／`Φ(1)=0.841345`（誤差<1e-6）／`Φ(-1)=0.158655`／`Φ(1.6449)=0.95`（第1段の95%チップと同じzスコア→相互整合テストに使える）。
境界エラー: `edgeReliability<=0 or >=1` → RfError。`sigmaDb<=0`／`pathLossExponentN<=0` → assertPositiveFinite。

### 表ビルダー（第1段 `buildReliabilityMarginTable` に合わせた同形API）
```ts
export type AreaCoverageRow = { reliabilityPercent: number; areaCoveragePercent: number };
export function buildAreaCoverageTable(sigmaDb: number, pathLossExponentN: number): AreaCoverageRow[]
```
代表信頼率は第1段と同じ `[50, 80, 90, 95, 99]` を使用（上表の都市σ=8dB系列と一致することを確認テストに）。

## UI（`ShadowingMarginPanel.tsx` へのエキスパートモード追加）
- 既存トグル流儀で「エキスパート: エリアカバレッジ」をON
- 新規入力: 伝搬指数 n（チップ 2 / 3 / 3.5 / 4、既定3。命名・UIは `DesensePanel.tsx` のnチップに揃える）
- 既存の信頼率マージン表（50/80/90/95/99%）に「エリアカバレッジ」列を追加表示（`buildAreaCoverageTable`）
- **可視化（本命）**: 同心円ディスク図。半径方向に10〜20分割した円環を、各環の代表半径 t=r/R での局所信頼率 u(t)=Φ(a−b·ln t) に応じて `diagramPalette` の連続色（既存グラデーション運用に合わせる）で塗る。狙いの体感=「エッジは50%でも、中心近くはほぼ100%塗りつぶされているから面積では75%になる」。中心=100%色・エッジ=境界色でグラデーションが視覚的に一致することを確認（色は生hex禁止・トークン経由）
- 既存の釣鐘曲線（ShadowingBellCurve）はそのまま第1段表示として残す（不変）
- 数値は`tabular-nums`、n変更で表と円図が再計算される（入力連動）

## コラム（`ShadowingMarginColumn.tsx` への追記または新規構造化コラム、D1形式推奨）
題材候補: 「なぜ“端っこ50%”で満足していいのか——Jakesが解いた面積の錯覚」。フックは「セルの端で五分五分の勝負なのに、なぜ会社は"50%エッジ信頼率"で設計するのか？」。本文で「面積は中心近くに集中する（半径×半径則）ので、端が五分五分でも面積の75%は余裕で届く」を物語化。たとえ: 「的の中心に近いほど分厚く着色される標的紙」＋たとえの破れ（実際のセルは円形ではない・干渉限界のセルでは成立しにくい）。深掘りに導出の要点（部分積分・ガウス完全平方）を2〜3行。出典: Jakes, W.C. (ed.), *Microwave Mobile Communications*, Wiley (1974)／Rappaport, T.S., *Wireless Communications: Principles and Practice*, 2nd ed., Prentice Hall（該当章: セル被覆率）／3GPP TR 38.901 §7.4.1（σ_SFプリセットの出典、第1段と共通。href: https://www.3gpp.org/dynareport?code=38-series.htm — Claude Sonnet 5がWebSearchで存在確認済み・2026-07-12取得）。

## e2e（納品に含める）
エキスパートトグルON→n選択→エリアカバレッジ表に上表の都市σ=8dB/n=3.5/edge90%→96.57%系列のいずれかが表示される、の検証1本（tool-calculator配下・既存テスト名と重複回避）。

## 規約
既存API/表示/エクスポート不変（純追加）。tools.ts変更不要（既存ツールの拡張）。数値の発明禁止（上表の期待値をそのままテストに固定）。生hex禁止。1機能=1コミット（lib→UI→コラム→e2e）。全ゲート緑（`Tests N passed`行を明示確認）→push→視覚変更のためrebaselineループ（ランブック: `prompt-wave5-codex-antigravity.md` C-2）→feature→main。
Antigravityへ: 完成後、上表7点の手計算照合（電卓でΦ計算は難しいため、本ドキュメントの表を正解として突き合わせでよい）と、同心円図の「エッジ50%でも面積75%」体感が伝わるかの官能評価を依頼。

---
### 検算メモ（実装者向け参考・省略可）
`F_u/2 = ∫₀^∞ e^{-2x}Φ(a+bx)dx`（t=e^{-x}置換）を積分順序交換し、`s≤a`の寄与`Φ(a)/2`と`s>a`の寄与`(1/2)e^{2a/b}∫_a^∞ φ(s)e^{-2s/b}ds`に分割。後者はガウス指数部を完全平方化（`-s²/2-2s/b = -(s+2/b)²/2 + 2/b²`）して`e^{2/b²}Q(a+2/b)`に帰着する。最終的に`F_u=Φ(a)+exp(2a/b+2/b²)Q(a+2/b)`。Python (`math.erf`ベースのΦ) による台形則数値積分（区間[0,40]・20万分割）との差は全テストケースで1e-8オーダー。
