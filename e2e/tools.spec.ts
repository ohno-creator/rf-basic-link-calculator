import { expect, test } from "@playwright/test";
import { rfQuestLessons } from "../src/data/rfLearningQuestLessons";
import { toolDirectory } from "../src/data/toolDirectory";

test.describe("tool hub", () => {
  test("home lists every tool and links to its page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "無線設計の計算を、ひとつずつ。" })
    ).toBeVisible();

    for (const tool of toolDirectory) {
      await expect(page.locator(`a[href*="${tool.href}"]`).first()).toBeVisible();
    }
  });
});

test.describe("tool pages render with hero, diagram and explanation", () => {
  const pages = [
    { slug: "vswr-return-loss", h1: "VSWR・リターンロス変換", fig: "定在波で見るVSWR" },
    { slug: "coaxial-cable-loss", h1: "同軸ケーブル損失", fig: "ロス比較" },
    { slug: "microstrip-line", h1: "マイクロストリップ線路", fig: "断面で見るマイクロストリップ" },
    { slug: "fresnel-zone", h1: "フレネルゾーン半径", fig: "フレネルゾーン半径と障害物チェック" },
    { slug: "propagation-loss", h1: "伝搬損失モデル比較", fig: "現在距離" },
    { slug: "ncu-below-ground", h1: "GL以下NCU・水道BOX診断", fig: "NCUが地面より下にある場合" },
    { slug: "simple-link-budget", h1: "かんたんリンク計算", fig: "リンク余裕" },
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
      await expect(page.getByRole("heading", { name: "ほかのツール" })).toBeVisible();
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

test("RF calculator keeps each number field's intentional empty-value behavior", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await expect(page.getByTestId("rf-calculator-shell")).toHaveAttribute("data-hydrated", "true");

  const frequency = page.locator("#frequencyMHz");
  await frequency.fill("");
  await expect(frequency).toHaveValue("");
  await expect(page.getByText("周波数は0より大きい値をMHzで入力してください。").first()).toBeVisible();

  await frequency.fill("2000000");
  await frequency.blur();
  await expect(frequency).toHaveValue("6000");
  await frequency.fill("920");
  await frequency.blur();

  await page.getByRole("tab", { name: /研究ベース距離計算/ }).click();
  const researchFrequency = page.locator("#research-frequencyGHz");
  await expect(researchFrequency).toHaveValue("0.92");
  await researchFrequency.fill("");
  await researchFrequency.blur();
  await expect(researchFrequency).toHaveValue("0.92");
});

test("research distance delays the invalid-frequency banner while typing", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await page.getByRole("tab", { name: /研究ベース距離計算/ }).click();

  const researchFrequency = page.locator("#research-frequencyGHz");
  const invalidBanner = page.getByText("周波数が未入力または不正です");
  await researchFrequency.fill("0.");
  await expect(invalidBanner).toHaveCount(0);
  await page.waitForTimeout(400);
  await expect(invalidBanner).toBeVisible();
});

test("RF calculator explains that Hata antenna heights are not fixed", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await expect(page.getByTestId("rf-calculator-shell")).toHaveAttribute("data-hydrated", "true");
  await page.locator("#propagationModel").selectOption("okumura_hata");
  await expect(page.locator("#propagationArea")).toBeVisible();

  await expect(page.getByText("奥村・秦モデルの空中線地上高は固定ではなく、入力パラメータです")).toBeVisible();
  await expect(page.getByText(/送信側 空中線地上高 .*基地局高 hb/).first()).toBeVisible();
  await expect(page.getByText(/送信側空中線地上高 10\.0m/).first()).toBeVisible();
  await expect(page.getByText(/低い位置のゲートウェイと低高度端末/).first()).toBeVisible();
  await page.locator("#propagationArea").selectOption("open");
  await expect(page.getByText("遮蔽物の少ない開放地として評価します。")).toBeVisible();
  await page.locator('input[name="linkType"][value="cellular_base_station_to_iot_terminal"]').check({ force: true });
  await page.locator("#txAntennaHeightM").fill("30");
  await expect(page.getByText(/現在の入力条件は、モデルの一般的な適用範囲外/)).not.toBeVisible();
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
  await expect(page.getByText("計算値と現地RSSI/RSRPの差分をまとめて補正します。")).toBeVisible();
  await expect(page.getByRole("heading", { name: "コラム：奥村-秦モデルと最新IoT伝搬研究" })).toBeVisible();
  await expect(page.getByText("2025〜2026年の研究を追うと")).toBeVisible();
});

test("RF calculator diagrams show the two-ray interference lab synced with inputs", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  await expect(page.getByTestId("rf-calculator-shell")).toHaveAttribute("data-hydrated", "true");
  await page.locator("#frequencyMHz").fill("1500");
  await page.locator("#txAntennaHeightM").fill("20");
  await page.locator("#rxAntennaHeightM").fill("2");
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
  const measuredPower = page.getByRole("textbox", { name: "実測受信電力" });
  await expect(measuredPower).toBeVisible();
  await expect(page.getByText("Urban LoRa大規模測定")).toBeVisible();

  await measuredPower.fill("-100");
  await expect(page.getByText(/実測受信電力から、基準モデルに対して/)).toBeVisible();

  await page.getByRole("textbox", { name: "実測補正値" }).fill("5");
  await expect(page.getByText("実測補正値との二重計上を確認してください")).toBeVisible();
});

test("NCU below-ground page updates warnings and diagram from BOX conditions", async ({ page }) => {
  await page.goto("/tools/ncu-below-ground/");

  await expect(page.getByRole("button", { name: /現場前に見積もる/ })).toBeVisible();
  await expect(page.getByText("迷わない入力順")).toBeVisible();
  await expect(page.getByRole("heading", { name: "NCUが地面より下にある場合の断面図" })).toBeVisible();
  await expect(page.getByText("シミュレーション結果の2D図")).toBeVisible();
  await expect(page.getByText("GL以下のNCUは、奥村・秦モデルや2波モデルのアンテナ高にマイナス値")).toBeVisible();
  await expect(page.getByText("リンクマージンレンジ")).toBeVisible();

  await page.locator("#ncu-frequencyMHz").fill("915");
  await page.locator("#ncu-distance").fill("600");
  await page.getByRole("button", { name: "鋳鉄蓋", exact: true }).click();
  await page.getByRole("button", { name: "水が溜まる", exact: true }).click();
  await page.locator("#ncu-depth").fill("1.2");
  await page.getByRole("button", { name: "金属枠が強い", exact: true }).click();
  await page.getByRole("button", { name: "駐車車両で覆われる", exact: true }).click();

  await expect(page.getByTestId("ncu-assumption-diagram")).toContainText("915 MHz");
  await expect(page.getByTestId("ncu-assumption-diagram")).toContainText("600 m");
  await expect(page.getByTestId("ncu-assumption-diagram")).toContainText("鋳鉄蓋 / 22.0dB");
  await expect(page.getByTestId("ncu-assumption-diagram")).toContainText("水が溜まる / 20.0dB");
  await expect(page.getByTestId("ncu-assumption-diagram")).toContainText("金属枠が強い / 18.0dB");
  await expect(page.getByTestId("ncu-assumption-diagram")).toContainText("駐車車両で覆われる / 20.0dB");
  await expect(page.getByText("金属蓋は強い遮蔽")).toBeVisible();
  await expect(page.getByText("GL下深さが1m以上")).toBeVisible();
  await expect(page.getByText("GL下 1.20m")).toBeVisible();
  await expect(page.getByRole("link", { name: /リンクバジェット診断を開く/ })).toBeVisible();
});

test("NCU field analysis ranks causes from measurement deltas", async ({ page }) => {
  await page.goto("/tools/ncu-below-ground/");

  await page.getByRole("button", { name: /現場で原因を追い込む/ }).click();
  await expect(page.getByTestId("ncu-field-analysis")).toBeVisible();
  await expect(page.getByRole("heading", { name: "現場RSSI/RSRPから原因を追い込む" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "RSRQ・SNRなど通信品質指標の簡易診断" })).toBeVisible();

  await page.locator("#field-outsideBoxDbm").fill("-90");
  await page.locator("#field-boxOpenDbm").fill("-98");
  await page.locator("#field-boxClosedDryDbm").fill("-122");
  await page.locator("#field-boxClosedWetDbm").fill("-128");
  await page.locator("#field-vehicleCoveredDbm").fill("-136");

  await expect(page.getByText("#1 主因級").first()).toBeVisible();
  await expect(page.getByText("蓋・金属枠").first()).toBeVisible();
  await expect(page.getByText("実測補正値に反映")).toBeVisible();
  await page.getByRole("button", { name: /実測補正値に反映/ }).click();
  await expect(page.locator("#ncu-measuredCorrection")).not.toHaveValue("0");

  await page.locator("#metric-rsrpDbm").fill("-91");
  await page.locator("#metric-rsrqDb").fill("-18");
  await page.locator("#metric-sinrDb").fill("-3");
  await page.locator("#metric-packetSuccessPercent").fill("97");
  await page.locator("#metric-retryCount").fill("1");
  await expect(page.getByText("品質・干渉側が主因候補です")).toBeVisible();
  await expect(page.getByText("RSRQ").first()).toBeVisible();
  await expect(page.getByText("要対策").first()).toBeVisible();
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

test("propagation page warns when Hata is floored by free-space loss", async ({ page }) => {
  await page.goto("/tools/propagation-loss/");
  const floorWarning = page.getByText("経験式が自由空間損失を下回ったため下限値を表示");

  await expect(floorWarning).toHaveCount(0);
  await page.locator("#propFrequency").fill("1500");
  await page.locator("#propDistance").fill("1");
  await page.locator("#propTxHeight").fill("200");
  await page.locator("#propRxHeight").fill("10");
  await page.locator("#propArea").selectOption("open");
  await expect(floorWarning).toHaveCount(2);
  await expect(floorWarning.first()).toBeVisible();
  await expect(floorWarning.nth(1)).toBeVisible();

  await page.locator("#propArea").selectOption("urbanMedium");
  await expect(floorWarning).toHaveCount(0);
});

test("RF learning quest answers immediately and saves progress", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");
  await expect(
    page.getByRole("heading", { level: 1, name: "クエストで、アンテナ設計の判断を一つずつ固める" })
  ).toBeVisible();
  await expect(page.getByText("7モードで合計1000問")).toBeVisible();
  await expect(page.getByText("ことばカード図鑑")).toBeVisible();
  await expect(page.getByRole("link", { name: /アンテナ製品を見る/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /周波数からアンテナを探す/ }).first()).toBeVisible();
  await expect(page.getByText("第1章 STAGE 1-10")).toBeVisible();
  await expect(page.getByText("電波と単位の基礎").first()).toBeVisible();
  await expect(page.getByText("20章×10問")).toBeVisible();
  await expect(page.getByRole("button", { name: /研究者モード 100問/ })).toBeVisible();

  await page.getByRole("button", { name: "電波・高周波を扱う技術分野" }).click();
  await expect(page.getByText("正解").first()).toBeVisible();
  await expect(page.getByText("正解は「電波・高周波を扱う技術分野」です。")).toBeVisible();
  await expect(page.getByRole("link", { name: /リンクバジェット診断を開く/ })).toBeVisible();
  await expect(page.getByText("現場コラム").first()).toBeVisible();
  await expect(page.getByText("アンテナ設計の次の一手")).toBeVisible();
  await expect(page.getByRole("button", { name: "次の問題へ" })).toBeVisible();
  await expect(page.getByText("1/1000").first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("1/1000").first()).toBeVisible();
  await page.getByRole("button", { name: /ステージ1 RF/ }).click();
  await expect(page.getByText("攻略済み").first()).toBeVisible();
});

test("RF learning quest clears a wrong answer when the stage is clicked again", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");

  await page.getByRole("button", { name: "低周波の音だけを扱う分野" }).click();
  await expect(page.getByText("惜しい").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "回答をクリアして再挑戦" })).toBeVisible();

  await page.getByRole("button", { name: /ステージ1 RF/ }).click();
  await expect(page.getByText("惜しい")).not.toBeVisible();

  await page.getByRole("button", { name: "電波・高周波を扱う技術分野" }).click();
  await expect(page.getByText("正解").first()).toBeVisible();
  await expect(page.getByText("1/1000").first()).toBeVisible();
});

test("RF learning quest has researcher mode with recent-study sources", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");
  await page.getByRole("button", { name: /研究者モード 100問/ }).click();

  await expect(page.getByRole("heading", { name: "アンテナ研究と最新伝搬の塔" })).toBeVisible();
  await expect(page.getByText("2025年の屋内LoRaWAN測定データ研究")).toBeVisible();
  await page.getByRole("button", { name: "温湿度、CO2、気圧、粒子状物質など" }).click();
  await expect(page.getByText("正解").first()).toBeVisible();
  await expect(page.getByText("RMSEが10.58dBから8.04dBへ改善")).toBeVisible();
  await expect(page.getByRole("link", { name: "2025 Indoor LoRaWAN environmental dataset" })).toBeVisible();
});

test("RF learning quest unlocks certification exam and prepares PDF certificate", async ({ page }) => {
  const beginnerLessons = rfQuestLessons.filter((lesson) => lesson.mode === "beginner");
  const beginnerProgress = Object.fromEntries(beginnerLessons.map((lesson) => [lesson.id, true]));

  await page.addInitScript((progress) => {
    window.localStorage.setItem("rf-learning-quest-progress:v2", JSON.stringify(progress));
    window.print = () => {
      window.localStorage.setItem("rf-learning-quest-print-called", "yes");
    };
  }, beginnerProgress);

  await page.goto("/tools/rf-learning-quest/");
  await page.getByRole("button", { name: /初心者モード 100問/ }).click();
  await expect(page.getByText("初心者モード 修了試験")).toBeVisible();
  await expect(page.getByText("修了試験が解放されています。")).toBeVisible();

  await page.getByRole("button", { name: "修了試験を開始" }).click();
  const questions = page.getByTestId("cert-question");
  await expect(questions).toHaveCount(10);

  const firstQuestion = questions.first();
  const firstQuestionText = await firstQuestion.getByTestId("cert-question-text").innerText();
  const firstLesson = beginnerLessons.find((lesson) => lesson.question === firstQuestionText);
  expect(firstLesson).toBeTruthy();
  const wrongChoice = firstLesson!.choices.find((_, index) => index !== firstLesson!.correctIndex)!;
  await firstQuestion.getByRole("button", { name: wrongChoice, exact: true }).click();
  await expect(firstQuestion.getByText("再挑戦可")).toBeVisible();
  await firstQuestion.getByTestId("cert-question-title").click();
  await expect(firstQuestion.getByText("未回答")).toBeVisible();

  const questionCount = await questions.count();
  for (let index = 0; index < questionCount; index += 1) {
    const question = questions.nth(index);
    const questionText = await question.getByTestId("cert-question-text").innerText();
    const lesson = beginnerLessons.find((item) => item.question === questionText);
    expect(lesson).toBeTruthy();
    await question.getByRole("button", { name: lesson!.choices[lesson!.correctIndex], exact: true }).click();
  }

  await expect(page.getByText("100/100").first()).toBeVisible();
  await page.getByLabel("氏名").fill("島田 忠明");
  await page.getByLabel("会社名").fill("北陸電力送配電株式会社");
  await page.getByRole("button", { name: "PDF修了書を出力" }).click();
  await expect(page.getByText("PDF出力の準備ができました。印刷画面でPDF保存を選択してください。")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("rf-learning-quest-print-called")))
    .toBe("yes");
});

test("RF learning quest shows a level-up screen after five clears", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");
  await page.getByRole("button", { name: /初心者モード 100問/ }).click();

  await page.getByRole("button", { name: "約2倍" }).click();
  await page.getByRole("button", { name: /ステージ2 dBmの巻物/ }).click();
  await page.getByRole("button", { name: "1mW" }).click();
  await page.getByRole("button", { name: /ステージ3 距離2倍の試練/ }).click();
  await page.getByRole("button", { name: "約6dB増える" }).click();
  await page.getByRole("button", { name: /ステージ4 周波数の塔/ }).click();
  await page.getByRole("button", { name: "2.4GHz", exact: true }).click();
  await page.getByRole("button", { name: /ステージ5 アンテナ利得の剣/ }).click();
  await page.getByRole("button", { name: "受信電力が約3dB増える" }).click();

  await expect(page.getByText("レベルアップ")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lv.2 初学者" })).toBeVisible();
  await expect(page.getByText("5/1000").first()).toBeVisible();
});
