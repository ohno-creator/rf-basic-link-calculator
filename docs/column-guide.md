# コラム制作ガイド（正本）— 二層読者設計と効率的な制作パイプライン

**目的**: 全ツールのコラムを「素人・初心者が読んで面白く理解でき、玄人が読んで感心する」水準へ引き上げ、かつ**今後の追加・改稿を低コストで回せる仕組み**を定める。
**位置づけ**: [improvement-roadmap.md](./improvement-roadmap.md) Track D の正本。コード実装（データモデル・レンダラー）は本書承認後に着手する。

---

## 1. 設計原則：両立は「平均」ではなく「層」で実現する

素人向けの面白さと玄人向けの厳密さを**同じ一本の文章**で狙うと、素人には難しく玄人には浅い「中間の凡文」になる。これが二層読者設計の最大の失敗パターン。

本プロジェクトの解は**レイヤリング**（コンテンツへの progressive disclosure の適用）：

- **表面（常時表示）**は素人が最後まで読める物語。専門用語は初出で1行定義。
- **深層（折りたたみ・出典・数値表）**に玄人向けの検証可能性を格納。
- 面白さの源泉＝**問い・歴史・失敗談・意外性**。感心の源泉＝**出典・定量・導出・たとえの限界の明示**。この2つは層を分ければ一切衝突しない。

この方針は本プロジェクトの既存資産が既に実証している：
- **HataColumn**: 秦正治氏の逸話（物語）＋適用範囲の数値＋2025年研究リンク（検証可能性）が共存し、最高品質。
- **学習クエスト探究モード**: 「導波器が短い理由＝位相という見えない舵」のように、素人に届く比喩と物理的に正しい説明を両立した問題文が既に1000問規模で存在。
- 逆に **AntennaToolPanel の column（出典ゼロの3点テキスト）** が最下層＝格差の解消が本トラック。

---

## 2. コラムの標準解剖学（5層構造）

全コラムは次の5層で構成する。**1〜2層は常時表示、3層は開いた状態、4〜5層は折りたたみ**（UX計画の CollapsibleSection を使用）。

| 層 | 名前 | 対象読者 | 分量規律 | 内容 |
|---|---|---|---|---|
| 1 | **フック** | 全員 | 2〜3文・専門用語ゼロ | 問い（「なぜ短いアンテナは飛ばないのか？」）または逸話（「1980年、秦正治は曲線の束を1本の式にした」）。**読者が損得を感じる問い**が最強 |
| 2 | **本文（物語で本質）** | 素人〜 | 段落3〜5個・**合計600〜800字**（読了90秒） | 歴史→本質→実務の順。専門用語は初出で括弧1行定義。**たとえを使う場合は「たとえの破れ」を必ず1文添える**（玄人が眉をひそめる最大要因は"間違ったたとえ"） |
| 3 | **数値で見る** | 中級〜 | 表1枚（3〜6行） | 定量主張の表。「都市↔開放地の差 28.5dB（900MHz・1km）」など。**値は手書きせず lib/rf の関数でビルド/実行時に計算**（式を直せば数値も直る）。可能なら現在の入力値に連動（LiveExample） |
| 4 | **なぜこの式か（導出）** | 玄人 | 折りたたみ・要点2〜4行＋原典参照 | 20log10=球面波の電力束密度∝1/d²、√f=表皮効果、像理論、Chu限界など「1段だけ深く」。全導出はしない（原典に委ねる） |
| 5 | **出典・さらに深く** | 玄人 | 折りたたみ・最低1つの一次出典 | 論文・規格は**式番号/節番号まで**（例: ITU-R P.526-15 §4.5、Hata 1980 IEEE Trans. VT-29 pp.317-325）。取得日つき |

補助ブロック（任意）: **アンチパターン**（誤解→数値でみる帰結→回避策。例:「dBiとdBd混同→2.15dB系統誤差」）。実務者の「あるある」は素人にも面白く玄人にも刺さる、両層に効く数少ない共通素材。

---

## 3. 品質基準（検収チェックリスト）

### 素人テスト（全て YES で合格）
- [ ] フック2〜3文に専門用語がない（dB・アンテナ利得等も不可。使うなら本文で定義後）
- [ ] 本文だけ読んで「何が問題で、どうすればいいか」が分かる
- [ ] 「へえ」と言える意外性・逸話・失敗談が最低1つある
- [ ] たとえがある場合、破れ（どこから成り立たないか）が明記されている
- [ ] 常時表示部分が800字以内・スクロール1画面以内

### 玄人テスト（全て YES で合格）
- [ ] 主要な主張それぞれに一次出典（式番号/節番号レベル）が紐づく
- [ ] 定量主張が本サイトのツールで再現可能（または出典の値と照合可能）
- [ ] 適用範囲・典型誤差が数値で示されている
- [ ] 技術的な誤りゼロ（AGENTS.md基準: dB/線形の別・単位・適用条件を明記）— **Claudeの技術レビュー必須**
- [ ] 読後に意思決定が変わる（モデル選択・マージン・実測手順のいずれかに接続）

---

## 4. データモデル（効率化の核心）

現状の問題: コラムが **TSX直書き**（HataColumn等）と **string[]**（AntennaToolPanel）に分裂し、改稿=コンポーネント修正、数値=手書きで陳腐化する。

### 4.1 型定義（実装先: `src/data/columns/types.ts`）

```ts
export type ColumnSource = {
  label: string;            // "Hata (1980) IEEE Trans. VT-29"
  href: string;
  kind: "paper" | "standard" | "dataset" | "book" | "article";
  locator?: string;         // "式(16)-(20)" / "§4.5" / "Table 7.4.1-1"
  note?: string;            // 1行の要旨
  retrievedAt: string;      // "2026-07"（リンク鮮度運用に使用）
};

export type QuantRow = {
  label: string;                        // "都市↔開放地の差（900MHz・1km）"
  compute: () => string;                // lib/rf を呼びフォーマット済み文字列を返す
  liveKey?: string;                     // 指定時、レンダラーが現在入力で再計算（LiveExample）
  note?: string;
};

export type AntiPattern = {
  mistake: string;                      // "dBiの値をdBdの欄に入れる"
  consequence: string;                  // "全リンク計算に+2.15dBの系統誤差"
  fix: string;                          // "仕様書の単位表記を確認。本ツールの変換タブで照合"
};

export type ToolColumn = {
  id: string;                           // "fresnel-deep-dive"
  title: string;
  hook: string;                         // 層1（2〜3文）
  body: string[];                       // 層2（段落配列・合計600〜800字）
  analogy?: { text: string; limits: string };  // たとえ＋破れ（必須ペア）
  quant?: { title: string; rows: QuantRow[] }; // 層3
  derivation?: { title: string; steps: string[]; sourceIds?: string[] }; // 層4
  antiPatterns?: AntiPattern[];
  sources: ColumnSource[];              // 層5・最低1つの一次出典
  lastReviewed: string;                 // "2026-07"
};
```

### 4.2 共通レンダラー（実装先: `src/components/ToolColumnCard.tsx`）

```
<ToolColumnCard column={column} live={currentInputValues?} />
  ├ 層1-2: 常時表示（本文800字ガードは lint ではなくレビューで担保）
  ├ analogy: Callout(neutral) 内に「たとえ」と「ただし」を対で表示
  ├ 層3: 表（compute() 実行。liveKey があれば live 値で再計算し「いまの条件では」表示）
  ├ 層4: CollapsibleSection（既定閉・「なぜこの式か」）
  ├ antiPatterns: CollapsibleSection（既定閉・「よくある間違い」）
  └ 層5: 出典リスト（kindバッジ・locator表示）＋ フッター「最終確認: {lastReviewed}」
```

**レンダラー契約（実装者向けの確定事項）**:
- Props: `{ column: ToolColumn; live?: Record<string, number> }`。**live は panel が明示的に渡す prop**（React Context は使わない＝コラムの依存を見えるようにする）。
- `QuantRow.liveKey` が `live` に存在する場合のみ「いまの条件では」行を追加表示。存在しない/undefined なら `compute()` の既定条件値のみ。
- 層4・アンチパターンは `CollapsibleSection`（UI Kit v2）を使用、`storageKey` は付けない（毎回閉）。
- 出典は `kind` バッジ＋`locator` を label 直後に小さく表示。フッターに「最終確認: {lastReviewed}」。
- 800字ガードは実行時チェックしない（レビュー責務）。ただし `body.join("").length > 1000` で開発時 console.warn は可。

**効率化の効果**: 新コラム=データファイル1個の追加、改稿=データファイルのみ、数値=関数で自動追随、表示・折りたたみ・出典書式=レンダラーが一元管理。文体・構造のばらつきが構造的に起きない。

### 4.3 配置と登録
- `src/data/columns/<id>.ts` に1コラム1ファイル。`src/data/columns/index.ts` で集約。
- ツールとの紐づけは `tools.ts` の各エントリに `columnIds?: string[]` を追加（レジストリ単一ソース原則を維持）。

---

## 5. 制作パイプライン（エージェント分担・1本あたりの定型フロー）

| 工程 | 担当 | 成果物 | 検収 |
|---|---|---|---|
| ① 文献パック | **Antigravity**（Web調査） | `docs/handoff/column-<id>-research.md`: 一次出典リスト（locator付き）・主要な定量値の引用・リンク生存確認 | 出典が一次資料か（孫引き禁止） |
| ② 草稿 | **Claude** | `src/data/columns/<id>.ts` ドラフト（5層構造・quantはlib関数で実装） | §3の両チェックリスト自己適用 |
| ③ 組み込み | **Codex** | レンダラー接続・該当ツールへの配置・e2e文字列更新 | 4ゲート（test/lint/build/e2e）緑 |
| ④ 技術レビュー | **Claude** | 数式・単位・適用条件の照合（AGENTS.md基準）、たとえの破れの妥当性 | 玄人テスト5項目 |
| ⑤ 表示検証 | **Antigravity** | 実機スクショ（desktop/mobile）・リンク再検証・折りたたみ動作 | 素人テスト5項目＋視覚回帰 |

**改稿フロー**（既存コラムの更新）: ②→④のみ（データファイル差分だけでPRが完結）。

## 6. 鮮度運用

- `lastReviewed` / `retrievedAt` を全コラム・全出典に必須化。
- **年次レビュー**: 毎年、`lastReviewed` が12ヶ月超のコラムを一覧化（スクリプトで機械抽出可能）→ ①②④の短縮フローで更新。
- リンク切れ検査は e2e とは別の定期ジョブ（HTTPステータス確認のみ）で軽量に。
- 学習クエスト researcher モードに新研究を追加したら、関連コラムの `sources` へも反映する一方向ルールを運用に組み込む。

## 7. 既存コラムの移行マップ

| フェーズ | 対象 | 作業 |
|---|---|---|
| D-a（パイロット） | FresnelDeepDive / 反射板・RIS（Antennaのcolumn）/ マイクロストリップ（同） | 型・レンダラー実装＋3本を新形式で書き下ろし。**ここで§3基準を校正** |

**D-a の Definition of Done**（これを満たすまでD-bへ進まない）:
1. `types.ts`・`ToolColumnCard`・`columns/index.ts` が実装され、4ゲート緑。
2. パイロット3本が §3 の素人テスト・玄人テスト各5項目を全て通過（レビュー記録を `docs/handoff/column-pilot-review.md` に残す）。
3. 3本のうち最低1本が `liveKey` を実際に使用（ライブコラムの動作実証）。
4. quant の全行が lib/rf 関数呼び出しで計算されている（文字列リテラルの数値ゼロ）— レビュー時に `grep -n "compute:" src/data/columns/*.ts` で確認。
5. 既存表示（該当3ツールのe2e）が緑のまま。
| D-b | AntennaToolPanel の残り8ツールの `column: string[]` | 新形式へ移行（10ツールのconfig契約は `columnIds` 参照に変更） |
| D-c | HataColumn / NcuResearchColumn / PropagationMeasurementColumn（既に高品質なTSX） | **無理に全面移行しない**。sources/lastReviewed を共通型に載せ替えるハイブリッドで可（内容が正なら形式は従） |
| 対象外 | 学習クエストの現場コラム | 別体系（QuestSource運用が既に確立）。相互参照リンクのみ |

## 8. テンプレート（新規コラムの出発点）

```ts
// src/data/columns/<id>.ts
import type { ToolColumn } from "./types";

export const <camelId>Column: ToolColumn = {
  id: "<id>",
  title: "コラム：<問いの形が望ましい>",
  hook: "<専門用語ゼロの2〜3文。問い or 逸話>",
  body: [
    "<歴史・背景（誰が・いつ・何に困って）>",
    "<本質（何が効いているのか。用語は初出で1行定義）>",
    "<実務（現場でどう使うか・何に注意するか）>"
  ],
  analogy: { text: "<たとえ>", limits: "<ただし、〜の場合は成り立たない>" },
  quant: { title: "数値で見る", rows: [
    { label: "<検証可能な定量主張>", compute: () => `${calcX(...).toFixed(1)} dB`, note: "<条件>" }
  ]},
  derivation: { title: "なぜこの式か", steps: ["<要点1>", "<要点2>"], sourceIds: ["<source-label>"] },
  antiPatterns: [{ mistake: "<誤解>", consequence: "<数値の帰結>", fix: "<回避策>" }],
  sources: [{ label: "", href: "", kind: "paper", locator: "", retrievedAt: "2026-07" }],
  lastReviewed: "2026-07"
};
```
