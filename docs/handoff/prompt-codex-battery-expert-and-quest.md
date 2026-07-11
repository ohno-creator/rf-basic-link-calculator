# Codex 発注 — ①電池寿命エキスパートモード ②学習クエスト問題パック60問

**ブランチ**: `track/codex-battery-quest`（origin/feature から作成）。**必ず自分のworktree（rf-codex等）で作業**。メインworktreeとclaude-gdata/claude-intuitionはClaude使用中のため触らない。
**共通禁止**: `src/data/tools.ts`・`e2e/tools.spec.ts`・`.github/workflows/**`・既存ツールの共有ファイルは編集禁止（結線はClaudeが実施）。`git add -A`禁止（パス指定add）。push前にtsc/vitest/lint緑。

---

## タスク① 電池寿命エキスパートモード（優先）

目的: 既存 battery-life ツール（シンプル計算: 平均電流=duty×TX＋スリープ・derate一律0.7）に、電池の実特性を考慮した**エキスパートモード**を追加する。

### データ層 `src/data/batteryChemistry.ts`（全数値に出典・発明禁止）
化学プロファイル（代表値・データシート出典コメント必須）:
- Li-SOCl2ボビン型（ER14505 AA: 3.6V・2400mAh・自己放電約1%/年・-55〜+85℃・パルスに弱い・不動態化あり）出典: Tadiran TL-4903 / Saft LS14500
- Li-SOCl2スパイラル型（高パルス対応・自己放電約2%/年）出典: Saft LSHシリーズ
- Li-MnO2（CR123A: 3V・1500mAh・自己放電約1%/年・中パルス対応）出典: Panasonic CR123A
- コイン形CR2032（3V・225mAh・連続0.2mA標準・パルス15mA実用上限・大パルスで実効容量が大幅低下）出典: Panasonic CR2032
- アルカリAA（1.5V・約2800mAh低負荷時・自己放電2-3%/年・-20℃で容量半分以下）出典: Panasonic/Energizer
温度ディレーティング表（化学別・-20/0/+25/+60℃の容量係数）とパルス実効容量係数（ピーク/平均電流比 <10x / 10-100x / >100x の区分）を上記データシート系の代表値で定義。

### lib `src/lib/rf/batteryLifeExpert.ts`（テスト先行 `src/tests/batteryLifeExpert.test.ts`）
`estimateExpertBatteryLife({chemistry, capacityMah, temperatureC, sleepCurrentUa, txCurrentMa, txDurationMs, txIntervalS, rxCurrentMa?, rxDurationMs?, agingYears?})` →
- 実効容量 = 定格 × 温度係数 × パルス係数
- 自己放電との連立（年率rなら 実効容量 = 使用消費 + 定格×r×寿命年 の1次方程式・閉形式）
- 出力: `lifeYears`・支配要因 `dominantFactor("sleep"|"tx"|"self_discharge"|"temperature"|"pulse")`・Li-SOCl2長期スリープ時の不動態化注意フラグ
- 10年超は「10年+（電池特性が支配）」のクランプ表示用フラグ
- 既存 `batteryLife.ts` のAPI・既存テストを壊さない（純粋な追加）
- 期待値は式から独立導出してテストに固定。自己放電支配になる極低duty境界を含める

### UI `src/app/tools/_components/BatteryLifePanel.tsx` 拡張
- 「エキスパートモード」トグル（OFF時は完全に従来どおり・既存data-testid/e2e不変）
- ON時: 化学チップ5種・動作温度スライダー(-20〜+60℃)・RX電流/時間・経年入力
- 出力: シンプル版と並記した寿命・**律速要因バッジ**・化学別注意Callout（例: CR2032+LoRa級パルス→警告）
- SVG: 消費内訳の積み上げ（TX/RX/スリープ/自己放電・入力連動・chartTheme/diagramPaletteトークンのみ・生hex禁止）
- E1様式コラムを1本追加:「10年電池の落とし穴」（不動態化・CR2032のパルス・自己放電の壁。出典: 各データシート + L. Casals et al., "Modeling the Energy Performance of LoRaWAN," Sensors 2017）

### 納品
push後、`docs/handoff/codex-battery-expert-report.md` に「変更ファイル・追加テスト数・e2e追加案（テキストで）」を記載。e2e本体はClaudeが結線する。

---

## タスク② 学習クエスト問題パック60問

目的: RF学習クエストに新ツール連動の問題を追加する（appLinkで新ツールへ直結させ、学習→実践の導線を作る）。

### 形式（最重要）
`src/data/rfLearningQuestLessons.ts` の**シード配列形式・文体・粒度を必ず読んで完全に踏襲**。新ファイル3つを作成:
1. `src/data/rfQuestImplementationSeeds.ts`（mode="apprentice"・20問）: キープアウト4/GND寸法4/離調4/ボディロス4/金属面2/IFA2。対応ツール: antenna-keepout, ground-plane-size, detuning-estimator, body-loss, metal-plane-effect, ifa-initial-dimensions
2. `src/data/rfQuestFieldSeeds.ts`（mode="practitioner"・20問）: 壁透過4/OTA・TRP/TIS4/デセンス3/測定計画4/LTE品質3/GNSS2。対応: wall-penetration, desense, measurement-sampling, lte-signal-metrics, gnss-cn0
3. `src/data/rfQuestRegulationSeeds.ts`（mode="expert"・20問）: LoRa/ARIB5/EIRP3/dB系単位5/ダイバーシティ3/Q帯域2/電池2。対応: lora-airtime, eirp-compliance, db-family, diversity-gain, vswr-bandwidth-q, battery-life

### 使ってよい確定数値（これ以外の数値を発明しない）
- キープアウト: 不足率20%が注意/NG境界・チップ2.4GHzで10×4mm
- GND: λ/4未満で低下（λ/10で-6dB・λ/20で-12dB）
- 離調: 樹脂密着-3〜-5%・3mm離隔でほぼ収束
- ボディロス: 手持ち920MHzで3〜6dB・体表2.4GHzで15〜25dB
- 金属面: d=λ/4で+6dB・密着でヌル
- 壁: コンクリ内壁920MHzで8-15dB・Low-E 20-30dB@2.4G・石膏1-2dB
- OTA: 受動損失はTRP/TISに等しく効き、TISだけ悪い分＝ノイズ性デセンス
- デセンス: I=Nで+3dB劣化→自由空間で距離-29%
- 測定: σ8dB±2dB95%で62点・窓40λ
- RSRP≈RSSI−10log10(12·N_RB)・10MHz=50RB→27.78dB
- ARIB STD-T108: 連続4秒・休止10倍・累積360秒/h・CS -80dBm。SF12/125kHz/100B→ToA≈3.94秒・SF+1で約2倍
- dBd=dBi−2.15。dBm+dBmは電力和（10+10=13dBm）
- ダイバーシティ: 独立1%で約10.2dB・0.5λでρe≈0.09
- FBW=(s−1)/(Q√s)・Q=20/s=2で3.54%

### 品質基準
各問: 現場シナリオ起点の判断問題／もっともらしい誤答（ありがちな誤解）／explanation150-250字で物語性／column80-150字の「へえ」／appLinkのhref・labelはtools.tsの実slug・実名と一致。

### 納品
push後、`docs/handoff/codex-quest-packs-report.md` にexport名一覧を記載。`rfQuestLessons` への結線（rfLearningQuestLessons.ts編集）はClaudeが実施。
