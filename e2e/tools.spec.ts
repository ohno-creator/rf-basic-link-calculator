import { expect, test } from "@playwright/test";

const ALL_SLUGS = [
  "rf-basic-link-calculator",
  "free-space-loss",
  "fresnel-zone",
  "propagation-loss",
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
    { slug: "propagation-loss", h1: "伝搬損失（奥村-秦）", fig: "距離で見る伝搬損失" },
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
});

test("RF calculator explains that Hata antenna heights are not fixed", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await page.getByLabel("伝搬モデル").selectOption("okumura_hata");

  await expect(page.getByText("奥村・秦モデルの空中線地上高は固定ではありません")).toBeVisible();
  await expect(page.getByText(/送信側アンテナ高 .*基地局高 hb/).first()).toBeVisible();
  await expect(page.getByLabel("奥村・秦モデルのエリア種別")).toBeVisible();
  await page.getByLabel("奥村・秦モデルのエリア種別").selectOption("open");
  await expect(page.getByText("遮蔽物の少ない開放地として評価します。")).toBeVisible();
  await expect(page.getByRole("button", { name: "送信側アンテナ高を確認" })).toBeVisible();
});

test("RF calculator supports IoT calibrated Hata mode", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await page.getByLabel("伝搬モデル").selectOption("iot_hata_calibrated");

  await expect(page.getByText("IoT実測補正Hataモードの校正点")).toBeVisible();
  await expect(page.getByLabel("実測アンカー距離")).toBeVisible();
  const measuredPower = page.getByRole("spinbutton", { name: "実測受信電力" });
  await expect(measuredPower).toBeVisible();
  await expect(page.getByText("Urban LoRa大規模測定")).toBeVisible();

  await measuredPower.fill("-100");
  await expect(page.getByText(/実測受信電力から、基準モデルに対して/)).toBeVisible();
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
  await expect(page.getByText("ほぼ無視できる")).toBeVisible();
  await page.locator("#msFreq").fill("10000");
  await expect(page.getByText("大きい（要対策）")).toBeVisible();
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
    page.getByRole("heading", { name: /実測が生んだ式/ })
  ).toBeVisible();
  await expect(page.getByText("距離で見る伝搬損失")).toBeVisible();
});
