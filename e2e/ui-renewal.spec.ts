import { expect, test } from "@playwright/test";

function normalizeResultText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

test.describe("目的別入口と検索URL", () => {
  test("5つの仕事から実ツールへ進める", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "いまの仕事から、使う計算を選ぶ。" })).toBeVisible();
    await expect(page.locator("#purpose-routes").getByRole("heading", { level: 3 })).toHaveCount(5);
    await expect(page.getByRole("link", { name: /比較を始める/ })).toHaveAttribute("href", /cable-position-comparison/);
  });

  test("検索とカテゴリをURLへ保存し戻る操作で復元する", async ({ page }) => {
    await page.goto("/?q=損失&category=line#tools");
    await expect(page.getByRole("searchbox", { name: "ツールを検索" })).toHaveValue("損失");
    await expect(page.getByRole("button", { name: /線路・整合/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /アンテナ設計/ }).click();
    await expect(page).toHaveURL(/category=antenna/);
    await page.goBack();
    await expect(page.getByRole("button", { name: /線路・整合/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("不明カテゴリはすべてへ戻し0件を通知する", async ({ page }) => {
    await page.goto("/?q=存在しない検索語&category=unknown#tools");
    await expect(page.getByRole("button", { name: /^すべて/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("0件", { exact: false }).first()).toBeVisible();
  });
});


test("検索の閉じるボタンはEnterで閉じ、別ページに移動しない", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "検索 ⌘K", exact: true }).click();
  const input = page.getByRole("combobox", { name: "ツールを検索" });
  await expect(input).toBeFocused();
  await input.press("Tab");
  await expect(page.getByRole("button", { name: "検索を閉じる" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "ツール検索" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("いまの仕事から、使う計算を選ぶ。");
});

test("簡易計算は空欄を未算出とし説明例で復帰する", async ({ page }) => {
  await page.goto("/tools/simple-link-budget/");
  const frequency = page.locator("#simpleFrequencyMHz");
  const distance = page.locator("#simpleDistance");
  await frequency.fill("");
  await expect(page.getByText("未入力・入力エラーのため未算出です。", { exact: false })).toBeVisible();
  await expect(frequency).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#simpleFrequencyMHz-error")).toContainText("0より大きい数値");
  await expect(distance).toHaveAttribute("aria-invalid", "false");
  await frequency.press("Tab");
  await expect(frequency).toHaveValue("");
  await page.getByRole("button", { name: "LPWA 920MHz / 1km", exact: true }).click();
  await expect(frequency).toHaveValue("920");
  await expect(frequency).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByText("+31.3 dB", { exact: true }).first()).toBeVisible();
});

test("簡易計算は項目ごとの有効な0と無効値を区別する", async ({ page }) => {
  await page.goto("/tools/simple-link-budget/");
  const primary = page.getByTestId("primary-result");
  const txPower = page.locator("#simpleTxPowerDbm");
  const gain = page.locator("#simpleGainTotal");
  const extraLoss = page.locator("#simpleExtraLoss");

  await txPower.fill("0");
  await gain.fill("0");
  await extraLoss.fill("0");
  await expect(txPower).toHaveAttribute("aria-invalid", "false");
  await expect(gain).toHaveAttribute("aria-invalid", "false");
  await expect(extraLoss).toHaveAttribute("aria-invalid", "false");
  await expect(primary).toBeVisible();

  await extraLoss.fill("-1");
  await expect(extraLoss).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#simpleExtraLoss-error")).toContainText("0以上の数値");
  await expect(primary).toHaveCount(0);
});

test("単位変更は同じ物理条件と計算結果を保つ", async ({ page }) => {
  await page.goto("/tools/free-space-loss/");
  const distance = page.getByRole("textbox", { name: "距離", exact: false });
  const fspl = page.locator("#fspl-primary-result");
  await expect(distance).toHaveValue("1");
  const beforeFspl = await fspl.innerText();
  await page.getByRole("combobox", { name: "距離の単位" }).selectOption("m");
  await expect(distance).toHaveValue("1000");
  expect(normalizeResultText(await fspl.innerText())).toBe(normalizeResultText(beforeFspl));

  await page.goto("/tools/noise-floor/");
  const bandwidth = page.getByRole("textbox", { name: "帯域幅 BW", exact: false });
  const sensitivity = page.locator("#noise-floor-primary-result");
  await expect(bandwidth).toHaveValue("125");
  const beforeSensitivity = await sensitivity.innerText();
  await page.getByRole("combobox", { name: "帯域幅の単位" }).selectOption("Hz");
  await expect(bandwidth).toHaveValue("125000");
  expect(normalizeResultText(await sensitivity.innerText())).toBe(normalizeResultText(beforeSensitivity));

  await page.goto("/tools/field-strength/");
  const fieldDistance = page.locator("#fsDistance");
  const fieldStrength = page.locator("#fs-primary-result");
  const beforeFieldStrength = await fieldStrength.innerText();
  await page.getByRole("combobox", { name: "距離の単位" }).selectOption("km");
  await expect(fieldDistance).toHaveValue("0.01");
  expect(normalizeResultText(await fieldStrength.innerText())).toBe(normalizeResultText(beforeFieldStrength));

  await page.goto("/tools/far-field-distance/");
  const dimension = page.locator("#ffDimension");
  const farField = page.locator("#ff-primary-result");
  const beforeFarField = await farField.innerText();
  await page.getByRole("combobox", { name: "寸法の単位" }).selectOption("m");
  await expect(dimension).toHaveValue("0.1");
  expect(normalizeResultText(await farField.innerText())).toBe(normalizeResultText(beforeFarField));

  await page.goto("/tools/battery-life/");
  const interval = page.locator("#batteryInterval");
  const batteryLife = page.locator("#battery-primary-result");
  const beforeBatteryLife = await batteryLife.innerText();
  await page.getByRole("combobox", { name: "動作間隔の単位" }).selectOption("minutes");
  await expect(interval).toHaveValue("60");
  expect(normalizeResultText(await batteryLife.innerText())).toBe(normalizeResultText(beforeBatteryLife));

  await page.goto("/tools/ncu-below-ground/");
  const ncuDistance = page.locator("#ncu-distance");
  const ncuResult = page.getByTestId("primary-result");
  const beforeNcuResult = await ncuResult.innerText();
  await page.getByRole("combobox", { name: "地上側距離の単位" }).selectOption("km");
  await expect(ncuDistance).toHaveValue("0.3");
  expect(normalizeResultText(await ncuResult.innerText())).toBe(normalizeResultText(beforeNcuResult));
});

test("電池寿命は無効な項目と周期超過の原因を入力欄ごとに示す", async ({ page }) => {
  await page.goto("/tools/battery-life/");

  const capacity = page.locator("#batteryCapacity");
  await capacity.fill("");
  await expect(capacity).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#batteryCapacity-error")).toContainText("0より大きい数値");
  await expect(page.locator("#battery-primary-result")).toContainText("—");

  await capacity.fill("2400");
  await page.locator("#batteryTxDuration").fill("4000000");
  const interval = page.locator("#batteryInterval");
  await expect(interval).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#batteryInterval-error")).toContainText("動作間隔以下");
  await expect(page.locator("#battery-primary-result")).toContainText("—");

  await page.locator("#batteryTxDuration").fill("50");
  await expect(interval).toHaveAttribute("aria-invalid", "false");
  await expect(page.locator("#battery-primary-result")).toContainText("34.1");
});

test("電池寿命エキスパートは適用範囲外を結果に使わない", async ({ page }) => {
  await page.goto("/tools/battery-life/");
  await page.getByRole("radio", { name: "エキスパート" }).click();

  const temperature = page.locator("#batteryTemperature");
  await temperature.fill("61");
  await expect(temperature).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#batteryTemperature-error")).toContainText("-20〜60℃");
  await expect(page.locator("#battery-primary-result")).toContainText("—");
  await expect(page.locator("#battery-primary-result a")).toHaveCount(0);

  await temperature.fill("25");
  const aging = page.locator("#batteryAging");
  await aging.fill("11");
  await expect(aging).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#batteryAging-error")).toContainText("0〜10年");
  await expect(page.locator("#battery-primary-result")).toContainText("—");

  await aging.fill("0");
  await expect(page.locator("#battery-primary-result")).not.toContainText("—");
});

test("電界強度と遠方界は空欄と受信条件の無効理由を項目別に示す", async ({ page }) => {
  await page.goto("/tools/field-strength/");
  const eirp = page.locator("#fsEirp");
  await eirp.fill("");
  await expect(eirp).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#fs-primary-result")).toContainText("—");
  await expect(page.locator("#fs-primary-result a")).toHaveCount(0);

  await eirp.fill("30");
  await page.getByTestId("fs-use-receiver").check();
  const frequency = page.locator("#fsFrequency");
  await frequency.fill("0");
  await expect(frequency).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#fsFrequency-error")).toContainText("0より大きい値");
  await expect(page.getByText("未算出（周波数・利得を確認）")).toBeVisible();

  await page.goto("/tools/far-field-distance/");
  const dimension = page.locator("#ffDimension");
  await dimension.fill("");
  await expect(dimension).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#ff-primary-result")).toContainText("—");
  await expect(page.locator("#ff-primary-result a")).toHaveCount(0);
});

test("総合診断は条件入力を先に見せ、結果詳細を必要時に開く", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  const result = page.locator("#guided-result-anchor");
  await expect(result).not.toHaveAttribute("open", "");
  await expect(page.getByRole("heading", { name: "どんな通信ですか？" })).toBeVisible();
  await page.getByRole("button", { name: "STEP 4 · 計算結果と次の行動を確認する" }).click();
  await expect(result).toHaveAttribute("open", "");
  await expect(result.getByRole("heading", { name: "リンクマージンゲージ" })).toBeVisible();
});

test("周波数用途地図はSVGをハイドレーションエラーなく表示する", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/tools/spectrum-use-atlas/");
  await expect(page.getByRole("heading", { level: 2, name: "30MHz〜30GHzの対数ものさし" })).toBeVisible();
  await page.waitForTimeout(100);
  expect(consoleErrors).toEqual([]);
});

test("ケーブル損失は無効な項目だけにエラーを表示する", async ({ page }) => {
  await page.goto("/tools/coaxial-cable-loss/");
  const frequency = page.locator("#cableFreq");
  const quantity = page.locator("#cableQty");

  await frequency.fill("");
  await expect(frequency).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#cableFreq-error")).toContainText("周波数は0より大きい値");
  await expect(quantity).toHaveAttribute("aria-invalid", "false");
  await expect(page.locator("#cableQty-error")).toHaveCount(0);
  await expect(page.locator("#coax-primary-result")).toContainText("—");

  await frequency.fill("2400");
  await quantity.fill("1.5");
  await expect(page.locator("#cableQty-error")).toContainText("1以上の整数");
  await expect(page.locator("#coax-primary-result")).toContainText("—");
});
