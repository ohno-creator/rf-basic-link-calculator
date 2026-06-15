# RF Basic Link Calculator

スタッフ株式会社向けの「通信距離・リンクバジェット簡易診断」Webアプリです。周波数、距離、送信出力、アンテナ利得、受信感度から、無線通信の受信電力とリンクマージンを簡易計算します。

## 主な機能

- 周波数・波長計算
- dBm / mW / W 変換
- 自由空間損失 FSPL 計算
- リンクバジェット簡易診断
- 920MHz LPWA、BLE、Wi-Fi、LTE-M、金属筐体の悪い例プリセット
- はじめての見方ロードマップ、入力影響ガイド、結果読み取りガイド
- Signal Flow Diagram、Link Margin Gauge、Distance vs Received Power Chart
- Link Budget Waterfall Chart による利得・損失の可視化
- Sensitivity Line Visual、Wavelength Visual、Decibel Scale Visual
- 改善シミュレーションと相談用テキストコピー
- 入力条件の共有リンク生成・URL/ローカル保存・初期値リセット
- スクロール追従の判定サマリ（モバイル）
- 基本計算ツール集（単機能・専用ページ）：VSWR・リターンロス変換、同軸線路インピーダンス、マイクロストリップ線路（特性インピーダンス＋マイター曲げ設計）、フレネルゾーン半径、伝搬損失（奥村-秦／COST 231-Hata）。各ページに入力連動の動的図と本質解説を搭載
- FAQ、SEO metadata、JSON-LD、コラム/お問い合わせ導線

## UI/UX方針

無線・アンテナ・dBに慣れていないユーザーでも、ロードマップで見る順番を把握し、プリセットを選び、入力影響ガイドを見ながらスライダーを動かし、滝グラフと結果読み取りガイドでリンクバジェットを理解できる構成です。BtoB製造業サイトに掲載できるよう、清潔感、実務性、技術的な信頼感を重視しています。

入力した条件はブラウザのlocalStorageに自動保存され、URLクエリにも反映されます。「条件を共有リンクでコピー」で得たURLを開くと同じ条件が復元され、自動的に診断結果までスクロールします。条件が初期値のときはURL・保存をクリーンに保ち、「初期値に戻す」でいつでもリセットできます。シリアライズ処理（`src/lib/rf/share.ts`）はURL・保存値を信頼境界の外側として扱い、不正値は既定値にフォールバックします。

## 図解コンポーネント

- `SignalFlowDiagram`: 送信出力、アンテナ利得、損失、受信電力、リンクマージンの流れをカードで表示
- `BeginnerRoadmap`: 初心者向けにプリセット、入力、滝グラフ、実機確認の順番を表示
- `InputImpactGuide`: 距離、利得、損失、受信感度が結果にどう効くかを表示
- `ResultReadingGuide`: 判定、主要3数値、滝グラフの読む順番を表示
- `LinkBudgetWaterfallChart`: 送信出力から利得・損失を積み上げ、推定受信電力に落ちるまでを滝グラフで表示
- `RadioPathDiagram`: 送信側、空間損失、ケーブル・筐体・環境、受信側を経路図として表示
- `LinkMarginGauge`: 0dB、10dB、20dBの判定基準をゲージで表示
- `DistancePowerChart`: 距離を変えたときの推定受信電力と受信感度ラインを表示
- `SensitivityLineVisual`: 受信電力と受信感度の上下関係を視覚化
- `WavelengthVisual`: 半波長λ/2（アンテナの基準寸法）を表示し、共振の本質・誘電率などによる小型化手法・小型化に伴う特性劣化を解説
- `DecibelScaleVisual`: dBmとmW/Wの関係、+10dBで10倍の感覚を表示

## 技術スタック

- Next.js
- TypeScript
- React
- Tailwind CSS
- ESLint
- Vitest
- Recharts

## セットアップ

```bash
npm install
```

## 開発コマンド

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## ページ

- `/`: ツールへの簡易トップページ
- `/tools/rf-basic-link-calculator`: RF Basic Link Calculator 本体（基本計算ツールのインデックスを内包）
- `/tools/vswr-return-loss`: VSWR・リターンロス変換（定在波の動的図つき）
- `/tools/coaxial-line-impedance`: 同軸線路インピーダンス（断面の動的図つき）
- `/tools/microstrip-line`: マイクロストリップ線路（断面図＋マイター曲げ設計の動的図つき）
- `/tools/fresnel-zone`: フレネルゾーン半径（経路断面の動的図つき）
- `/tools/propagation-loss`: 伝搬損失 奥村-秦／COST 231-Hata（距離-損失カーブつき）

各基本計算ツールは専用ページを持ち、入力に連動する図と本質解説（その結果が何を意味するか）を備えています。

## 公開URL

GitHub Pages:

https://ohno-creator.github.io/rf-basic-link-calculator/

GitHub Pages ではリポジトリ名のサブパスで配信するため、Actions 実行時だけ `GITHUB_PAGES=true` を指定し、Next.js の `basePath` を `/rf-basic-link-calculator` に切り替えています。

## 計算式

```text
λ[m] = 299,792,458 / 周波数[Hz]
```

```text
mW = 10 ^ (dBm / 10)
dBm = 10 × log10(mW)
W = mW / 1000
```

```text
FSPL[dB] = 32.44 + 20log10(距離[km]) + 20log10(周波数[MHz])
```

```text
受信電力[dBm]
= 送信出力[dBm]
+ 送信アンテナ利得[dBi]
+ 受信アンテナ利得[dBi]
- 自由空間損失[dB]
- ケーブル・コネクタ損失[dB]
- 環境補正損失[dB]

リンクマージン[dB]
= 受信電力[dBm] - 受信感度[dBm]
```

### 基本計算ツール（単機能）

```text
VSWR = (1 + Γ) / (1 - Γ)
リターンロス[dB] = -20 × log10(Γ)
反射電力[%] = Γ^2 × 100
```

```text
同軸線路インピーダンス Z0[Ω] = (138 / √εr) × log10(D / d)
速度係数 VF = 1 / √εr
```

```text
フレネルゾーン半径 r1[m] = √( λ × d1 × d2 / (d1 + d2) )
```

```text
伝搬損失（奥村-秦 / 市街地）
L = 69.55 + 26.16·log10(f) − 13.82·log10(hb) − a(hm)
    + (44.9 − 6.55·log10(hb))·log10(d)
郊外   : L − 2·(log10(f/28))² − 5.4
開放地 : L − 4.78·(log10 f)² + 18.33·log10 f − 40.94
1500MHz超は COST 231-Hata（大都市 +3dB）に切替
```

## SEO導線

詳しい解説コラム:

https://www.staf.co.jp/media/column/ant-c/ant-tools/rf-basic-link-calculator

## お問い合わせ導線

お問い合わせ:

https://www.staf.co.jp/contact.html

Hero、結果、改善シミュレーション、ページ下部、FAQ下部に相談CTAを配置しています。

## Roadmap

### Phase 1

RF Basic Link Calculator

- 周波数・波長計算
- dBm / mW / W変換
- 自由空間損失計算
- リンクバジェット簡易診断
- 図解・ゲージ・グラフ
- SEO導線
- お問い合わせCTA

### Phase 2

Antenna Fit Check

- 筐体条件
- 基板GND
- アンテナ配置
- 内蔵/外付け
- 実装リスク診断
- 必要評価ステップ提示

### Phase 3

Wireless Technology Selector

- BLE
- Wi-Fi
- LTE-M
- NB-IoT
- LoRaWAN
- Wi-SUN
- UWB
- GNSS
- 用途別方式選定

### Phase 4

S11 / VSWR Viewer

- Touchstone .s1p 読み込み
- S11グラフ
- VSWR変換
- 周波数帯判定

### Phase 5

Consultation Report Generator

- 診断結果PDF
- 問い合わせ文面生成
- 技術相談シート生成
