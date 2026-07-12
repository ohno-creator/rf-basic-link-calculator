// scripts/generate-e2e-smoke.mjs から生成。直接編集しないでください。
import { expect, test } from "@playwright/test";

const tools = [
  { slug: "simple-link-budget", title: "かんたんリンク計算" },
  { slug: "free-space-loss", title: "自由空間損失（FSPL）" },
  { slug: "noise-floor", title: "ノイズフロアと受信感度" },
  { slug: "eirp-compliance", title: "EIRP法規チェック（920MHz帯）" },
  { slug: "rain-attenuation", title: "降雨・大気減衰" },
  { slug: "shadowing-margin", title: "シャドウイングマージン" },
  { slug: "polarization-loss", title: "偏波不整合損失" },
  { slug: "fresnel-zone", title: "フレネルゾーン半径" },
  { slug: "propagation-loss", title: "伝搬損失モデル比較" },
  { slug: "ncu-below-ground", title: "GL以下NCU・水道BOX診断" },
  { slug: "nami-gate-window", title: "ナミゲート 室内受信電力シミュレーター" },
  { slug: "patch-hpbw-explorer", title: "パッチアンテナの半値角" },
  { slug: "frequency-wavelength", title: "周波数・波長" },
  { slug: "radiation-efficiency-converter", title: "放射効率 dB⇔% 変換" },
  { slug: "dbm-converter", title: "dBm 変換" },
  { slug: "db-feel", title: "dBを体感する" },
  { slug: "vswr-return-loss", title: "VSWR・リターンロス変換" },
  { slug: "coaxial-cable-loss", title: "同軸ケーブル損失" },
  { slug: "microstrip-line", title: "マイクロストリップ線路" },
  { slug: "effective-aperture", title: "有効開口面積・受信面積" },
  { slug: "aperture-gain-beamwidth", title: "開口アンテナ利得・ビーム幅" },
  { slug: "antenna-spacing", title: "アンテナ間隔 λ換算" },
  { slug: "array-grating-lobe", title: "不要ビーム判定（アレイ間隔）" },
  { slug: "patch-antenna-dimensions", title: "矩形パッチアンテナ寸法" },
  { slug: "small-loop-resonance", title: "小型ループアンテナ共振" },
  { slug: "radiation-resistance", title: "短縮アンテナ放射抵抗・効率" },
  { slug: "small-antenna-limit", title: "小型アンテナ限界（ka・Q・帯域）" },
  { slug: "large-array-near-field", title: "大型アレイ近傍界・遠方界判定" },
  { slug: "reflector-ris-size-effect", title: "反射板・RISサイズ効果" },
  { slug: "ifa-initial-dimensions", title: "逆F・IFAアンテナ初期寸法" },
  { slug: "l-match", title: "L型整合回路計算" },
  { slug: "diversity-gain", title: "ダイバーシティ利得推定" },
  { slug: "antenna-isolation", title: "2アンテナ間アイソレーション" },
  { slug: "lora-airtime", title: "LoRa Time-on-Air・920MHz送信制限" },
  { slug: "battery-life", title: "無線端末の電池寿命" },
  { slug: "gnss-cn0", title: "GNSS受信 C/N0バジェット" },
  { slug: "mismatch-range-impact", title: "ミスマッチと通信距離" },
  { slug: "desense", title: "デセンス（ノイズ干渉による感度劣化）" },
  { slug: "measurement-sampling", title: "電測サンプリング設計（必要サンプル数・Lee窓）" },
  { slug: "electrical-length", title: "電気長・位相換算" },
  { slug: "lte-signal-metrics", title: "LTE電波指標の換算（RSSI・RSRP・RSRQ）" },
  { slug: "vswr-bandwidth-q", title: "VSWR帯域幅とQ" },
  { slug: "pointing-margin", title: "アンテナ指向誤差マージン" },
  { slug: "metal-plane-effect", title: "金属面近接の利得変化（イメージ理論）" },
  { slug: "antenna-keepout", title: "アンテナ・キープアウト領域チェック" },
  { slug: "wall-penetration", title: "壁・建材の透過損失バジェット" },
  { slug: "body-loss", title: "人体・手の影響ボディロス（装着シナリオ別）" },
  { slug: "detuning-estimator", title: "筐体・近接物による離調推定" },
  { slug: "ground-plane-size", title: "GNDプレーン寸法と効率（λ/4モノポール系）" },
  { slug: "db-family", title: "dB・dBm・dBi・dBdの違い" },
  { slug: "cellular-band-map", title: "周波数と4G/5G Band早わかり（バンド地図）" },
  { slug: "ota-implementation-loss", title: "OTA実装損失・デセンス分析（TRP/TISギャップ分離）" },
  { slug: "diffraction-shadow", title: "回折・回り込みの見える化（ナイフエッジ回折）" },
];

for (const tool of tools) {
  test(`basic smoke: ${tool.slug}`, async ({ page }) => {
    await page.goto(`/tools/${tool.slug}/`);
    const calculator = page.getByTestId("tool-calculator");
    await expect(calculator).toBeVisible();
    const primary = calculator.getByTestId("primary-result");
    if (await primary.count()) await expect(primary).toBeAttached();
  });
}
