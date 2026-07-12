# O-1レビューメモ（第6波・Codex納品分）

**レビュー担当**: Claude Sonnet 5／**日付**: 2026-07-12

## 1. NoiseFloorColumn構造化移行（commit `e6f7cb1d` [C-4]）— ✅条件付き合格

`src/data/columns/noiseFloor.ts` + `ToolColumnCard` 経由での移行を確認。

**良い点**（column-guide.md §3チェックリスト準拠）:
- `quant.rows` の2値（ノイズフロア・受信感度）は `compute()` が `calculateNoiseFloorDbm`/`calculateSensitivityDbm`（`src/lib/rf/noiseFloor.ts`）を呼ぶ形で、手書き数値ゼロ。`liveKey`連動（`noiseFloor`/`sensitivity`）もパネル側の`live`props渡しと整合
- 計算値を再検算: `calculateNoiseFloorDbm(125000, 6)` = -174+10log10(125000)+6 ≈ **-117.03dBm**、`calculateSensitivityDbm(125000, 6, -20)` ≈ **-137.03dBm**（LoRa SF12実測感度と整合する妥当な値）
- `sources` 3件とも `kind`/`locator`/`retrievedAt` 完備（Jansky 1933・Penzias&Wilson 1965・Friis 1944の各Proc.IRE/ApJ）
- `derivation`のkTB導出（-174dBm/Hzの根拠）は数値・単位とも正確
- `analogy`の「たとえの破れ」も明記あり（水面下は完全に読めないわけではない、と誤解を予防）

**要修正（P2・軽微・Codexへ差し戻し）**:
- `src/data/columns/noiseFloor.ts:12` の `hook` 文字列に文字化けを検出:
  > 「しかもそれは23時間56分周期——**地球 of 自転**に対する星の周期で強弱を繰り返していました。」
  移行前の `NoiseFloorColumn.tsx`（削除済み旧ファイル）では「地球**の**自転」が正しい表記だった。TSX→データファイル移行時に英単語「of」が誤って混入したテキスト破損（自動処理か手動編集時の事故と推測）。ユーザー閲覧時に不自然な日本語として露出するため、次のコラム移行コミットと合わせて1行修正を依頼。

## 2. rebaseline7（Band地図v3の視覚基準線）— ✅手順確認

`1c63261c`（トグルON）→`09d72765`（スナップショット更新）→`25768b21`（トグルrevert）の3コミットで、`prompt-wave5-codex-antigravity.md` C-2のランブック通りに実施されていることを確認。ワークフロー設定ファイルの差分は最終的に空（revert済み）。**Antigravity A-5（視覚差分承認）待ち**（Claude側の手順チェックは完了）。

## 3. term-lab（アンテナ用語ラボ21語）— ⏳未着手（実装進行中のため対象外）

現時点で `track/term-lab` に確定コミット6件（Term1〜6: 周波数波長・誘電率・偏波・近傍界遠方界・相反性・利得）＋作業ツリーに追加7語相当の未コミット差分（VSWR・リターンロスS11・インピーダンス整合・共振・帯域幅・ケーブル損失・実効面積・効率と利得の違い・放射効率・放射パターン等）を確認。**Codexが同一ツリーで作業中のため本レビューでは手を触れず、21語全て確定・push後に物理正確性の通しレビューを行う**（特に誘電率・偏波・近傍界・実効面積の簡略化と開示のバランスを重点確認予定）。

## 4. OTAエキスパートモード関連lib（`harmonicHunter.ts`/`otaExpert.ts`/`otaImportParser.ts`）— ⏳未着手

作業ツリーに未コミットで存在を確認したのみ（読み取りはしていない）。`antigravity-ota-expert-verification.md` も未コミットで存在——Antigravityの検算報告が既に用意されている可能性があるが、Codex側のコミット確定後に内容を確認する。
