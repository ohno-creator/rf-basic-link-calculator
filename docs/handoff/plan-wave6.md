# 第6波 実行プラン（2026-07-12 改訂v6・3者分担の正本）

**担当体制**: Claude Fable 5（設計・レビュー・統括／Antigravity休止中の代行検証）／GPT-5.6=Codex（実装量産）／Antigravity（**リミット到達につき休止中・復帰待ち**）

**Claude Fable 5の代行範囲（v5から不変）**: WebSearch/WebFetchによる一次情報裏取り・lib計算の独立検算・コードレベルの整合性チェックは代行可能。**ブラウザ実機操作・視覚官能評価は代行不可**——Antigravity復帰まで滞留。e2e/視覚回帰の自動実行（pass/fail・pixel-diff）は代行できるが、diffが「意図した変更か」の最終目視承認はAntigravity依存のまま。

## 1. 現況（v6時点の確定事実）
- main = e6f7cb1d（56ツール・CI緑・Pages配信済み）／feature = d38e7225（main+ドキュメント7コミットのみ・コード差分なし）
- **term-lab が最終結線段階まで前進**（v5からの主変化）: 21語すべての実装ファイルが作業ツリーに存在し、`terms/index.ts` に**21語全登録済み**・`e2e/tools.spec.ts` に+39行のテスト追記済み。残る未了は ①`src/data/tools.ts` へのツール登録（未実施を確認） ②コミット確定→push ③視覚ベースライン。コミット済みは9件（シェル＋用語6語分）
- **OTAエキスパートのlib層が作業ツリーに完備**: `harmonicHunter.ts`/`otaExpert.ts`/`otaImportParser.ts`＋テスト3本。UI（パネル拡張）は未着手の模様。**未コミット**
- ⚠️**消失リスク継続**: `docs/handoff/antigravity-ota-expert-verification.md`（Antigravity検算済み報告）が依然**未コミット**。`git clean`で消える。**G-1かG-2の直近コミットに必ず同梱すること**
- ✅クローズ済み: A-1（Band v3裏取り→`80274e4b`で反映済み・unverified残0件）／A-3検算（干渉源ハンター5点・Claude独立再計算で全一致）／rebaseline7手順確認／NoiseFloorColumnレビュー（文字化け1件→G-3fix）／E2第2段の設計・発注書（`prompt-codex-e2-area-coverage.md`・数値積分検証済み）
- 未着手: G-0（放射効率変換）・G-0b（パッチ半値角）・G-3量産・G-4・G-6 — ブランチ・ファイルとも無し

## 2. 分担表（優先度順）

### Claude Fable 5（レビュー・統括レーン＋Antigravity代行）
| # | タスク | 状態 |
|---|---|---|
| O-1 | **term-lab物理正確性レビュー**（21語。重点: 誘電率・偏波・近傍界・実効面積の簡略化と開示のバランス）——Codexのコミット確定が引き金 | 待機中（最優先で実施予定） |
| O-1b | **OTAエキスパートlibレビュー**（harmonicHunter等3本＋テスト）——同上 | 待機中 |
| O-2 | コラム移行レビューゲート（column-guide §3・1本1コミットごと） | G-3開始待ち |
| O-3 | **リリース統括**: term-lab確定後の feature→main PR・CI緑確認・視覚ループ指揮（rebaseline8） | 次のアクション（term-lab push後） |
| O-5 | F1改/F3の検収 | G-4待ち |
| O-6 | Antigravity代行検証（Web調査・出典裏取り・検算に限定） | 継続（A-1/A-3検算はクローズ済み） |
| 済 | O-4: E2第2段設計（fb825914）✅ | — |

### GPT-5.6 / Codex（実装レーン・直列推奨）
| # | タスク | 参照 |
|---|---|---|
| G-1 | **term-lab仕上げ（最優先）**: 残りは ①tools.tsへの登録（learning・rf-learning-quest隣・icon "book"） ②未コミット15語＋e2e＋シェル修正のコミット確定（1語=1コミット原則は維持） ③**作業ツリーの `antigravity-ota-expert-verification.md` を必ずどこかのコミットに同梱（消失防止）** ④全ゲート緑→push→視覚ループ→main | prompt-codex-term-lab.md |
| G-2 | **OTAエキスパートモード続行**: lib3本は完成済みの様子→残りはUI（パネルのエキスパートトグル4機能）＋e2e2本 | prompt-codex-ota-expert.md |
| G-0 | 放射効率dB⇔%変換ツール | prompt-codex-efficiency-converter.md |
| G-0b | パッチアンテナ半値角アプリ | prompt-codex-patch-hpbw.md |
| G-3 | コラム構造化移行の量産（残り約29本・quant=compute()同時付与） | 手本: fresnelDeepDive.ts |
| G-3fix | `noiseFloor.ts` hook「地球 of 自転」→「地球の自転」（G-3初回コミットに同梱可） | review-o1-wave6-codex-deliverables.md §1 |
| G-4 | F1改＋F3（scaffold script＋e2eスモーク自動生成） | f1-manifest-spike-verdict.md |
| G-6 | E2第2段実装（areaCoverageFraction＋shadowing-marginエキスパートモード） | prompt-codex-e2-area-coverage.md |
| 済 | G-5: Band v3データ反映（80274e4b）✅ | — |
| 規約 | 専用worktree・パス指定add・`Tests N passed`行確認・build前にdev停止・視覚変更はrebaselineループ | roadmap §11 |

### Antigravity（休止中——復帰後の実機・目視タスクのみ残置）
| # | タスク | 前提 |
|---|---|---|
| A-2 | term-lab実機受入（21語官能評価・375px・reduced-motion・進捗保存） | G-1確定後 |
| A-3実機 | OTAエキスパート実機受入（検算5点は済・実機とインポート異常系のみ） | G-2確定後 |
| A-2b / A-2c | 効率変換／半値角アプリの受入 | G-0 / G-0b後 |
| A-5 | rebaseline7＋今後のrebaseline8等の視覚差分の目視承認 | 復帰後即 |
| A-4 | コラム出典リンク鮮度チェック（移行10本ごと） | G-3進行中 |
| A-6 | E2第2段の実機受入（数値7点はClaude検証済み・同心円図の体感評価のみ） | G-6後 |
| 済 | ~~A-1~~ Band v3裏取り✅／~~A-3検算~~ 5点照合✅（いずれもクローズ） | — |

## 3. リリース順序（推奨・v6改訂）
**① term-lab（G-1）を最優先で確定**（実装済み資産を早くmainへ・消失リスクの報告書も同梱）→ ② OTAエキスパート（G-2・lib完成済みでUIのみ）→ ③ 効率変換（G-0）・半値角（G-0b）→ ④ コラム移行10本単位（G-3+G-3fix）→ ⑤ F1改/F3（G-4→O-5）→ ⑥ E2第2段（G-6）。
v5までは「G-0/G-0b先行」だったが、**term-lab/OTAの仕掛かり資産が大きいため完成優先に変更**（仕掛かりを閉じてから新規着手）。
Antigravity依存タスクは復帰まで滞留——技術ゲート緑でのマージは可・「実機官能評価済み」ラベルは復帰後付与（v5運用を継続）。

## 4. 掃除メモ
残骸ブランチ: `rebaseline3`/`rebaseline7`/`r5-diagram-hex`/`ux1v-visual-loop` は役目済みなら削除可（スパイク2本 `h6-3d-spike`/`f1-manifest-spike` は判定記録として保持）。
