# Antigravity 発注 — H1全チャート/H3優先3図/AntennaToolPanel移行の視覚検証（第3バッチ・feature済）

feature に大きめの視覚変更が入った（コミット `070076a`/`7d286bd`/`4238b45`）。機能ゲート全緑
（tsc0/vitest312/lint/build/e2e35）。**`-linux` 視覚回帰の確認と再ベースラインを依頼**。
手順は `docs/handoff/visual-regression-runbook.md` 準拠。

## 変更内容（意図した差分）

### 1. H1: チャートテーマv2 — **recharts全6ファイル適用完了**
対象ページ: propagation-loss（比較チャート）／2波干渉ラボ／coaxial-cable-loss／旗艦（距離電力・研究距離シート）／アンテナ系ツールのMiniChart。
- 縦グリッド線が消える（横線のみ・全チャート統一）
- 目盛り 12→11px・tabular-nums 化
- ツールチップが白面・角丸8px・影付き・カーソル線付きの統一スタイル
- **意味色（ブランド青・オレンジ完全版・感度参照線・警告色・デュアル軸のAA濃色）は全て維持**

### 2. UX-2: AntennaToolPanel（**アンテナ系10ツール全部に波及**）
- 全入力が Field 化: **help常時表示が消え HelpHint(?)アイコンのみに**（D3解消・確定パターン）
- 結果カードが Stat箱 → MetricCard: **判定色（emerald/amber/rose）は面色として維持**、非判定の旧staf色は neutral 化
- 入力role が spinbutton→textbox

### 3. H3: 図版言語 — 優先3図
- **NCU断面図★**: ローカルdefs→共通素材グラデ（金属/コンクリ/樹脂の蓋・躯体、土、空、水、切り口ハッチ）＋softShadow。**材質選択で蓋・躯体の質感が変わる**のが見どころ
- フレネル断面: 空グラデ＋地面ハッチ
- 定在波図: 線幅・ラベルのdiagramTheme統一

## 検証手順
1. CI(Linux)で `TEST_VISUAL=true npm run test:visual`。差分は**広範囲**（チャートを持つ全ページ＋アンテナ10ツール＋NCU/フレネル/VSWR）に出るのが正常。
2. 各差分が上記1〜3の意図した変更かを目視判定（before/after添付）。
3. **特に見てほしい**: (a) NCU断面図の素材質感が「安っぽく」なっていないか（グラデ過多・影過多）、(b) アンテナ系のhelp消滅で初心者が迷わないか、(c) チャートツールチップの新スタイルが読みやすいか。
4. 問題なければ一括で `-linux` 基準線を再生成しコミットバック。懸念があれば src を直さず具体箇所を報告（Claudeが調整）。

## 既知の残り（次バッチ予定）
- H3 残り11図（滝グラフ3種はH4で別途）／H5 ナミヒートマップ（viridis）／H4 滝グラフv2／PropagationExplorer入力（ローカルField名衝突のため設計判断待ち）
