import { expect, test } from "@playwright/test";

const ALL_SLUGS = [
  "rf-basic-link-calculator",
  "free-space-loss",
  "fresnel-zone",
  "propagation-loss",
  "rf-learning-quest",
  "frequency-wavelength",
  "dbm-converter",
  "db-feel",
  "vswr-return-loss",
  "coaxial-cable-loss",
  "microstrip-line"
];

test.describe("tool hub", () => {
  test("home lists every tool and links to its page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "無線設計の計算を、ひとつずつ。" })
    ).toBeVisible();

    for (const slug of ALL_SLUGS) {
      await expect(page.locator(`a[href*="/tools/${slug}"]`)).toHaveCount(1);
    }
  });
});

test.describe("tool pages render with hero, diagram and explanation", () => {
  const pages = [
    { slug: "vswr-return-loss", h1: "VSWR・リターンロス変換", fig: "定在波で見るVSWR" },
    { slug: "coaxial-cable-loss", h1: "同軸ケーブル損失", fig: "ロス比較" },
    { slug: "microstrip-line", h1: "マイクロストリップ線路", fig: "断面で見るマイクロストリップ" },
    { slug: "fresnel-zone", h1: "フレネルゾーン半径", fig: "経路で見るフレネルゾーン" },
    { slug: "propagation-loss", h1: "伝搬損失モデル比較", fig: "現在距離" },
    { slug: "frequency-wavelength", h1: "周波数・波長", fig: "半波長アンテナ長の目安" },
    { slug: "dbm-converter", h1: "dBm 変換", fig: "dBm / mW / W 変換" },
    { slug: "db-feel", h1: "dBを体感する", fig: "dBの「ものさし」" },
    { slug: "free-space-loss", h1: "自由空間損失（FSPL）", fig: "自由空間損失 FSPL 計算" }
  ];

  for (const { slug, h1, fig } of pages) {
    test(`${slug} renders`, async ({ page }) => {
      await page.goto(`/tools/${slug}/`);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
      await expect(page.getByText(fig).first()).toBeVisible();
      await expect(page.getByRole("heading", { name: "ほかの基本計算ツール" })).toBeVisible();
    });
  }
});

test("VSWR diagram reacts to input", async ({ page }) => {
  await page.goto("/tools/vswr-return-loss/");
  const input = page.locator('input[type="number"]').first();
  await input.fill("3");
  await expect(page.getByText("3.00").first()).toBeVisible();
  await expect(page.getByText("25.0%").first()).toBeVisible();
});

test("dB feel slider reacts to dB", async ({ page }) => {
  await page.goto("/tools/db-feel/");
  const slider = page.locator("#dbValue");
  await slider.evaluate((el: HTMLInputElement) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    setter?.call(el, "20");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  // +20dB -> power ×100, distance ×10
  await expect(page.getByText("×100").first()).toBeVisible();
});

test("RF calculator switches to the research distance sheet", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await page.getByRole("tab", { name: /研究ベース距離計算/ }).click();

  await expect(
    page.getByRole("heading", { name: "目標信頼率を満たす最大通信距離を別シートで計算します" })
  ).toBeVisible();
  await expect(page.getByText("90%信頼率の最大距離")).toBeVisible();
  await expect(page.getByRole("heading", { name: "距離別リンク余裕" })).toBeVisible();

  await page.getByLabel("距離計算モデル").selectOption("tr38901_umi_nlos");
  await expect(page.getByRole("heading", { name: "適用範囲と注意" })).toBeVisible();
  await page.getByLabel("距離計算モデル").selectOption("sui_terrain_a");
  await expect(page.getByText(/SUI Terrain A\/B\/Cは、丘陵/)).toBeVisible();
  await page.getByLabel("距離計算モデル").selectOption("cost231_wi_nlos");
  await expect(page.getByRole("heading", { name: "基地局・街路設計用パラメータ" })).toBeVisible();
  await expect(page.getByText("今回SUI Terrain A/B/CとCOST231 Walfisch-Ikegami NLOSを比較モデルとして追加しました")).toBeVisible();
});

test("RF calculator explains that Hata antenna heights are not fixed", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await page.locator("#propagationModel").selectOption("okumura_hata");

  await expect(page.getByText("奥村・秦モデルの空中線地上高は固定ではありません")).toBeVisible();
  await expect(page.getByText(/送信側アンテナ高 .*基地局高 hb/).first()).toBeVisible();
  await expect(page.locator("#propagationArea")).toBeVisible();
  await page.locator("#propagationArea").selectOption("open");
  await expect(page.getByText("遮蔽物の少ない開放地として評価します。")).toBeVisible();
  await expect(page.getByRole("button", { name: "送信側アンテナ高を確認" })).toBeVisible();
});

test("RF calculator shows model assumptions, double-counting guidance, and research column", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");

  await expect(page.getByRole("img", { name: "リンク計算の2D前提図" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "計算・シミュレーション前提と指定パラメータ" })).toBeVisible();
  await expect(page.getByText("この図と計算を見るときの注意点")).toBeVisible();
  await expect(page.getByText("入力前提チェックメニュー")).toBeVisible();
  await expect(page.getByText("損失の入れ分けと二重計上")).toBeVisible();

  await page.getByText("モデルの前提条件・入力の使われ方").click();
  await expect(page.getByText("二重計上に注意")).toBeVisible();
  await expect(page.getByText("奥村・秦の高さ入力")).toBeVisible();
  await expect(page.getByRole("button", { name: "RSSI/RSRPの説明" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "コラム：奥村-秦モデルと最新IoT伝搬研究" })).toBeVisible();
  await expect(page.getByText("2025〜2026年の研究を追うと")).toBeVisible();
});

test("RF calculator diagrams show the two-ray interference lab synced with inputs", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await page.getByRole("spinbutton", { name: "周波数" }).fill("1500");
  await page.getByRole("spinbutton", { name: "送信側アンテナ高" }).fill("20");
  await page.getByRole("spinbutton", { name: "受信側アンテナ高" }).fill("2");
  await page.getByRole("tab", { name: /図解で詳しく/ }).click();

  await expect(page.getByText("2波モデル実験室：干渉で波打つ様子を見る")).toBeVisible();
  await expect(page.locator("#lab-freq")).toHaveValue("1500");
  await expect(page.locator("#lab-ht")).toHaveValue("20");
  await expect(page.locator("#lab-hr")).toHaveValue("2");
  await page.getByText("このグラフの前提と読み方").click();
  await expect(page.getByText("反射係数 Γ=-1")).toBeVisible();
});

test("RF calculator supports IoT calibrated Hata mode", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await page.locator("#propagationModel").selectOption("iot_hata_calibrated");

  await expect(page.getByText("IoT実測補正Hataモードの校正点")).toBeVisible();
  await expect(page.getByLabel("実測アンカー距離")).toBeVisible();
  const measuredPower = page.getByRole("spinbutton", { name: "実測受信電力" });
  await expect(measuredPower).toBeVisible();
  await expect(page.getByText("Urban LoRa大規模測定")).toBeVisible();

  await measuredPower.fill("-100");
  await expect(page.getByText(/実測受信電力から、基準モデルに対して/)).toBeVisible();

  await page.getByRole("spinbutton", { name: "実測補正値" }).fill("5");
  await expect(page.getByText("実測補正値との二重計上を確認してください")).toBeVisible();
});

test("microstrip impedance reacts to trace width", async ({ page }) => {
  await page.goto("/tools/microstrip-line/");
  await expect(page.getByText("50.8 Ω").first()).toBeVisible();
  const width = page.locator('input[type="number"]').first();
  await width.fill("1.0");
  await expect(page.getByText("87.5 Ω").first()).toBeVisible();
});

test("microstrip bend significance reacts to frequency", async ({ page }) => {
  await page.goto("/tools/microstrip-line/");
  // default 2.4GHz, 3mm trace -> the bend is electrically small
  await expect(page.getByText("ほぼ無視できる").first()).toBeVisible();
  await page.locator("#msFreq").fill("10000");
  await expect(page.getByText("大きい（要対策）").first()).toBeVisible();
});

test("fresnel page includes the IoT deep-dive", async ({ page }) => {
  await page.goto("/tools/fresnel-zone/");
  await expect(
    page.getByRole("heading", { name: "IoTの現場でフレネルゾーンをどう活かすか" })
  ).toBeVisible();
  await expect(page.getByText("だからこそ、マージンが重要")).toBeVisible();
});

test("propagation page includes the Okumura-Hata column", async ({ page }) => {
  await page.goto("/tools/propagation-loss/");
  await expect(
    page.getByRole("heading", { name: "コラム：奥村-秦モデルと最新IoT伝搬研究" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "伝搬損失モデル比較" }).first()).toBeVisible();
  await expect(page.getByText("2波モデル実験室：干渉で波打つ様子を見る")).toBeVisible();
});

test("RF learning quest answers immediately and saves progress", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");
  await expect(
    page.getByRole("heading", { level: 1, name: "問題を倒して、リンク設計の勘を育てる" })
  ).toBeVisible();
  await expect(page.getByText("初心者、見習い、実務者、玄人、研究者の5モードで合計50問")).toBeVisible();
  await expect(page.getByRole("button", { name: /研究者モード/ })).toBeVisible();

  await page.getByRole("button", { name: "約2倍" }).click();
  await expect(page.getByText("正解").first()).toBeVisible();
  await expect(page.getByText("+3dBは電力で約2倍です。")).toBeVisible();
  await expect(page.getByRole("link", { name: /dBを体感する/ })).toBeVisible();
  await expect(page.getByText("現場コラム").first()).toBeVisible();
  await expect(page.getByText("1/50")).toBeVisible();

  await page.reload();
  await expect(page.getByText("1/50")).toBeVisible();
  await page.getByRole("button", { name: /ステージ1 dBのものさし/ }).click();
  await expect(page.getByText("攻略済み").first()).toBeVisible();
});

test("RF learning quest has researcher mode with recent-study sources", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");
  await page.getByRole("button", { name: /研究者モード/ }).click();

  await expect(page.getByRole("heading", { name: "最新研究の塔" })).toBeVisible();
  await expect(page.getByText("2025年の屋内LoRaWAN測定データ研究")).toBeVisible();
  await page.getByRole("button", { name: "温湿度、CO2、気圧、粒子状物質など" }).click();
  await expect(page.getByText("正解").first()).toBeVisible();
  await expect(page.getByText("RMSEが10.58dBから8.04dBへ改善")).toBeVisible();
  await expect(page.getByRole("link", { name: "2025 Indoor LoRaWAN environmental dataset" })).toBeVisible();
});

test("RF learning quest shows a level-up screen after five clears", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");

  await page.getByRole("button", { name: "約2倍" }).click();
  await page.getByRole("button", { name: /ステージ2 dBmの巻物/ }).click();
  await page.getByRole("button", { name: "1mW" }).click();
  await page.getByRole("button", { name: /ステージ3 距離2倍の試練/ }).click();
  await page.getByRole("button", { name: "約6dB増える" }).click();
  await page.getByRole("button", { name: /ステージ4 周波数の塔/ }).click();
  await page.getByRole("button", { name: "2.4GHz" }).click();
  await page.getByRole("button", { name: /ステージ5 アンテナ利得の剣/ }).click();
  await page.getByRole("button", { name: "受信電力が約3dB増える" }).click();

  await expect(page.getByText("レベルアップ")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lv.2 初心者" })).toBeVisible();
  await expect(page.getByText("5/50")).toBeVisible();
});
