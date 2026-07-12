# 第7波 実行プラン（2026-07-12 改訂v13・能力別3者分担の正本）

**位置づけ**: `plan-wave6.md`（v1〜v12）の後継。第6波の主要5案件はmainへ着地済み・Antigravity受入も完了。本書は第7波（G-3量産・G-4活用・トップページ・新規G-8）の分担正本。

**担当体制**: Claude Sonnet 5（設計・レビュー・統括・git実行・文献パック執筆）／GPT-5.6=Codex（実装。git操作なし）／Antigravity（実機受入・視覚承認・一次情報裏取り）

## 1. 現況（v13時点の確定事実）

- **main = 9a75b9a4**（第6波5案件＋P1修正＋rebaseline8。Antigravity受入 全7機能✅済み・A-2/A-3/A-5/A-6/A-7）
- **feature = f16644a1**（main比で大幅先行）。内訳:
  - G-4完了: scaffold-tool-page.mjs（`--check`修正済み・panelフィールドを3ページへ試験導入）＋F3（e2eスモーク自動生成）。**動作確認済み**（`--check`が3件ともskip判定で正常終了）
  - G-7完了＋P1修正: 周波数の用途地図（5モード・tools.ts登録済み）。Antigravity二重裏取り済み（非日本52件confirmed-current）
  - G-3量産: **文献パック4/10本完了**（fspl／vswr／dbFamily／dbmConverter。物理値は自己検算・lib関数から自動計算・旧TSX削除済み）
  - トップページ再構成: リンク設計16件を5小見出しへ分割、カード密度向上。**視覚差分あり・rebaseline未実施**
  - rebaseline9実施済み（G-4/G-7/FSPL分の69スナップショット更新・toggle revert済み）——ただし**トップページ再構成はrebaseline9より後のpushのため未反映**
  - 新規ドキュメント: `docs/3gpp-mobile-generation-lab-spec.md`（773行・実装状態「未着手」・企画品質は高い。抜き取り確認: 5G NSA/SA区別・6G未確定の扱い等の正確性注記が適切）
- 技術ゲート: `tsc --noEmit`緑／`vitest run`＝**672 tests passed (74 files)**／`GITHUB_PAGES=true next build`緑（spectrum-use-atlas・トップページ再構成とも反映確認）
- G-3残: 文献パック6本（hata/coax-cable-loss/desense/eirp-compliance/lora-airtime/ground-plane-size）＋その先の約42本（対象外の一般TSXコラム）
- G-7 P2（低優先度）: コラム9本の出典が全カテゴリ同一（MIC＋ITUのみ）。次点対応

## 2. 分担表（v13・優先度順）

### Claude Sonnet 5
| # | タスク | 状態 |
|---|---|---|
| **T-1** | **rebaseline10実施**: トップページ再構成の視覚差分をCI toggleループで確定（home-desktop/mobile snapshot更新） | **最優先・次のアクション** |
| **T-2** | **feature→main PR**: rebaseline10後、CI緑確認しmainへ統合（第7波の全成果を配信） | T-1後 |
| T-3 | G-3文献パック残り6本を継続執筆（hata→coax→desense→eirp→lora→ground-plane、1〜2本/ターン） | 継続 |
| T-4 | spectrumUses.tsの`e()`既定ステータスを`unverified-current`へ反転（新規追加分の裏取り漏れ防止。既存データは変更不要＝Antigravity済み検証を保持） | 低優先度・時間があれば |
| **T-5** | **【新規】3GPPモバイル世代進化ラボ仕様の技術レビュー**: 773行の正確性注記（5G NSA/SA・6G未確定・世代とReleaseの分離等）を精査し、Codex実装前に懸念点があれば差し戻し。テスト用の期待値（世代別の代表Bandやスループット等、数値を伴う主張）があれば自己検算 | G-8着手前に実施推奨 |
| 済 | S-1〜S-2の前半（rebaseline9・G-3×4本・トップページ）✅／G-4検収✅ | — |

### GPT-5.6 / Codex
| # | タスク | 参照 |
|---|---|---|
| 済 | X-5: G-4の`--check`修正＋panel試験導入 ✅（7fa6942f） | — |
| U-1 | G-3量産の実装反映: SonnetがT-3で執筆した文献パックを順次データ化＋パネル結線（1本ずつ、既存fspl/vswr移行を手本に） | 手本: `0e59eff4`, `cb0d49de` |
| **U-2** | **【新規】3GPPモバイル世代進化ラボの実装**: `docs/3gpp-mobile-generation-lab-spec.md`（773行・完成済み仕様）に基づき実装。T-5のレビューコメントがあれば反映してから着手 | docs/3gpp-mobile-generation-lab-spec.md |
| U-3 | G-7 P2: コラム9本へカテゴリ別の一次出典を追加（低優先度） | review-g4-g7.md |
| U-4 | G-4の本格展開: `panel`フィールドを残り約40ツールへ順次追加し、scaffold管理下を拡大（任意・急ぎではない） | prompt-codex-f1kai-f3.md |

### Antigravity
| # | タスク | 前提 |
|---|---|---|
| 済 | A-2/A-2b/A-2c/A-3/A-5/A-6/A-7（第6波5機能受入＋Band裏取り）全て✅ | — |
| **A-9** | **【新規】トップページ再構成の実機受入**: サブカテゴリ表示の分かりやすさ・モバイル375pxでの密度上昇後の視認性・タップ領域を官能評価 | T-1（rebaseline10）後 |
| A-10 | 文献パック4本（fspl/vswr/dbFamily/dbmConverter）の出典リンク実在・鮮度確認 | 随時 |
| **A-11** | **【新規】3GPPモバイル世代進化ラボの受入**: 実装後、5G NSA/SA区別・世代とReleaseの混同がないか等、正確性注記が画面上でも保たれているかを重点確認 | U-2後 |

## 3. 実行順序
```
T-1 rebaseline10（トップページ視覚確定）
 └→ T-2 feature→main PR（第7波配信）
     └→ A-9 トップページ受入

T-3 文献パック執筆（継続）→ U-1 実装反映 → A-10 出典確認
T-5 3GPPラボ仕様レビュー → U-2 実装 → A-11 受入
U-3/U-4（低優先度・並行可）
```

## 4. 掃除メモ
`track/rebaseline9`はorigin上に残存（作業用ブランチ。feature/mainへ統合済みのため削除可・急ぎではない）。
