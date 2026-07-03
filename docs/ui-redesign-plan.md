# UI/UX 大規模改善計画（フェーズUX）— 実装仕様書

**目的**: 全24ツールのUIを「パッと見て理解できる・コンパクト・商用レベルの使いやすさ」へ大規模改修する。
**ステータス**: 計画（コード未変更）。本書は Claude / Codex 等の実装エージェントがそのまま着手できる解像度で書く。
**前提**: 計算ロジック（`src/lib/rf/*`）には一切触れない。表示層のみの改修。各ステップで `npm run test` / `npm run lint` / `npm run build` / `npm run test:e2e` を green に保つ。

---

## 0. 診断サマリ（5班監査の結論・確度：確定）

計測基準: 1440×900 ビューポート、コンテンツ幅 max-w-5xl。行番号は 2026-07-03 時点の `feature/initial-rf-basic-link-calculator`。

| # | 問題 | 根拠（代表箇所） |
|---|---|---|
| D1 | **計算UIがファーストビューに入らない**。基本ツールは y≈520px から開始し主結果はフォールド境界（FSPLで y≈790px）。旗艦は計算UIまで約2.2画面（y≈1,900px）、NCUは約2画面 | `BasicToolPageShell.tsx:75-118`、`RfBasicLinkCalculatorClient.tsx:130-156`、`HeroSection.tsx:16-78` |
| D2 | **同一内容の3〜5重説明**。ツール説明が「シェルh1+説明 → はじめての見方3カード → パネルh2+lead → チュートリアル → 用語ピル」で重複。h1とh2が同一文字列のツールもある | `tools.ts:123` vs `FsplPanel.tsx:60-63`、`AntennaToolPanel.tsx:1787`、`VswrConverterPanel.tsx:256-285` |
| D3 | **入力ヘルプの二重表示**が全フォーム高を約1.5倍に膨張。NumberField が同一help文をツールチップ＋常時表示の両方に出す | `NumberField.tsx:145-149`、NCU/リンクバジェットの同型3箇所 |
| D4 | **入力と結果の間に静的コンテンツが割込む**。アンテナ系10ツールでは ResearchBridgeSection（約320px）が入力→結果の中核ループを分断 | `AntennaToolPanel.tsx:1854` |
| D5 | **結果表示が5系統に分裂**（Stat / NCU版MetricCard / 研究距離版MetricCard / MicrostripのResultCard / Antennaのcard()）。強調ロジックも逆転箇所あり | `NcuResultPanel.tsx:15`、`ResearchDistanceSheet.tsx:205`、`MicrostripLinePanel.tsx:134`、`AntennaToolPanel.tsx:854`、`VswrConverterPanel.tsx:135-183` |
| D6 | **数値入力が5変種に分裂**（NumberField / LinkBudgetNumberField / ResearchNumberField / OptionalNumberField / 生input）。枠色・角丸・高さ・空欄挙動が不一致 | `LinkBudgetPanel.tsx:103,139`、`NcuFieldAnalysisPanel.tsx:37`、`FsplPanel.tsx:73-104` |
| D7 | **ヘルプUIが2系統**（用語ピル型Tooltip×110箇所＝高さ約22pxでタップ不可、丸型HelpHint＝40px確保）。開閉ロジックもコピペ重複 | `Tooltip.tsx:46`、`HelpHint.tsx:43` |
| D8 | **デザイントークンの死蔵と漂流**。`typeScale.ts`・`SectionHeading.tsx` は使用0件。`#0071BD` 直書き54箇所。rounded-md 154 vs rounded-lg 176。focus ring 透明度5種。AA不足の `text-staf` が hover に19箇所 | `src/styles/typeScale.ts`、`chartTheme.ts`、各所 |
| D9 | **NCU固有**: 結果要約が4箇所重複（ResultPanel/滝/断面図/チップ）。purpose切替が排他UIなのに実際は追加表示。2択にselect。ChoiceChips 34px・凡例なし | `NcuBelowGroundClient.tsx:612-634`、`NcuResultPanel.tsx:200-221` ほか |
| D10 | **ナミゲート固有**: 「固定仕様」ボックスに入力連動の導出値が混在。CSVボタンが約900px離れたmode状態に依存。免責文の二重掲載 | `NamiGateClient.tsx:193-207,269-276,345-350`、`tools.ts:200` |
| D11 | **旗艦固有**: 相談CTAが6箇所、ステップ体系が3系統併存、入力1個あたり約240px×17個で入力列だけで約4,000px | `LinkBudgetPanel.tsx:121-163`、`BeginnerRoadmap.tsx` ほか |
| D12 | プリセットに選択状態がない（押しても何が効いているか不明） | `AntennaToolPanel.tsx:1795-1806`、`QuickStartPresets.tsx` |

**良い点（壊さないこと）**: ResultHero/ResultPanel の sticky、StickyResultSummary（モバイル）、滝グラフ→入力ジャンプ、NumberInput のドラフト方式、意味トークン（success/info/…）、chartTheme のAA配慮、HelpHint のヒット領域拡張、豊富なaria・skip link・reduced-motion 対応、ヒートマップのキーボード操作。

---

## 1. 採用する設計セオリー（世界標準 → 本プロジェクトへの翻訳）

| セオリー | 出典・代表例 | 本プロジェクトでの適用ルール |
|---|---|---|
| **Answer-first** | Wolfram Alpha、Omni Calculator | 主結果は入力と同一ビューポートに常時表示。教育文より結果が先 |
| **2ペイン・プロパティパネル** | Figma/CAD、ADI ADIsimRF、TI/Qorvo計算機 | lg以上は「入力（左）/ 結果+図（右sticky）」。入力変更→結果変化を視線移動ゼロで確認 |
| **Progressive disclosure** | Nielsen #8（美的で最小限の設計）、Apple HIG | 教育・チュートリアル・式・コラムはデフォルト折り畳み。本文の常時表示テキストは1ブロック≦2行 |
| **Recognition over recall** | Nielsen #6 | プリセットは選択状態付きチップ。選択肢は開かないと見えないselectより、見えているチップ/セグメント |
| **一貫した画面文法** | Jakob's Law | 24ツール全てで「ヘッダー→入力→結果→図→深掘り」の同一順序・同一部品 |
| **Fitts's Law / タッチ標準** | Apple HIG 44pt、Material 48dp | 全インタラクティブ要素は実効ヒット領域≥40px（`before:-inset` 拡張可） |
| **単一トークン源** | Stripe/Linear級の一貫性 | 角丸・focus ring・影・アクセント使用を1ルール化し ESLint/grep で機械検査 |
| **単位の尊重** | Keysight/ADI系RFツール | GHz帯はGHzで入出力。軸ラベルの指数表記混在禁止 |

**フォールド予算（KPI）**:
- 基本ツール: ヘッダー圧縮後 **y≤360px で最初の入力欄**、**900pxビューポート内に主結果**（2ペイン化で常時可視）。
- 旗艦: **1画面目に「入力開始」と主要プリセット**、計算UIまで最大1スクロール。
- ページ総高目安: 基本ツール ≤2,500px / ナミ ≤2,800px / NCU ≤5,000px / 旗艦 ≤7,500px。

---

## 2. UI Kit v2（共通部品の統合仕様）— フェーズUX-1

> 方針: 新規部品を `src/components/` に追加 → 各ツールを段階移行 → 旧ローカル変種を削除。1PR=1部品。

**進捗（2026-07時点・Claude枠）**:
- ✅ **追加専用の新部品（既存描画不変・デプロイ済み）**: MetricCard・SegmentedControl・CollapsibleSection（`285bc72`）／ResultBar・MobileResultBar（`809087e`）＋純ロジック `src/lib/ui/kit.ts`（vitest検証）。
- ✅ **§2.7の安全な先行分**: hover:text-staf→staf-dark のAAコントラスト修正18箇所（`d306bc4`・既定描画不変）。
- ⬜ **残（＝既定描画/挙動を変える移行系。UX-0の視覚回帰基準線の完成後に着手）**: 2.2 Field（NumberField拡張・help二重表示廃止）／2.3 ヘルプ一本化（usePopoverDismiss・Tooltipヒット領域）／2.5 ChoiceChips共通化／2.7 残（rounded/ring/hex統一）。
  - 理由: これらは全ツールの既定レンダリングを変えるため、Antigravityの UX-0 スクショ基準線が固定される前に入れると差分の是非を機械検証できない。§5のウェーブ順（UX-0→UX-2）を厳守する。

### 2.1 `MetricCard`（結果表示の統一・D5解消）
新規 `src/components/MetricCard.tsx`。既存 `Stat` を内部利用。

```ts
type MetricCardProps = {
  label: string;            // 例: "リンクマージン"
  value: string;            // フォーマット済み数値（tabular-nums）
  unit?: string;            // "dB" 等（valueと分離して小さく）
  sub?: string;             // 1行の補足。2行以上は禁止
  tone?: "neutral" | "primary" | "success" | "info" | "caution" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  hint?: string;            // HelpHintに渡す（常時表示しない）
};
```
- 強調ルール: **判定を持つ値のみ tone を色付け**。それ以外は neutral（現状の「全結果staf色」`AntennaToolPanel.tsx:854` を廃止）。
- 「入力値のエコー」をMetricCardに入れることを禁止（`VswrConverterPanel.tsx:135-142` の入力再表示を撤去）。
- 移行対象: `NcuResultPanel.tsx:15`／`ResearchDistanceSheet.tsx:205`／`MicrostripLinePanel.tsx:134`／`AntennaToolPanel.tsx:854`（card()の描画部のみ差し替え、config契約は不変）。

### 2.1b `ResultBar` / `MobileResultBar`（主結果の統一表示）
新規 `src/components/ResultBar.tsx`。右ペイン先頭（desktop）と画面下部固定（mobile）の両形態を持つ。

```ts
type ResultBarProps = {
  primary: { label: string; value: string; unit?: string };  // 例: リンクマージン +12.3 dB
  judgement?: { label: string; level: LinkJudgementLevel };  // LEVEL_TO_TONE で配色（既存写像を使用）
  onJumpToDetail?: () => void;                               // モバイルでタップ時に結果セクションへ
};
```
- desktop: 右ペイン最上部に `data-testid="primary-result"` を付与（e2eフォールド検証の対象）。
- mobile (`MobileResultBar`): 旗艦の `StickyResultSummary.tsx` の実装（IntersectionObserver で結果カード可視時に退避、`:38-48`）を**そのまま一般化**し、props を上記に統一。z-index・高さ(約64px)・退避挙動は現行踏襲。
- 判定を持たないツール（変換系: dBm/周波数など）は judgement 省略で値のみ表示。

### 2.2 `Field`（数値入力の統一・D3/D6解消）
既存 `NumberField.tsx` を拡張し、5変種を吸収する。

```ts
type FieldProps = NumberFieldProps & {
  helpDisplay?: "hint" | "inline";  // 既定 "hint"（＝常時表示を廃止しHelpHintのみ）
  description?: string;             // 常時表示は最大1行・text-xs。既定なし
  example?: string;                 // "例: 920"（placeholder に統一しても可）
  emptyBehavior?: "preserve" | "invalid";  // 既存踏襲
  nullable?: boolean;               // OptionalNumberField 吸収（onChange: number|null）
};
```
- **D3の核心対応**: `NumberField.tsx:145-149` の「help をツールチップ＋常時表示の両方に出す」実装を廃し、help は HelpHint のみに。既存呼び出しは `helpDisplay="inline"` を暫定指定して視覚非破壊で移行→ツール別改修時に外す。
- 生 `<input type="number">`（FsplPanel/VswrConverterPanel/DbmConverterPanel/Microstrip）を Field へ置換。**単位selectつき入力**（FSPLの距離等）は `unitSelect?: {value, options, onChange}` スロットを追加して吸収。
- 削除対象（移行完了後）: `LinkBudgetNumberField`（`LinkBudgetPanel.tsx:103`）、`ResearchNumberField`（薄いラッパ化は可）、`OptionalNumberField`（`NcuFieldAnalysisPanel.tsx:37`）、`DistanceField`（`NcuBelowGroundClient.tsx:184` → unitSelectで吸収）。

### 2.3 ヘルプの一本化（D7解消）
- **HelpHint を唯一のヘルプUI**とする（40pxヒット領域・Esc/外側クリック実装済み）。
- 用語ピル型 `Tooltip` は「本文中の用語注釈」専用に限定し、(a) `before:-inset-2` でヒット領域≥40px化、(b) **1コントロールにつき最大1個**、(c) ラベル行から撤去（`VswrConverterPanel.tsx:85-90` の誤アフォーダンス解消）。
- 開閉ロジックの重複（`Tooltip.tsx:17-37` ≒ `HelpHint.tsx:13-33`）は共通フック `usePopoverDismiss()` に抽出。

### 2.4 `SegmentedControl`（モード切替の統一・D9/D10）
ナミゲートの実装（roving tabindex・矢印キー巡回 `NamiGateClient.tsx:54-65,294-321`）を共通化して `src/components/SegmentedControl.tsx` に昇格。適用: ナミのヒートマップモード／NCUの伝搬モデル2択（`NcuBelowGroundClient.tsx:704-711` のselect置換）／VSWRの指標切替／NCUのpurpose切替。高さ py-2.5（≥40px）。

### 2.5 `ChoiceChips` の共通化
NCUローカル実装（`NcuBelowGroundClient.tsx:494-550`）を共通部品へ昇格。変更点: (a) py-2 でヒット高≥40px、(b) 重症度ドットの**凡例1行**（緑=有利〜赤=不利）をグループ先頭に表示、(c) severity辞書をグループごとに分離（現在の全option共有辞書 `chipSeverityByValue` は将来の同名value衝突リスク）。

### 2.6 `CollapsibleSection`（プログレッシブディスクロージャの標準手段）
`Accordion` を拡張: `defaultOpen?: boolean` / `storageKey?: string`（localStorageで開閉を記憶）。用途: 「はじめての見方」・チュートリアル・コラム・上級入力。

### 2.7 トークンの確定（D8解消）
`tailwind.config.ts` と `docs/` に明文化し、ESLint/CIのgrepで機械検査:
- **余白スケール（4pxグリッド）**: カード内padding=p-4（lg画面はp-5）／カード間gap=gap-4／セクション間=space-y-6／フィールド縦間隔=space-y-4／ラベル→入力=mt-2。この5つ以外の恣意的な余白（mt-3.5等）を新規コードで禁止。
- **CollapsibleSection の storageKey 命名**: `"<slug>:<section>"`（例: `"fspl:beginner-guide"`）。全ツール共通セクションはslugなし（`"beginner-guide"` で全ツール共有＝一度閉じたら全ツールで閉、を仕様とする）。
- **角丸**: コンテナ=rounded-lg、チップ/ピル=rounded-full、それ以外禁止（rounded-md/xl/2xl を段階置換）。
- **focus ring**: `focus-visible:ring-2 ring-staf/40` に統一（現状 /15,/20,/25,/30,/40 の5種）。
- **hover色**: `hover:text-staf`（AA不足4.07:1）→ `hover:text-staf-dark` へ19箇所一括置換。
- **タイポ**: `typeScale.ts` を実勢に合わせて改訂（h1=text-3xl/bold, h2=text-xl/bold, h3=text-base/bold, body=text-sm, caption=text-xs）し**採用を開始**。`SectionHeading` は改訂の上で採用 or 削除を決定（放置禁止）。
- **チャート色**: 直書きhex 54箇所を `chartTheme` 参照へ置換（別PR・機械的）。
- **ボタン**: `Button.tsx` を primary/secondary/ghost の3変種に整え、手書きボタン（`QuickStartPresets.tsx:53`、`Header.tsx:147` 等）を置換。形状は rounded-full で統一。

### 2.8 受け入れ基準（UX-1）
- grep検査: `rounded-md|rounded-xl|rounded-2xl` の新規出現0／`ring-staf\/(15|20|25|30)` 出現0／`hover:text-staf"` 出現0／`#0071BD` 出現0（chartTheme経由のみ）。
- 結果表示・数値入力・ヘルプの実装がそれぞれ1系統（旧変種の定義が削除されている）。
- 既存 e2e 31件 green、視覚回帰（§7）で意図した差分のみ。

---

## 3. ToolShell v2（基本ツール22本の新テンプレート）— フェーズUX-2

`BasicToolPageShell.tsx` を改修。**ここを直すと22ツールが一括で変わる**（レバレッジ最大）。

### 3.1 レイアウト仕様
```
[Breadcrumbs 32px]
[h1 + 1行説明 + HelpHint(scopeNote)  … 合計 ≤96px]
[▸ はじめての見方（CollapsibleSection・既定閉・storageKey="beginner-guide"） … 閉時 ≤44px]
[main: lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] gap-6]
  [左: 入力カード（Field縦積み・プリセットチップ行を先頭）]
  [右: lg:sticky top-20 …
      ResultBar（主結果1つ: MetricCard lg + 判定バッジ）
      SecondaryStats（MetricCard sm ×2-4）
      入力連動ビジュアル（既存の図/チャート）]
[▸ 数式と理論（Accordion 既定閉）][▸ 使い方・用語（Accordion 既定閉）][▸ コラム（Accordion 既定閉）]
[ほかのツール（1行スクロール or 3枚）][ConsultationCta（1箇所のみ）]
```
- **フォールド保証**: ヘッダー圧縮（現状 y≈520 → 目標 y≈360 で入力開始）＋右ペインstickyで、**900pxで「入力操作中に主結果が常時見える」**を22ツール全てで達成。
- モバイル（<lg）: 縦積み（入力→ResultBar→図）。加えて `StickyResultSummary` を汎用化した `MobileResultBar`（判定＋主値のみ、IntersectionObserverで結果可視時に退避＝旗艦の実装 `StickyResultSummary.tsx:38-48` を共通化）を全ツールに配置。

### 3.2 コンテンツ削減ルール（D2解消・機械的に適用）
1. パネル内の h2+lead を削除し、シェルの h1+説明に一本化（`FsplPanel.tsx:60-63`、`DbmConverterPanel.tsx:107-110`、`VswrConverterPanel.tsx:75-78`、`AntennaToolPanel.tsx:1787-1788`）。
2. 常時表示チュートリアル（`VswrConverterPanel.tsx:256-285`、`DbmConverterPanel.tsx:291-320`）→「使い方・用語」Accordionへ移動。
3. `FormulaExplanationCard` は**末尾セクションに統一**（dBmの中間挿入 `DbmConverterPanel.tsx:202-211` を移動）。
4. コラムリンクはシェル末尾の1箇所のみ（FormulaExplanationCard内の重複リンク `FormulaExplanationCard.tsx:24-26` を削除）。
5. 英語見出し（"FSPL Visual" 等）を日本語へ。h1→h3 の階層飛び（VSWR）を h2 に修正。
6. 「はじめての見方」の3カード文言は tools.ts の beginnerGuide をそのまま使う（変更なし）。**表示形態だけ**折り畳みに。

### 3.3 ツール個別の追加修正（UX-2内で同時に）
- **FSPL**: 固定概念図（`FsplPanel.tsx:159-176`）を削除し、入力連動の距離バー比較を右ペイン主ビジュアルに昇格。aria-invalid をフィールド単位に。
- **VSWR**: 入力値エコーの撤去、結果の強調を「導出値のみ」に統一、「各指標の説明」ピル行（120-131）を廃止し各MetricCardのhintへ。
- **dBm**: 早見表を Accordion へ。第2計算機（dBi/dBd/EIRP）は「関連計算」タブとして分離。
- **アンテナ系10種（AntennaToolPanel）**: `ResearchBridgeSection` を結果グリッドの**後ろ**へ移動（`AntennaToolPanel.tsx:1854` の1行移動）または Accordion 化。プリセットに aria-pressed+選択スタイル追加。`smart()` の軸ラベルを「≥1000MHz は GHz 表記」に変更（描画側 `:867` で対応、libは触らない）。reflector-ris の無条件warning（`:1373`）は explanation へ統合。チャートのカテゴリ軸→数値軸（`XAxis type="number"`）で不等間隔の歪み解消。

### 3.4 ワイヤーフレーム（実装の視覚正解。これと異なるレイアウト解釈は差し戻し）

Desktop（≥lg、1440×900）:
```
┌─ Header (sticky, 61px) ─────────────────────────────────────────────┐
├─ Breadcrumbs (32px) ────────────────────────────────────────────────┤
│ h1 ツール名                                    [? scopeNote→HelpHint] │  ≤96px
│ 1行説明（60字以内）                                                    │
│ ▸ はじめての見方（閉: 44px の1行バー）                                  │
├───────────────────────────┬─────────────────────────────────────────┤
│ 入力カード (5fr)            │ 右ペイン (4fr, lg:sticky top-20)          │
│ ┌─────────────────────┐   │ ┌─ ResultBar ──────────────────────┐    │
│ │[プリセットチップ行]    │   │ │ 判定バッジ  主値 12.3 dB          │    │
│ │ Field 1              │   │ │ data-testid="primary-result"     │    │
│ │ Field 2              │   │ └──────────────────────────────────┘    │
│ │ Field 3 …            │   │ [MetricCard sm ×2-4 (2列)]              │
│ │ ▸ 詳細条件(上級・閉)   │   │ [入力連動ビジュアル(図/チャート)]          │
│ └─────────────────────┘   │                                         │
├───────────────────────────┴─────────────────────────────────────────┤
│ ▸ 数式と理論(閉)  ▸ 使い方・用語(閉)  ▸ コラム(閉)                       │
│ ほかのツール(1行) / ConsultationCta(1箇所)                              │
└──────────────────────────────────────────────────────────────────────┘
```
Mobile（<lg、375px）: 縦積み［h1→▸はじめての見方→プリセット→入力→ResultBar→図→▸各折りたたみ］＋ 画面下部に `MobileResultBar`（結果カードが画面内に入ったら退避）。

### 3.5 22ツール共通移行チェックリスト（1ツール=1PR、Work Order化の雛形）

各ツールのUX-2移行PRは以下を上から順に実施し、PR本文にチェック結果を貼る:

1. [ ] パネル内の h2+lead 重複を削除（シェルh1に一本化）
2. [ ] 生input／ローカル入力変種を `Field` に置換（`helpDisplay` 既定=hint。単位selectは `unitSelect` スロット）
3. [ ] 結果表示を `MetricCard` に置換（入力値エコー禁止・判定のみ着色）
4. [ ] 主結果を右ペイン `ResultBar` へ（`data-testid="primary-result"` 付与）
5. [ ] 常時表示チュートリアル・早見表・第2計算機を Accordion/タブへ移動
6. [ ] `FormulaExplanationCard` を末尾セクションへ、コラムリンク重複を削除
7. [ ] 用語ピルを1コントロール1個以下に削減（説明はMetricCard/Fieldのhintへ）
8. [ ] 英語見出しの日本語化・見出し階層(h1→h2)の整合
9. [ ] e2e: 既存文字列の更新＋フォールドアサーション（§7）追加
10. [ ] 4ゲート緑＋視覚回帰スクショをPRに添付

**変更禁止**: `src/lib/rf/**`・`src/data/tools.ts` のデータ値・CI。判断に迷う点が出たら実装せず ui-redesign-plan.md への質疑として差し戻す。

### 3.6 受け入れ基準（UX-2）
- Playwright で 1440×900 の各基本ツール: 「最初の入力欄の getBoundingClientRect().top ≤ 400」「主結果ノードが viewport 内」をアサート（§7のe2e追加）。
- ページ総高: 基本ツール ≤2,500px（`document.body.scrollHeight` をe2eで計測）。
- 既存機能の回帰なし（e2e全緑）。文言削除はシェル/パネルの重複部分のみで、tools.ts のデータは不変。

---

## 4. 大型3ツールの個別改修 — フェーズUX-3

### 4.1 旗艦（rf-basic-link-calculator）
| 変更 | 内容 | 対象 |
|---|---|---|
| Hero圧縮 | 650px→約280px（h1+1行リード+CTA2つ+免責はHelpHint化）。右カラムのフロー図は「使い方」Accordionへ | `HeroSection.tsx` |
| Roadmap/Presets | BeginnerRoadmap は CollapsibleSection（既定閉・storageKey）。QuickStartPresets は**チップ1行**（横スクロール、選択状態付き）に圧縮し計算UIの直上に | `BeginnerRoadmap.tsx`、`QuickStartPresets.tsx` |
| 入力密度 | LinkBudgetNumberField→Field 移行で「説明文・入力例・推奨レンジ」を hint/placeholder へ。1フィールド 240px→約120px、入力列 4,000px→約2,000px | `LinkBudgetPanel.tsx:121-163` |
| 上級項目の格納 | 送受アンテナ高・実測補正など上級入力を CollapsibleSection「詳細条件」へ（地面近接損失のdetails化 `:1099` と同型に統一） | `LinkBudgetPanel.tsx` |
| CTA削減 | 相談CTA 6→2（ResultHero内の判定連動CTA＋ページ末尾のみ） | 各所 |
| ステップ体系 | 番号付きステップを「①条件を選ぶ→②入力→③結果を読む」の1系統に統一（Roadmap/効き方ガイド/前提メニューの番号を廃止） | `BeginnerRoadmap.tsx`、`LinkBudgetPanel.tsx:366-431,675,681` |
| 維持 | ResultHero sticky・StickyResultSummary・滝→入力ジャンプは現状維持（優良資産） | — |

### 4.2 NCU（ncu-below-ground）
| 変更 | 内容 | 対象 |
|---|---|---|
| purpose切替の排他化 | **【決定】入力系のみ差替え・結果系（ResultPanel/滝/断面図）は両モード共有**。fieldモード時、見積もり入力カード群は CollapsibleSection「見積もり条件（閉）」に畳む（値は保持＝計算は継続）。「タブに見えて増える」不一致を解消 | `NcuBelowGroundClient.tsx:612-634` |
| 結果正本の一本化 | 受信電力/マージン/主因の重複4箇所→ResultPanelを正本に。滝・断面図の結果ストリップは削除、断面図のチップ12個は details へ | `NcuResultPanel.tsx`、`NcuBudgetWaterfall.tsx:276-283`、`NcuCrossSectionDiagram.tsx:126-139,356-363` |
| コントロール統一 | 2択の伝搬モデル select→SegmentedControl。ChoiceChips を共通版（py-2・凡例付き）へ | `NcuBelowGroundClient.tsx:704-711` |
| プリセット圧縮 | 7枚全文カード（約600px）→選択状態付きチップ+選択時のみ説明1行。operatorHint と title の重複解消 | `NcuBelowGroundClient.tsx:647-672` |
| ヘルプ | help二重表示の廃止（Field移行）でフォーム高 約2,700px→約1,800px | 全入力 |
| 末尾整理 | 教育4連発（入力の前提/研究コラム/CTA/現地メモ）→「現地メモ」をCTA前へ、研究コラムをAccordionへ | `NcuBelowGroundClient.tsx:893-953` |

### 4.3 ナミゲート（nami-gate-window）
| 変更 | 内容 | 対象 |
|---|---|---|
| 仕様/導出の分離 | 「ナミゲート仕様（固定）」を固定4行に限定し、連動4行は「この条件での内訳」として別見出し | `NamiGateClient.tsx:193-207` |
| CSV移設 | CSVボタンをヒートマップカード内（mode切替の隣）へ移設。結果カードは提案サマリコピーのみ | `NamiGateClient.tsx:269-276→294-321` |
| 免責一本化 | tools.ts:200 の scopeNote を1文に短縮（詳細は末尾Calloutに集約）。「商用デモ用の説明」の条件再掲を削除し計算式のみ残す | `tools.ts:200`、`NamiGateClient.tsx:327-350` |
| ターゲット | セグメンテッド py-2.5 化（タブレット営業デモ想定） | `NamiGateClient.tsx:313` |
| 維持 | ヒートマップのa11y（矢印キー・テーブル・凡例連動）は現状維持（模範実装） | — |

---

## 5. 実装フェーズ分割とロードマップ統合

既存ロードマップとの関係: **フェーズ2-3の残り（AntennaToolPanel 1,908行・LinkBudgetPanel 1,245行の分割）は UX-2/UX-3 に統合する**。同じ巨大ファイルを「分割だけ」「UI改修だけ」で2度触るのは無駄なため、**分割＝UI改修の第一手**として1パスで行う。

| フェーズ | 内容 | 規模目安 | 依存 |
|---|---|---|---|
| **UX-0 計測基盤** | Playwrightに「フォールド可視性・ページ総高・DOM順序」アサーション＋スクリーンショット基準線（全24ツール×desktop/mobile）を追加。**改修前に現状値を固定** | e2e追加のみ | なし |
| **UX-1 UI Kit v2** | §2 の部品統合（MetricCard/Field/ヘルプ一本化/Segmented/ChoiceChips/CollapsibleSection/トークン確定） | 新規部品6＋置換〜40ファイル | UX-0 |
| **UX-2 ToolShell v2** | §3 のシェル改修＋基本22ツール移行（AntennaToolPanelはこの中で分割: config定義/入力/結果/図/チャート/ガイダンスの6ファイルへ） | シェル1＋パネル13 | UX-1 |
| **UX-3 大型3ツール** | §4 の旗艦/NCU/ナミ個別改修（LinkBudgetPanelはこの中で分割: 入力グループ4ファイル＋ガイド類へ） | 3ツール | UX-1（UX-2と並行可） |
| **UX-4 仕上げ** | chartTheme掃討（hex54箇所）・タップターゲット残件・コピー削減の最終確認・視覚回帰の基準線更新 | 機械的置換 | UX-2/3 |

推奨着手順: UX-0 → UX-1 → UX-2 → UX-3 → UX-4。UX-2とUX-3は担当を分けて並行可能（共有ファイルは UI Kit のみ）。

---

## 6. KPI（改修の合否判定）

| KPI | 現状 | 目標 |
|---|---|---|
| 最初の入力欄の位置（基本ツール） | y≈520px | **y≤400px** |
| 主結果の可視性（1440×900・入力操作中） | スクロール必要（FSPL y≈790px） | **常時可視（sticky右ペイン）** |
| 旗艦: 計算UIまでのスクロール | 約2.2画面 | **≤1画面** |
| ページ総高（基本/NCU/旗艦） | 約3,000 / 7,000 / 11,000px | **≤2,500 / ≤5,000 / ≤7,500px** |
| 同一情報の説明箇所数 | 3〜5箇所 | **≤2箇所**（本文1＋折り畳み1） |
| 結果表示・数値入力・ヘルプの実装系統 | 5 / 5 / 2 | **各1系統** |
| タップターゲット（実効ヒット領域） | ピル22px等 | **全コントロール≥40px** |
| コントラスト | hover AA不足19箇所 | **AA準拠100%** |

---

## 7. テスト方針

1. **視覚回帰**: UX-0 で Playwright スクリーンショットを全24ツール×{1440×900, 375×812} で取得しコミット。以降の各PRは差分レビュー必須。
2. **フォールドアサーション**（新規 e2e）: 各ツールで `page.locator('input').first()` の top ≤400、主結果（`data-testid="primary-result"` を各ツールに付与）の viewport 内包含、`document.body.scrollHeight` ≤ KPI値。
3. **既存回帰**: `npm run test`（unit 182+）/ `npm run test:e2e`（31+）を各PRで green。文言変更に伴う e2e 文字列は同一PR内で更新。
4. **a11y チェック**: axe-core を e2e に組み込み、重大違反0を維持（特にコントラスト・aria-invalid の粒度）。
5. **計算ロジック非干渉の保証**: `src/lib/rf/**` に diff が無いことを各PRで機械確認（CIで `git diff --stat` チェック可）。

---

## 付録A: 部品移行マップ（削除→統合先）

| 削除対象 | 統合先 |
|---|---|
| `NcuResultPanel.tsx` MetricCard / `ResearchDistanceSheet.tsx` MetricCard / `MicrostripLinePanel.tsx` ResultCard / `AntennaToolPanel` card()描画部 | `MetricCard` |
| `LinkBudgetNumberField` / `ResearchNumberField` / `OptionalNumberField` / `DistanceField` / 生input（FSPL・VSWR・dBm・Microstrip・PropagationExplorer Field） | `Field`（NumberField拡張） |
| ナミのセグメンテッド実装 / NCUの2択select / VSWRの指標select / NCU purposeカード | `SegmentedControl` |
| NCUローカル ChoiceChips | 共通 `ChoiceChips` |
| `Tooltip` のラベル行用法 / NumberField内help常時表示 | `HelpHint`＋`Field.description`(1行) |
| `typeScale.ts`（死蔵） | 改訂して採用（採用しない場合は削除） |
| `SectionHeading.tsx`（死蔵） | 改訂して採用 or 削除 |
| `InfoCard`（色名トーン語彙） | `Callout`（意味トーン）へ置換後削除 |

## 付録B: 監査で確認済みの「維持すべき優良実装」
ResultHero sticky（`CalculatorTabs.tsx:134`）／StickyResultSummary の IntersectionObserver 退避／滝グラフ→入力欄ジャンプ（`CalculatorTabs.tsx:53-67`）／NumberInput ドラフト方式／`LEVEL_TO_TONE` の判定→トーン一元写像／chartTheme の seriesText（軸AA）／ヒートマップのキーボード操作・数値テーブル／skip link・reduced-motion・印刷CSS。
