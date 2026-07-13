# U-5 実装プロンプト（GPT-5.6 / Codex 向け）: ケーブル付きアンテナ 設置ナビ — UI実装

以下をそのままGPT-5.6への指示として使用する。

---

あなたはこのリポジトリの実装担当（Codex）です。今回のタスクは **U-5: 「ケーブル付きアンテナ 設置ナビ」のUI実装** です。git操作は行わないでください（コミット・pushはSonnet 5が担当します）。

## 0. 最初に読むもの（必須・この順で）

1. `docs/handoff/spec-antenna-install-navi.md` — **仕様の正本（v2.1）**。特に §1 技術条件・§2 画面構成・§3 入力仕様・§4 出力仕様・§7 API契約・§9 プリセット・§11 のU-5行を精読。
2. `public/demo/antenna-install-navi.html` — 実装対象ファイル。**Sonnet 5がスケルトン（セクション枠＋スタブエンジン）を先行配置済み**。このファイルが存在しない場合は作業を開始せず、その旨をユーザーに伝えてください。

## 1. あなたが編集してよい範囲（厳守）

対象ファイルは `public/demo/antenna-install-navi.html` **のみ**。ファイル内は5セクションに分割されており、あなたの担当は：

- **SECTION 1: STYLE** — 全CSS（レイアウト・レスポンシブ・印刷）
- **SECTION 2: MARKUP** — 全HTMLマークアップ
- **SECTION 4: UI-BINDING** — フォーム↔エンジンの結線JS

**絶対に編集してはいけないもの**：
- SECTION 3（DATA+ENGINE）と SECTION 5（SELFTEST）— Sonnet 5の担当
- `<!-- ===== SECTION ... ===== -->` マーカー行と、その前後のバッファ空行
- ファイル全体への整形ツール・フォーマッタ適用、改行コードの変更（diffが全域に及び分担が崩壊します）

## 2. 実装内容（仕様書の要約。詳細・正確な定義は必ず仕様書側を参照）

### 技術制約（§1）
- 単一HTMLファイル・vanilla JS（ES2017）・インラインCSS。フレームワーク／ライブラリ／CDN／外部フォント／fetch・XHR **すべて禁止**。`file://` 直開きで完全動作すること。
- フォント: `system-ui, -apple-system, "Hiragino Sans", "Yu Gothic UI", sans-serif`
- レイアウト: 左=入力フォーム／右=結果パネル（入力のたび即時更新）。ウィザード化しない。900px未満で縦積み、375pxで崩れない。
- `compute()` 呼び出しは try/catch で包み、例外時は結果パネルに「計算エラー（入力を確認してください）」を表示してフォームは操作可能なまま維持（§1 劣化動作）。

### エンジン契約（§7・最重要）
- `window.NAVI_ENGINE = { VERSION, CONFIG, PRESETS, compute(input) }` が SECTION 3 に定義済み。
- **UIは `compute(input)` の戻り値（Result）だけを描画する。** SECTION 3 内の CONFIG・データ定数を直接参照しない。
- dBバジェット表の各行は **`valueText` のみを表示**（`valueDb`/`rangeDb` はテスト専用。UIで整形に使わない）。
- `budget.highlight` は表の行ではなく、**表の直下の独立コールアウトブロック**として描画（非nullのとき。印刷でも同位置）。
- `warnings`・`budget.rows`・`checklist` は**エンジンが返した順序のまま**描画（並べ替え禁止）。
- 現場名テキスト入力と印刷日付は **UIローカル状態**（Resultに含まれない唯一の例外）。印刷時にDOMへ直接反映。
- `#selftest-badge` 要素は SECTION 5 が生成します。あなたは SECTION 1 に `@media print { #selftest-badge { display: none !important; } }` **のみ**書き、マークアップには置かない。

### フォーム（§3）
7項目（方式・環境・設置面・距離・バンド・MIMO間隔・現場名）。選択肢value・既定値・フォーム脇の注記文言は §3 の表とおり。連動ルール：
- 方式変更→バンド既定値自動セット（手動変更後は上書きしない。**例外**: 5g→他方式でb3500選択中は既定へ強制リセット＋一時通知）
- `b3500` は 5g 時のみ有効（他はdisabled）。`unknown` は常に選択可。
- MIMO間隔の質問は `mimo` 選択時のみ表示。方式が mimo でなくなったら値を null に戻す。
- プリセットボタン3つ（§9: P1 屋外遠隔監視BOX／P2 屋外ポール型・長距離延長／P3 屋内ルーター）。`NAVI_ENGINE.PRESETS` からinputを取得しフォームへ反映→再計算。適用時は手動変更フラグをリセット。

### 結果パネル（§4）
A. 推奨構成カード（category／freqRange／cableLengths＋cableAdvice／mounting（先頭を第一候補として強調）／extension（label・model・**quantity本数**）／remarks）
B. dBバジェット表（rows→valueText・cls記号●◐○・note）＋highlightコールアウト＋totalText＋footer
C. 警告リスト（severity: must=目立つ色/recommend=通常。textをそのまま）
D. ［設置指示書を印刷］ボタン → `window.print()`

### 印刷（§4D・A4縦1枚）
`@media print` でフォーム・画面UIを隠し、指示書のみ印字：
1. ヘッダ記入欄（現場名=フォーム値転記（空なら罫線）・日付・施工者・装置番号・回線番号）
2. 推奨構成要約（§4A末尾の5項目固定）
3. dBバジェット表コンパクト版
4. 準備物ブロック（`Result`のchecklist/warningsではなく仕様§4D-4の条件付き列挙。エンジンResultに専用フィールドがない項目はwarnings/product.extensionから組み立ててよいが、文言はResult内の文字列を再利用する）
5. チェックリスト（`Result.checklist` をチェックボックス付きで）
6. 電測記録欄（`Result.print.measurementFields` の項目×設置前後2列＋測定日時・測定手段欄＋目安文）
7. フッタ免責（`Result.meta.disclaimer`＋`legend`）
- 入力条件ブロックとして `Result.meta.inputEcho`（label/value配列）も印字。
- 情報量が多いためコンパクトな2カラム構成推奨。1枚に収まることを印刷プレビューで確認。

### スタブで開発する（§11）
現在の SECTION 3 はスタブエンジン（`VERSION: "stub-..."`）で、入力に応じて5種のフィクスチャ（highlight有無・extension有無と数量・rangeDb行・範囲外行・警告0件）を返します。**全nullable分岐をスタブで表示確認してください**：
- `environment=cabinet` → highlightコールアウトが出る
- `surface=metal_direct`（cabinet以外） → extension.quantity=2 の表示
- `surface=metal_spacer` → レンジ表示行
- `5g`＋`b3500`＋`metal_direct` → 範囲外表示行
- 既定（P3相当） → 警告0件・「損失なし（0dB）」・カードのみ

## 3. デザイン方針

産業用途の実務ツール。装飾より情報密度と可読性を優先し、本リポジトリのツール群（青系アクセント・カード型・角丸控えめ）とトーンを揃える。must警告は赤系・recommend警告は黄系。出典クラス記号（●◐○）は凡例をフッタに常時表示。

## 4. 完了条件（自己チェックしてから完了報告）

- [ ] `file://` で開いて全機能動作（DevTools NetworkタブでリクエストO件）
- [ ] 3つのプリセットボタンで結果パネルが§9の見せ場どおり切り替わる
- [ ] スタブの5フィクスチャすべての描画パスを目視確認
- [ ] 方式切替でバンド既定値連動・b3500 disabled切替・MIMO間隔の表示/非表示が動く
- [ ] 375px幅で横スクロールなし
- [ ] 印刷プレビューがA4縦1枚（Chrome）
- [ ] SECTION 3/5・マーカー行・バッファ行のdiffが**ゼロ**（これが1行でも変わっていたら差し戻しになります）
- [ ] エンジン例外時（DevToolsで `NAVI_ENGINE.compute = () => { throw new Error("x") }` に差し替えて確認）にフォームが生きている

完了したら、変更ファイルと確認結果（上記チェックリストの結果）を報告してください。コミットはSonnet 5が行います。
