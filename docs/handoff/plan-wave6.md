# 第6波→第7波 移行プラン（2026-07-12 改訂v12・能力別3者分担の正本）

**担当体制と能力プロファイル**:
| 担当 | 得意領域（本プランの割当根拠） | 制約 |
|---|---|---|
| **Claude Sonnet 5** | 設計・技術レビュー・物理検算・Web一次情報裏取り・**git操作の実行**・リリース統括・文章草稿 | サブエージェント/Workflowは月次上限中→単独実行。ブラウザ実機操作・視覚官能評価は不可 |
| **GPT-5.6（Codex）** | 実装量産（lib/UI/データ結線）・定型移行の反復作業 | **git add/commit/push/ブランチ切替を行わない**（コミットはSonnet 5が代行）。Playwright実行不可（環境制約）。本文・出典の創作は工程違反 |
| **Antigravity** | ブラウザ実機受入・視覚差分の目視承認・モバイル/reduced-motion官能評価・文献リンク実在確認 | lib計算ロジックの変更は禁止（レビュー体制外） |

## 1. 現況（v12時点の確定事実）
- **main = 9a75b9a4**: 第6波5案件（term-lab21語/OTAエキスパート/効率変換/半値角/エリアカバレッジ）＋P1修正6件＋rebaseline8まで着地・配信済み
- **feature = 0e59eff4**: main＋G-4基盤（scaffold/e2eスモーク生成）＋G-7（周波数用途地図・tools.ts登録済み）＋FSPLコラム移行（G-3第1弾1本目）。**CIフルゲート緑（e2e含む14m30s成功）を確認済み**
- レビュー正本: `review-o1-term-lab-ota-expert.md`（P1は全修正済み）／`review-g4-g7.md`（G-7のP1修正済み・P2×4残）
- G-3進捗: 構造化済み5本（fresnel/noiseFloor/areaCoverage/spectrumAtlas/fspl）・**旧TSXコラム残り約46本**
- 教訓の運用化: git操作前の`git status -sb`確認／新ブランチ初回コミット後の`git diff --diff-filter=D`確認（P0誤削除事故の再発防止）

## 2. 分担表（能力別・優先度順）

### Claude Sonnet 5（統括・レビュー・git実行レーン）
| # | タスク | 優先度 | 完了条件 |
|---|---|---|---|
| S-1 | **リリース統括**: feature→main PR作成・CI緑確認・マージ（G-4/G-7/FSPL分）。視覚差分が出る場合はrebaseline9ループ指揮 | **最優先** | main反映・Pages配信 |
| S-2 | **C-5継続: G-3文献パック草稿執筆**（残り9本: hata→vswr→dbm-converter→db-family→coax-cable-loss→desense→eirp-compliance→lora-airtime→ground-plane-size の順）。各草稿=ToolColumnデータ完成形＋出典locator＋quant用lib関数指定。**1〜2本/ターンで直接執筆**し、都度featureへpush→Codexの実装材料にする | 高 | 9本分の`src/data/columns/*.ts`草稿 |
| S-3 | **C-6: G-7ステータス既定値の反転**（`e()`の既定を`unverified-current`へ・裏取り済みのみ明示confirm）——小修正のため直接実施 | 高 | 修正コミット＋テスト緑 |
| S-4 | **O-7: spectrum-atlasデータのWeb裏取り**（日本20件全数＋非日本の要注意帯。ITS-G5の5875-5925表記の精査を含む）→結果をCodexのX-2実装材料に | 中 | 裏取りメモ→データ反映依頼 |
| S-5 | **G-3移行のレビューゲート**（Codex実装分を1本ずつ検収→まとめてコミット・10本単位でmain） | 継続 | column-guide §3チェックリスト |
| S-6 | Codex納品のコミット代行（パス指定add・`Tests N passed`行確認・push） | 継続 | — |

### GPT-5.6 / Codex（実装量産レーン・git操作なし）
| # | タスク | 優先度 | 参照 |
|---|---|---|---|
| X-5 | **G-4仕上げ**: ①`--check`の候補0件を正常終了へ修正 ②`ToolEntry.panel?`フィールド追加＋試験3本（vswr-bandwidth-q/electrical-length/pointing-margin）へpanel指定→scaffold --checkがCIで機能する状態に | **高** | review-g4-g7.md／prompt-codex-f1kai-f3.md |
| X-7 | **G-3移行実装の量産**: S-2の草稿が届いた本から順に、データファイル配置→パネル結線（liveKey対応）→旧TSX削除。**1本=1案件として作業ツリーに置き、Sonnet 5がコミット** | 高 | 手本: fspl.ts移行コミット(0e59eff4) |
| X-6 | G-7コラム9本へのカテゴリ別出典追加（S-4の裏取り結果を使用・創作禁止） | 中 | review-g4-g7.md |
| X-8 | （次期・着手可）E1品質の未達ツール改修や新規小粒ツール——ユーザー発注があれば優先度繰上げ | 低 | — |

### Antigravity（実機受入・視覚承認レーン——mainに未受入資産が7件溜まっており最大のボトルネック）
| # | タスク | 優先度 | 報告先 |
|---|---|---|---|
| A-5 | **rebaseline8の視覚差分の目視承認**（5案件一括分・main配信済みのため即着手可） | **最優先** | 報告書 |
| A-2 | term-lab実機受入（21語の官能評価・375px・reduced-motion・進捗保存） | 高 | antigravity-term-lab-report.md |
| A-3実機 | OTAエキスパート実機受入（検算5点は済・実機操作とインポート異常系のみ） | 高 | antigravity-ota-expert-verification.md 追記 |
| A-2b/A-2c | 効率変換／半値角の実機受入（半値角はoffsetクランプ修正済みの挙動確認を含む） | 高 | 同上併記可 |
| A-6 | エリアカバレッジ実機受入（数値7点は検証済み・同心円図の体感評価のみ） | 中 | 同上 |
| A-7 | **spectrum-atlas実機受入＋データ裏取りの二重化**（S-4と独立に非日本52件を中心に。unverified-currentの確定/棄却） | 中 | antigravity-spectrum-atlas-report.md |
| A-8 | S-2文献パックの出典リンク実在・鮮度確認（10本ごと） | 継続 | antigravity-source-audit.md 追記 |

## 3. 実行順序（推奨）
```
即時並行:
  S-1 feature→main（G-4/G-7/FSPL着地）─→ A-5〜A-6 受入バックログ一掃（main上で）
  S-2 草稿執筆（1〜2本/ターン）─→ X-7 移行実装 ─→ S-5 検収 ─→ 10本毎にmain
  X-5 G-4仕上げ ─→ S-6 コミット代行 ─→ CIでscaffold --check稼働
続いて:
  S-3/S-4 G-7データ品質 ─→ X-6 出典配線 ─→ A-7 二重裏取り
```

## 4. リスクと手当（v11から継続＋更新）
- 同一working treeの並行操作: git操作前の`git status -sb`必須・異変時は停止して調査
- 新ブランチ初回コミット後の`git diff --diff-filter=D --stat <base>...HEAD`で意図しない削除を検出（P0事故の再発防止）
- Codex作業中はSonnet 5はツリーに触れない（docsは throwaway worktree 経由）
- 視覚変更を伴うG-3移行は10本単位でまとめてrebaseline（分割はPNG競合を生む）
