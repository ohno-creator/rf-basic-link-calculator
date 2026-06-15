import { expect, test } from "@playwright/test";

const ALL_SLUGS = [
  "rf-basic-link-calculator",
  "free-space-loss",
  "fresnel-zone",
  "propagation-loss",
  "frequency-wavelength",
  "dbm-converter",
  "vswr-return-loss",
  "coaxial-line-impedance",
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
    { slug: "coaxial-line-impedance", h1: "同軸線路インピーダンス", fig: "断面で見る特性インピーダンス" },
    { slug: "microstrip-line", h1: "マイクロストリップ線路", fig: "断面で見るマイクロストリップ" },
    { slug: "fresnel-zone", h1: "フレネルゾーン半径", fig: "経路で見るフレネルゾーン" },
    { slug: "propagation-loss", h1: "伝搬損失（奥村-秦）", fig: "距離で見る伝搬損失" },
    { slug: "frequency-wavelength", h1: "周波数・波長", fig: "半波長アンテナ長の目安" },
    { slug: "dbm-converter", h1: "dBm 変換", fig: "dBm / mW / W 変換" },
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
