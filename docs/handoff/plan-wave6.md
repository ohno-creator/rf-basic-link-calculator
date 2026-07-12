# 第6波 実行プラン（2026-07-12 改訂v9・3者分担の正本）

**担当体制**: Claude Sonnet 5（設計・レビュー・統括／Antigravity休止中の代行検証）／GPT-5.6=Codex（実装量産）／Antigravity（**リミット到達につき休止中・復帰待ち**）

**Claude Sonnet 5の代行範囲（v5から不変）**: WebSearch/WebFetchによる一次情報裏取り・lib計算の独立検算・コードレベルの整合性チェックは代行可能。**ブラウザ実機操作・視覚官能評価は代行不可**——Antigravity復帰まで滞留。e2e/視覚回帰の自動実行（pass/fail・pixel-diff）は代行できるが、diffが「意図した変更か」の最終目視承認はAntigravity依存のまま。

## 1. 現況（v9時点の確定事実）
- main = e6f7cb1d（56ツール・CI緑・Pages配信済み）／feature = 1eef8a42（main+ドキュメントのみ・コード差分なし）
- **作業ツリー（track/term-lab・全て未コミット）は5本柱すべてが実装完了域に到達**: term-lab（21語）／OTAエキスパート／G-0放射効率変換／G-0bパッチ半値角／G-6エリアカバレッジ。**全体の技術ゲートはすでに緑**——Claudeが直接確認: `npx vitest run`＝**661 tests passed (72 files)**／`npx tsc --noEmit`＝エラーなし／`npx eslint`（新規ファイル対象）＝エラーなし／`GITHUB_PAGES=true npx next build`＝**62ページ静的書き出し成功**
- **G-6（areaCoverageFraction等）は発注書と完全一致・追加指摘なし**。**G-3fix（noiseFloor文字化け）も適用確認済み**
- **term-lab / OTAエキスパート: レビュー完了（O-1/O-1b）——18件の指摘**（P1×5・P2×6・P3×7）。詳細 `review-o1-term-lab-ota-expert.md`。代表例: TermDielectricConstant（εr=1.0でlibエラー握りつぶし）／TermAntennaGain（保存則の表示と図形が+20%不一致）／TermEffectiveAperture（`/tools/fspl`404）／TermVSWR（定在波アニメが一様振幅に潰れる）／otaImportParser（ヘッダー誤判定で無言データ欠落）
- **G-0/G-0b: レビュー完了——10件の指摘**（P1×1・P2×6・P3×2）。詳細 `review-g0-g0b-efficiency-patch-hpbw.md`。代表例: PatchHpbwPanel（設置ずれ角がHPBW変更時に非クランプで非物理値を無警告表示）／RadiationEfficiencyPanel（関連リンク欠落・範囲外表示未実装・aria-pressed欠落）／tools.tsのicon"compass"がiconMap未登録
- ⚠️**消失リスク継続**: `docs/handoff/antigravity-ota-expert-verification.md`（Antigravity検算済み報告）が依然**未コミット**。**次のコミットに必ず同梱すること**
- ✅クローズ済み: A-1／A-3検算／rebaseline7手順確認／NoiseFloorColumnレビュー／E2第2段の設計
- **v7で追加（ユーザー発注）**: **周波数の用途地図（非セルラー編）**——発注書 `prompt-codex-spectrum-atlas.md`。未着手（G-7）

## 2. 分担表（優先度順）

### Claude Sonnet 5（レビュー・統括レーン＋Antigravity代行）
| # | タスク | 状態 |
|---|---|---|
| O-1 | term-lab物理正確性レビュー（21語） | ✅**完了**（review-o1-term-lab-ota-expert.md） |
| O-1b | OTAエキスパートlibレビュー | ✅**完了**（同上） |
| **O-1c** | **【新規】G-0/G-0bレビュー** | ✅**完了**（review-g0-g0b-efficiency-patch-hpbw.md） |
| O-2 | コラム移行レビューゲート（column-guide §3・1本1コミットごと） | G-3開始待ち |
| O-3 | **リリース統括**: 全指摘のP1修正反映後の feature→main PR・CI緑確認・視覚ループ指揮（rebaseline8） | Codexのpush待ち（技術ゲートは既に緑・残るはP1×6件の修正のみ） |
| O-5 | F1改/F3の検収 | G-4待ち |
| O-6 | Antigravity代行検証（Web調査・出典裏取り・検算・技術ゲート実行に限定） | 継続（今回: vitest/tsc/eslint/build全実行で確認） |
| O-7 | 周波数用途地図のデータ裏取り | G-7納品待ち |
| 済 | O-4: E2第2段設計（fb825914）✅ | — |

### GPT-5.6 / Codex（実装レーン・直列推奨——実装は5本柱とも完成域、残るはP1修正の反映＋コミット確定）
| # | タスク | 参照 |
|---|---|---|
| G-1 | **term-lab仕上げ（最優先）**: **①P1×3語（誘電率/利得/実効面積/VSWR）を修正** ②tools.ts登録の完了 ③未コミット15語＋e2eのコミット確定 ④`antigravity-ota-expert-verification.md`を同梱 ⑤push→視覚ループ→main | prompt-codex-term-lab.md ＋ review-o1-term-lab-ota-expert.md |
| G-2 | **OTAエキスパート仕上げ**: **①otaImportParser.tsのP1バグ修正** ②異常系テスト追加 ③コミット確定 | prompt-codex-ota-expert.md ＋ review-o1-term-lab-ota-expert.md |
| **G-0** | **効率変換仕上げ**: **①関連リンク配線（radiation-resistance/detuning-estimator）②範囲外表示 ③aria-pressed追加**（P3の3段構成・閾値表記は任意） | prompt-codex-efficiency-converter.md ＋ review-g0-g0b-efficiency-patch-hpbw.md |
| **G-0b** | **半値角アプリ仕上げ**: **①offset非クランプのP1修正（最優先）②icon"compass"をiconMapへ登録 or 既存iconへ変更 ③関連リンク2件追加 ④e2eアサーション強化**（P3の色分け解釈は要相談） | prompt-codex-patch-hpbw.md ＋ review-g0-g0b-efficiency-patch-hpbw.md |
| G-3 | コラム構造化移行の量産（残り約29本） | 手本: fresnelDeepDive.ts |
| G-4 | F1改＋F3 | f1-manifest-spike-verdict.md |
| 済 | G-6: E2第2段実装（areaCoverageFraction）✅**指摘なし・そのままcommit可** | prompt-codex-e2-area-coverage.md |
| G-7 | 周波数の用途地図（非セルラー編） | prompt-codex-spectrum-atlas.md |
| 済 | G-5 / G-3fix ✅ | — |
| 規約 | 専用worktree・パス指定add・`Tests N passed`行確認・build前にdev停止・視覚変更はrebaselineループ | roadmap §11 |

### Antigravity（休止中——復帰後の実機・目視タスクのみ残置）
| # | タスク | 前提 |
|---|---|---|
| A-2 | term-lab実機受入 | G-1確定後（P1修正込み） |
| A-3実機 | OTAエキスパート実機受入 | G-2確定後（P1修正込み） |
| A-2b | 効率変換の受入 | G-0確定後（P1〜P2修正込み） |
| A-2c | 半値角アプリの受入 | G-0b確定後（P1修正込み・最優先） |
| A-5 | rebaseline7＋今後のrebaseline8等の視覚差分の目視承認 | 復帰後即 |
| A-4 | コラム出典リンク鮮度チェック | G-3進行中 |
| A-6 | E2第2段の実機受入（数値検証済み・体感評価のみ） | G-6後 |
| A-7 | 周波数用途地図の実機受入＋残数裏取り | G-7＋O-7後 |
| 済 | ~~A-1~~／~~A-3検算~~ ✅ | — |

## 3. リリース順序（推奨・v9改訂）
**技術ゲートは既に全緑（vitest/tsc/lint/build確認済み）——残るボトルネックはP1修正の反映のみ**。
**① G-0b半値角のP1修正**（offset非クランプ・最優先。他より軽微で1コミットで閉じられる）→ **② term-lab（G-1）P1×3語修正**→ **③ OTAエキスパート（G-2）P1修正**→ **④ 効率変換（G-0）P2修正**→ 以上4本まとめてpush→視覚ループ→main → ⑤ 周波数用途地図（G-7→O-7）→ ⑥ コラム移行10本単位（G-3）→ ⑦ F1改/F3（G-4→O-5）。
Antigravity依存タスクは復帰まで滞留——技術ゲート緑でのマージは可・「実機官能評価済み」ラベルは復帰後付与。

## 4. 掃除メモ
残骸ブランチ: `rebaseline3`/`rebaseline7`/`r5-diagram-hex`/`ux1v-visual-loop` は役目済みなら削除可（スパイク2本 `h6-3d-spike`/`f1-manifest-spike` は判定記録として保持）。
