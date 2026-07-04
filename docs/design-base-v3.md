# デザインベース v3 — 「計測器の精度、教科書の親しみ」

**作成**: Fable（ベースデザイン担当）
**流し込み**: Opus（整合レビュー・共有部品API）／Codex・Fable（量産適用）／Antigravity（視覚検証・再ベースライン）
**正本関係**: 本書がデザイン言語の正本。部品APIは `docs/ui-redesign-plan.md` §2、適用順序は `docs/improvement-roadmap.md` Track I。

---

## 0. デザインコンセプト

**「計測器の精度、教科書の親しみ」** — スタッフ株式会社のアンテナ事業のための、
*信頼される数値* と *誰でも読める説明* を両立するデザイン。

3原則（すべての判断はここへ帰着させる）:
1. **数値が主役**（Precision）: 結果数値は常に最も強いコントラスト・tabular-nums・単位分離。装飾は数値の理解を助けるときだけ許す（Rams「Less, but better」／Tufte データインク比）。
2. **視線は1方向**（Flow）: 各画面は「①条件を選ぶ→②入力→③結果を読む」の一筆書き。視線が往復するレイアウトを禁止（Nielsen: 認知負荷最小）。
3. **色は意味**（Semantic color only）: 色付けは判定・状態・ブランドアクセントのみ。飾りの色は使わない（60-30-10: neutral 60 / surface 30 / accent+semantic 10）。

## 1. 採用するトップデザイナーのセオリー（適用先つき）

| セオリー | 本サイトでの具体適用 |
|---|---|
| Dieter Rams「Less, but better」 | 装飾境界・重複見出し・二重説明の削除。1画面1主役 |
| Refactoring UI（Wathan & Schoger） | 階層は**サイズでなく weight と色**で作る（ラベル=slate-500/semibold、値=slate-950/bold）。余白はスケールから選ぶ（恣意値禁止） |
| Tufte（データインク比） | チャートv2で適用済み（縦グリッド廃止・統一ツールチップ）。表・カードにも拡張: 罫線より余白で区切る |
| Stripe/Linear系 | neutral支配＋単一アクセント(staf)、寛容な行間、繊細な border+shadow の2層エレベーション（既存 shadow-card 踏襲） |
| Apple HIG / Material | タッチターゲット≥44px（チップpy-2/HelpHint40pxで達成済み）、モーションは意味のある150–200msのみ・reduced-motion尊重 |
| Jakob's Law | 入力は上/左・結果は下/右の慣習配置（2ペインShell踏襲）。独自UIを発明しない |
| 8ptグリッド＋モジュラースケール | §2のトークンとして固定 |

## 2. デザイントークン v3（正確な値）

### 2.1 タイポグラフィ（モジュラースケール 1.25・Major Third）
| ロール | クラス | 用途 |
|---|---|---|
| Display | `text-3xl font-bold tracking-tight text-slate-950`（30/36） | ページh1のみ |
| Title | `text-xl font-bold text-slate-950`（20/28） | セクションh2 |
| Heading | `text-base font-bold text-slate-950`（16/24） | カードh3 |
| Label | `text-sm font-semibold text-slate-900`（14/20） | 入力ラベル・表ヘッダ |
| Body | `text-sm leading-relaxed text-slate-600`（14/22） | 本文（最大 `max-w-prose`） |
| Caption | `text-xs leading-relaxed text-slate-500`（12/18） | 補足・凡例 |
| **Metric** | `text-2xl font-bold tabular-nums text-slate-950`＋単位は `text-sm font-semibold text-slate-500` を**ベースライン揃え** | 結果数値（MetricCard準拠） |
- 和文フォントは現行システムスタック維持（Noto Sans JP系が来る環境を想定）。**追加Webフォントは読み込まない**（性能予算）。
- 数値は全域 tabular-nums（globals.css 適用済み）。

### 2.2 スペーシング（8ptグリッド・§2.7を昇格）
`4/8/12/16/20/24/32/48` のみ。**セクション間=space-y-6、カード間=gap-4、カード内=p-4（lg:p-5）、ラベル→入力=mt-2、フィールド間=space-y-4**。これ以外の恣意的余白（mt-3.5等）は新規禁止（§2.8のgrep検査対象）。

### 2.3 カラー（60-30-10）
- **60% Neutral**: ページ地=`bg-slate-50`、本文=slate-600、罫線=slate-200。
- **30% Surface**: カード=白+border-slate-200+shadow-card。インセット面=slate-50（Cardのvariant）。
- **10% Accent+Semantic**: アクション/現在地=staf、判定=success/info/caution/warning/danger（意味トークンのみ。既存 `tones.ts` を唯一の入口に）。
- 文字コントラストはAA必須（hover含む。hover:text-staf-dark規約は達成済み）。

### 2.4 エレベーション（2層のみ）
| レベル | 使い所 |
|---|---|
| Flat | `border border-slate-200`（インセット・表・凡例） |
| Raised | `shadow-card`（標準カード）／`hover:shadow-card-hover`＋`-translate-y-0.5`（リンクカードのみ） |
`shadow-soft` はヒーロー級1画面1回まで。3層目は作らない。

### 2.5 形状・フォーカス・モーション
- 角丸: コンテナ=`rounded-lg`、ピル/チップ=`rounded-full`（§2.7確定・他は段階置換）。
- フォーカス: `focus-visible:ring-2 ring-staf/40`（統一済み）。
- モーション: `transition` 150–200ms・transform/opacityのみ・`prefers-reduced-motion`で無効（チャートv2 H2と同源）。

## 3. ページ設計図（Blueprints）

### 3.1 共通シェル（BasicToolPageShell v3）
```
[h1 30px + HelpHint] → [説明1–2行 max-w-prose]
[CollapsibleSection: はじめての見方（既定閉）]
[data-testid=tool-calculator]  ← ファーストビュー到達 ≤400px（fold予算e2e済み）
  └ 2ペイン: 左=入力（Field群） / 右=結果（ResultBar+MetricCard+図）
[ほかのツール 3列カード] → [ConsultationCta] → [コラムリンク]
```
- 変更点(v3): h1周りの余白を `py-5→pt-6 pb-4` に統一、説明は `max-w-prose`、
  「ほかのツール」カードは Raised+interactive の統一エレベーションへ（現状達成済みの確認のみ）。

### 3.2 ホーム
- Hero: Display見出し＋1行リード＋主要2ツールへのCTA（staf塗り1つ＋ghost1つ）。**装飾背景を足さない**。
- ツールグリッド: カテゴリ見出し(Title)＋3列カード。タグライン2行clamp（実装済みパターン踏襲）。

### 3.3 旗艦（rf-basic-link-calculator）
- 3ゾーン: ①条件（LinkTypeCards）②入力（Field・上級はCollapsibleSection）③結果（ResultHero sticky＋滝v2）。
- ステップ番号は1系統（§4.1残タスク）。相談CTAは判定連動＋末尾の2箇所のみ。

### 3.4 図版・チャート
- チャート=chartTheme v2（適用済み）／SVG図=diagramTheme＋DiagramDefs（適用済み）。
- **新規図はこの2つ以外の色・線幅・影を直書き禁止**（grep検査: `#[0-9A-Fa-f]{6}` の新規追加はchartTheme/diagramTheme経由のみ）。

## 4. 流し込み手順（分担・順序・受け入れ基準）

### 分担
| 役割 | 担当 | 内容 |
|---|---|---|
| ベース設計 | **Fable（本書）** | デザイン言語・トークン・設計図の確定＋手本1ページ |
| 整合レビュー/部品API | **Opus** | 共有部品（Card/Field/MetricCard等）への影響判断・後方互換・§2.8のgrep基準更新 |
| 量産適用 | **Codex/Fable** | 1ファイル=1エージェントで各ページを設計図へ寄せる（機械的置換に徹する） |
| 視覚検証 | **Antigravity** | `-linux` 視覚回帰・差分承認・再ベースライン（runbook準拠） |

### 適用順序（Work Order）
1. **I1 タイポロール統一**: §2.1の7ロールへ全ページの見出し/本文/ラベルclassを寄せる（機械的・ページ単位）。
2. **I2 余白リズム統一**: §2.2のスケール外余白を置換（`mt-3.5|py-2.5(入力以外)|space-y-5` 等を検出→是正）。
3. **I3 シェルv3**: BasicToolPageShellの余白・prose幅・Hero圧縮（ホーム含む）。
4. **I4 エレベーション監査**: 2層規約外（多重影・borderなしカード）を是正。
5. **I5 旗艦§4.1残**（ステップ1系統化・CTA削減）を本設計図で実施。
- 各WOは feature 直行せず track ブランチ→機能ゲート→Antigravity視覚ループ→マージ（確立済み運用）。

### 受け入れ基準（grep-able）
- タイポ: `text-lg font-bold`（旧Heading）や `text-slate-700`本文 等、ロール外の組合せが新規0。
- 余白: `mt-3.5|mb-3.5|space-y-5\b|p-3\b(カード)` の新規0（既存は段階置換）。
- 色: 直書きhexの新規0（chartTheme/diagramTheme経由のみ）。60-30-10逸脱（意味のない色面）0。
- a11y: axe重大0・AAコントラスト・タッチ≥44px維持。fold予算e2e緑。
- 視覚回帰: 意図した差分のみ（差分承認制）。

## 5. 手本（Fableベースデザインの参照実装）
- 既に本設計と同言語で実装済みのページ＝**dbm-converter（2ペイン+Field+MetricCard neutral）／NCU断面図（素材defs）／ナミヒートマップ（viridis+連続凡例）／旗艦滝v2**。量産時はこれらを視覚の正とする。
- 追加の静的モックは作らない（実装＝モック。視覚ループが差分を保証するため）。


## 6. 適用スコープの実測（2026-07-04 grep監査）

Track I の量産は**低密度分散のドリフト**であり、ブラインド一括は意図的階層を壊すため禁止。実測:
- **Codex の2ペイン改修済みツール（VSWR/dBm/周波数波長/FSPL）は既に本設計水準**（h2=text-base font-bold=Heading等）。量産対象外。
- 残ドリフトは**未改修ページ＋大型コンポーネント**（RfLearningQuestClient/AntennaToolPanel/NcuFieldAnalysisPanel/FresnelDeepDive 等）に各1〜4箇所ずつ分散。
- 実施済み安全増分（i3-shell-v3ブランチ）: **I3シェルv3**＋**I1段落本文色 slate-700→600（14ファイル21箇所）**。
- 残WOは per-context 判断が要るため、**Codex（機械的改修の主担当・現在編集障害で停止中）復旧後**か、参照実装（dbm-converter/FSPL/i3）に対する**監督付きFableバッチ＋Antigravity検証**で進める。ブラインドsweepは色/余白の意図を壊すため不可。
- I5（旗艦§4.1残: ステップ1系統化・CTA削減）は Opus が判断込みで実施。
