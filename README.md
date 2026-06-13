# RF Basic Link Calculator

スタッフ株式会社向けの「通信距離・リンクバジェット簡易診断」Webアプリです。周波数、距離、送信出力、アンテナ利得、受信感度から、無線通信の受信電力とリンクマージンを簡易計算します。

## 主な機能

- 周波数・波長計算
- dBm / mW / W 変換
- 自由空間損失 FSPL 計算
- リンクバジェット簡易診断
- 920MHz LPWA、BLE、Wi-Fi、LTE-M、金属筐体の悪い例プリセット
- Signal Flow Diagram、Link Margin Gauge、Distance vs Received Power Chart
- Sensitivity Line Visual、Wavelength Visual、Decibel Scale Visual
- 改善シミュレーションと相談用テキストコピー
- FAQ、SEO metadata、JSON-LD、コラム/お問い合わせ導線

## UI/UX方針

無線・アンテナ・dBに慣れていないユーザーでも、プリセットを選び、スライダーを動かし、図解と折りたたみ解説を見ることでリンクバジェットを理解できる構成です。BtoB製造業サイトに掲載できるよう、清潔感、実務性、技術的な信頼感を重視しています。

## 図解コンポーネント

- `SignalFlowDiagram`: 送信出力、アンテナ利得、損失、受信電力、リンクマージンの流れをカードで表示
- `LinkMarginGauge`: 0dB、10dB、20dBの判定基準をゲージで表示
- `DistancePowerChart`: 距離を変えたときの推定受信電力と受信感度ラインを表示
- `SensitivityLineVisual`: 受信電力と受信感度の上下関係を視覚化
- `WavelengthVisual`: 周波数が高いほど波長が短くなることを表示
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
- `/tools/rf-basic-link-calculator`: RF Basic Link Calculator 本体

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
