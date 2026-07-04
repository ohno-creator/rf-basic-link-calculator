# Antigravity 発注 — UX-2 変換系4ツール移行の視覚検証（第1バッチ・feature済）

Claude（Codex代行）が確立パターンで変換系4ツールを v2 部品へ移行し **feature にマージ済**（コミット `8b6645e`）。
機能ゲート全緑（tsc0/vitest293/lint/build/e2e34）。**描画が変わるため `-linux` 視覚回帰の確認と再ベースラインを依頼**。
`docs/handoff/visual-regression-runbook.md` 準拠。

## 対象ツール（feature 上）
| ツール | ページ | 主な視覚変化・要判断 |
| --- | --- | --- |
| dbm-converter | `/tools/dbm-converter` | 結果MetricCard7枚を **neutral化**（旧primary/success=色付き→無彩色）。判定でない換算値のため§2.1準拠。地味になった見え方の是非 |
| frequency-wavelength | `/tools/frequency-wavelength` | 周波数→Field(unitSelect)。単位selectが狭幅(min-w-20)で**長い単位ラベルが切れる可能性**。λ系4結果=MetricCard(neutral)。**物理長のバー内包箱はStat維持**＝上段MetricCard/下段Statの見た目混在の許容 |
| vswr-return-loss | `/tools/vswr-return-loss` | 指標select入力→Field(unitSelect)。結果8枚neutral化。**パワーフロー3枚の色(緑=入る/赤=戻る/黄=損失)が消える**＝良悪の色暗示が失われて良いか。placeholder→example（「例:」が常時表示に） |
| simple-link-budget | `/tools/simple-link-budget` | 入力6→Field(距離unitSelect)。**リンク余裕カードのみ判定色維持**、受信電力/FSPLはneutral。good判定時の面が旧staf-light→白neutralに変わる点 |

## 手順
1. CI(Linux)で `TEST_VISUAL=true npm run test:visual`。上記4ページ(desktop/mobile)の差分を確認。
2. 意図した部品化・neutral化かを判定（before/after差分画像）。他ツールに予期せぬ差分が無いことも確認。
3. 問題なければ該当4ページの `-linux` 基準線を再生成しコミットバック。

## ★要判断（視覚評価してほしい）
- **neutral寄せの是非**: 換算値が無彩色になり「地味/読みにくい」感が出ていないか。出ていれば「主役1つだけ弱いprimary可」等の方針をご提案ください（Claudeが調整）。
- **VSWRパワーフロー色の消滅**: 緑/赤/黄が良悪を直感的に伝えていた。neutral化で情報が落ちるなら、判定ではないが「補助的な色」を残す例外を検討。
- **frequency-wavelength の単位ラベル切れ / カード見た目混在**。

## src変更が要る場合
自分では直さず、具体箇所を報告 → Claude が対応。既に移行パターンは確立済みなので局所調整で済む見込み。
