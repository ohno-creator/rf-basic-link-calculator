# Codex 発注 — 放射効率 dB⇔% 変換ツール（実務目安つき便利ツール）

**新ツール**: slug `radiation-efficiency-converter`「放射効率 dB⇔% 変換」category "basics" icon "gauge"（basic{}完備）
**ブランチ**: `track/efficiency-converter`（origin/feature から・専用worktree）
**手本**: `DbmConverterPanel.tsx`（双方向変換の型）／`NoiseFloorColumn.tsx`（E1コラム）／`src/data/rainAttenuationCoefficients.ts`（出典付きデータ層）

## lib（テスト先行・src/lib/rf/radiationEfficiency.ts）
- `efficiencyPercentToDb(percent)` = 10·log10(percent/100)。定義域 (0,100]。100超・0以下は RfError（効率は100%を超えない旨JSDoc）
- `efficiencyDbToPercent(db)` = 100·10^(db/10)。定義域 db≤0。正のdBは RfError
- `efficiencyToRangeFactor(db)` = 10^(db/20)（自由空間の距離倍率。既存db.tsに同等があれば再利用）
- テスト期待値: 100%↔0dB／50%↔-3.010dB／10%↔-10dB／1%↔-20dB／往復一致／50%→距離×0.708／-0非返却・境界エラー

## データ（src/data/efficiencyGuidelines.ts・実務目安・「代表的な設計目安。実測が正」注記必須）
状況別の目安レンジ（percentLow/High・用途コメント）:
| 状況 | 目安 | コメント要旨 |
|---|---|---|
| 外付けホイップ/ダイポール（基準） | 70〜90%（-1.5〜-0.5dB） | 整合が取れていればここが上限感 |
| 920MHz 内蔵・基板余裕あり（GNDλ/4確保） | 40〜60%（-4〜-2.2dB） | 内蔵としては良好の水準 |
| 920MHz 小型IoT（GND不足・筐体内） | 15〜40%（-8〜-4dB） | ground-plane-sizeで要因確認 |
| 2.4GHz BLE/Wi-Fi スマホ・小型機内蔵 | 30〜60%（-5.2〜-2.2dB） | 混雑実装の現実解 |
| GNSSパッチ（良好実装） | 50〜70%（-3〜-1.5dB） | C/N0に直結 |
| ウェアラブル（人体近接） | 5〜20%（-13〜-7dB） | body-lossと併読 |
| 金属筐体・過酷実装 | 5〜15%（-13〜-8.2dB） | metal-plane-effect/detuningへ |
実務判定ライン（Calloutで明示）: **50%(-3dB)超=内蔵として良好／20%(-7dB)未満=距離が半分以下になり得るため実装見直し推奨**

## パネル（RadiationEfficiencyPanel.tsx）
- 双方向変換: %入力とdB入力が相互連動（どちらを触っても他方が更新・スライダー付き・primary-result=変換結果）
- **距離への影響**を常時併記: 「効率50% → 自由空間の通信距離 ×0.71（-29%）」（efficiencyToRangeFactor）
- 目安表: 状況チップ（外付け/内蔵/ウェアラブル/金属近接）で絞り込み・**現在の入力値がどの目安レンジに該当するかをハイライト**（該当なし=範囲外表示）
- FormulaExplanationCard: ①効率は「入れた電力のうち電波になった割合」②dBは10log10（電力比）③距離は20log10側で効く（√）の3段
- 関連リンク: radiation-resistance（効率の物理）/ ground-plane-size / body-loss

## コラム（E1様式・RadiationEfficiencyColumn.tsx）
題材: **「箱をかぶせると効率がわかる——Wheelerキャップの発明」**
ハロルド・ウィーラーが1959年に示した「アンテナに導体の箱（radiansphere相当のキャップ）をかぶせて放射だけを止め、入力抵抗の変化から効率を分離測定する」古典手法。高価な電波暗室なしに町工場でも効率が測れる発明——「放射」と「損失」を箱ひとつで切り分ける発想の鮮やかさ。たとえ＋破れ1文（キャップ法は小型アンテナ前提・共振近傍でのみ簡便、の限界）。
出典: H. A. Wheeler, "The Radiansphere around a Small Antenna," Proc. IRE, 1959／IEEE Std 149（効率測定）／C. A. Balanis, Antenna Theory（効率の定義）

## e2e（納品に含める）
既定50%→「-3.0 dB」「×0.71」表示→dB側に-10入力→%が10.0へ連動→目安表で「小型IoT」帯がハイライト、の1本（tool-calculator配下）

## 仕上げ
tools.tsエントリ（basic{}完備・description/beginnerGuideに「実務目安つき」を明記）＋e2e結線＋全ゲート（`Tests N passed`確認）→push→視覚ループ→feature/main。Antigravityへ受入（変換値の手計算照合・目安表の官能評価）を依頼。
