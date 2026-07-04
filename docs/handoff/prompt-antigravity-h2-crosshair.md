# Antigravity 発注 — Track H2 グラフのスナップ強調＋ガイド線 視覚検証

**ブランチ**: `track/h2-chart-crosshair`（origin・base=feature）
機能ゲート全緑（tsc/vitest434/lint/build/e2e40）。

## 変更内容（chartTheme 単一ソース）
recharts チャートのホバー時可読性を商用ダッシュボード水準へ:
- `rfActiveDot(color)`（新）: ホバーで最近傍点へスナップした位置を**白ハロー(白縁2px)付きの系列色ドット**で強調。
- `rfTooltipProps().cursor`: 縦ガイドを**実線→破線(4 4)**化、色を AA 適合 `axis.label.fill(#64748B)` に統一。
- 手本適用: **旗艦2チャート**＝距離-受信電力（`DistancePowerChart`）／調査シート（`ResearchDistanceSheet`）。

## 検証手順
1. `TEST_VISUAL=true npm run test:visual`：旗艦ページの2チャートで差分（ホバー時の強調ドット・破線ガイド）。
2. **実機ホバー確認**（ブラウザ）: 旗艦ページの折れ線グラフにマウスを乗せ、
   - 最近傍点に**白ハローの強調ドット**が出て、どの点を読んでいるか一目で分かるか
   - 縦の**破線ガイド線**がカーソル位置に出るか（実線でなく破線か）
   - ツールチップが最近傍点へスナップして値を表示するか
3. 問題なければ再ベースライン。

## 展開（量産・工程②）
残り4チャートは同 `rfActiveDot(<系列stroke色>)` を各 `<Line>` の `activeDot` に付けるだけ:
- `AntennaToolPanel.tsx`（1520行 `activeDot={{ r: 5 }}` を置換）
- `CableLossCurveDiagram.tsx`（主曲線 line 104）
- `PropagationModelComparisonChart.tsx`（各モデル line）
- `TwoRayInterferenceLab.tsx`（"full" line）
cursor 破線は `rfTooltipProps()` 経由で全チャート自動適用済み（追加作業不要）。

## 補足（真の十字線=横線について）
横方向の基準線（cy を横断）は recharts の activeDot からプロット境界座標が取れず、堅牢に描けないため
今回は「縦破線ガイド＋強調ドット」で確定。横線が要件なら custom cursor 実装を別トラックで検討（申し送り）。
