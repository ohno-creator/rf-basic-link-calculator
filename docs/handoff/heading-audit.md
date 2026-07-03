# 重複見出し及び階層構造監査レポート (Heading Audit Report)

**監査日時**: 2026-07-03T22:41:33.882Z
**対象ビュー**: 全25ページ (Home + 24ツール)

本レポートは、全ツールにおけるアクセシビリティ（見出し階層）およびコンテンツの重複を自動スキャンした結果です。改修時の不要な見出しの削除やマークアップ修正の指示書として使用します。

## 1. 総合要約
- **見出し重複が検出されたページ**: 14 / 25 ページ
- **階層飛び等の問題が検出されたページ**: 3 / 25 ページ

## 2. 監査詳細マトリクス

| ページ (slug) | パス | 見出し重複・類似 | 階層飛び・構造違反 | 推奨アクション・申し送り |
|---|---|---|---|---|
| `home` | `/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `rf-basic-link-calculator` | `/tools/rf-basic-link-calculator/` | - <h3> と <h4> で文言が重複しています: "3. 滝グラフを見る"<br>- <h3> と <h3> で文言が重複しています: "アンテナ選定・実機評価でお困りの場合" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `simple-link-budget` | `/tools/simple-link-budget/` | - <h1> と <h2> で文言が重複しています: "かんたんリンク計算" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `free-space-loss` | `/tools/free-space-loss/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `fresnel-zone` | `/tools/fresnel-zone/` | 🟢 なし | - 階層飛びが検出されました: <h1> "フレネルゾーン半径" から直接 <h3> "フレネルゾーン半径と障害物チェック" へ遷移しています | 見出しレベル（H1〜H4）をスキップせずに順番にネストするよう HTML マークアップを修正する。 |
| `propagation-loss` | `/tools/propagation-loss/` | - <h1> と <h3> で文言が重複しています: "伝搬損失モデル比較" | - 階層飛びが検出されました: <h1> "伝搬損失モデル比較" から直接 <h3> "伝搬損失モデル比較" へ遷移しています | 重複している H2 見出しを削除、または小見出しとして再構成する。<br>見出しレベル（H1〜H4）をスキップせずに順番にネストするよう HTML マークアップを修正する。 |
| `ncu-below-ground` | `/tools/ncu-below-ground/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `nami-gate-window` | `/tools/nami-gate-window/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `rf-learning-quest` | `/tools/rf-learning-quest/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `frequency-wavelength` | `/tools/frequency-wavelength/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `dbm-converter` | `/tools/dbm-converter/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `db-feel` | `/tools/db-feel/` | - <h1> と <h2> で文言が重複しています: "dBを体感する" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `vswr-return-loss` | `/tools/vswr-return-loss/` | - <h1> と <h3> で文言が重複しています: "VSWR・リターンロス変換" | - 階層飛びが検出されました: <h1> "VSWR・リターンロス変換" から直接 <h3> "VSWR・リターンロス変換" へ遷移しています | 重複している H2 見出しを削除、または小見出しとして再構成する。<br>見出しレベル（H1〜H4）をスキップせずに順番にネストするよう HTML マークアップを修正する。 |
| `coaxial-cable-loss` | `/tools/coaxial-cable-loss/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `microstrip-line` | `/tools/microstrip-line/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `effective-aperture` | `/tools/effective-aperture/` | - <h1> と <h2> で文言が重複しています: "有効開口面積・受信面積" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `aperture-gain-beamwidth` | `/tools/aperture-gain-beamwidth/` | - <h1> と <h2> で文言が重複しています: "開口アンテナ利得・ビーム幅" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `antenna-spacing` | `/tools/antenna-spacing/` | - <h1> と <h2> で文言が重複しています: "アンテナ間隔 λ換算" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `array-grating-lobe` | `/tools/array-grating-lobe/` | 🟢 なし | 🟢 なし | 現状維持で問題ありません。 |
| `patch-antenna-dimensions` | `/tools/patch-antenna-dimensions/` | - <h1> と <h2> で文言が重複しています: "矩形パッチアンテナ寸法" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `small-loop-resonance` | `/tools/small-loop-resonance/` | - <h1> と <h2> で文言が重複しています: "小型ループアンテナ共振" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `radiation-resistance` | `/tools/radiation-resistance/` | - <h1> と <h2> で文言が重複しています: "短縮アンテナ放射抵抗・効率" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `small-antenna-limit` | `/tools/small-antenna-limit/` | - <h1> と <h2> で文言が重複しています: "小型アンテナ限界（ka・Q・帯域）" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `large-array-near-field` | `/tools/large-array-near-field/` | - <h1> と <h2> で文言が重複しています: "大型アレイ近傍界・遠方界判定" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
| `reflector-ris-size-effect` | `/tools/reflector-ris-size-effect/` | - <h1> と <h2> で文言が重複しています: "反射板・RISサイズ効果" | 🟢 なし | 重複している H2 見出しを削除、または小見出しとして再構成する。 |
