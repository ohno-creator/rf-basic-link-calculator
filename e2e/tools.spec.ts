import { expect, test } from "@playwright/test";
import { basicTools } from "../src/data/basicTools";
import { rfQuestLessons } from "../src/data/rfLearningQuestLessons";
import { toolDirectory } from "../src/data/toolDirectory";

test.describe("tool hub", () => {
  test("home lists every tool and links to its page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "無線設計を、目的から迷わず計算。" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "まずは総合診断" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "やりたいことに沿って、上から順に確認" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "すべての計算ツールから探す" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "電波が届くか確認したい" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "アンテナを実装したい" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "通信不良を切り分けたい" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "基礎から理解したい" })).toBeVisible();

    for (const tool of toolDirectory) {
      await expect(page.locator(`a[href*="${tool.href}"]`).first()).toBeVisible();
    }
  });

  test("home keeps its purpose-first structure readable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "無線設計を、目的から迷わず計算。" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "まずは総合診断" })).toBeVisible();
    await expect(page.getByRole("link", { name: /リンクバジェット診断を開く/ })).toBeVisible();
    await page.locator("#purpose-routes").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "電波が届くか確認したい" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
    { slug: "dbm-converter", h1: "dBm 変換", fig: "dBmと電力のスケール" },
    { slug: "db-feel", h1: "dBを体感する", fig: "dBの「ものさし」" },
    { slug: "free-space-loss", h1: "自由空間損失（FSPL）", fig: "距離ごとの損失比較" },
    { slug: "wall-penetration", h1: "壁・建材の透過損失バジェット", fig: "壁を1枚通るたびに信号が下がる" },
    { slug: "ifa-initial-dimensions", h1: "逆F・IFAアンテナ初期寸法", fig: "IFA上面図の読み方" },
    { slug: "l-match", h1: "L型整合回路計算", fig: "解1" },
    { slug: "antenna-isolation", h1: "2アンテナ間アイソレーション", fig: "アンテナ間隔と結合経路" },
    { slug: "diversity-gain", h1: "ダイバーシティ利得推定", fig: "独立時と相関補正後の利得" },
    { slug: "antenna-keepout", h1: "アンテナ・キープアウト領域チェック", fig: "確保した空き地と必要キープアウトの重なり" },
    { slug: "ground-plane-size", h1: "GNDプレーン寸法と効率", fig: "GNDプレーン最長辺と効率低下" },
    { slug: "body-loss", h1: "人体・手の影響ボディロス", fig: "装着シナリオ別のボディロス" },
    { slug: "battery-life", h1: "無線端末の電池寿命", fig: "平均電流の内訳" },
    { slug: "gnss-cn0", h1: "GNSS受信 C/N0バジェット", fig: "LNAを置く位置と後段雑音" },
    {
      slug: "lora-airtime",
      h1: "LoRa Time-on-Air・920MHz送信制限",
      fig: "同じパケットをSFだけ変えた送信時間"
    }
  ];

  for (const { slug, h1, fig } of pages) {
    test(`${slug} renders`, async ({ page }) => {
      await page.goto(`/tools/${slug}/`);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
      await expect(page.getByText(fig).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByRole("heading", { name: "ほかのツール" })).toBeVisible();
    });
  }
});

test.describe("G Tier2 tools", () => {
  test("diversity gain reacts to antenna spacing", async ({ page }) => {
    await page.goto("/tools/diversity-gain/");
    const primary = page.getByTestId("primary-result");
    const diagram = page.getByTestId("diversity-gain-diagram");
    await expect(primary).toContainText("9.72");
    const initialCorrelation = await diagram.getAttribute("data-correlation");

    await page.locator("#diversitySpacing").fill("0");
    await expect(primary).toContainText("0.00");
    await expect(diagram).toHaveAttribute("data-correlation", "1.0000");

    await page.locator("#diversitySpacing").fill("162.9");
    await expect.poll(() => diagram.getAttribute("data-correlation")).not.toBe("1.0000");
    expect(await diagram.getAttribute("data-correlation")).toBe(initialCorrelation);
  });

  test("LoRa airtime reacts to SF, payload and hourly limit", async ({ page }) => {
    await page.goto("/tools/lora-airtime/");
    const primary = page.getByTestId("primary-result");
    const diagram = page.getByTestId("lora-airtime-diagram");
    await expect(primary).toContainText("2302.0");
    await expect(diagram).toHaveAttribute("data-selected-sf", "12");

    await page.getByRole("button", { name: "SF7", exact: true }).click();
    await expect(primary).toContainText("97.5");
    await expect(diagram).toHaveAttribute("data-selected-sf", "7");

    await page.getByRole("button", { name: "SF12", exact: true }).click();
    await page.locator("#loraPayloadBytes").fill("100");
    await expect(primary).toContainText("3940.4");
    await expect(primary).toContainText("4秒上限に近い");

    await page.locator("#loraTransmissionsPerHour").fill("100");
    await expect(primary).toContainText("制限超過");
  });

  test("IFA dimensions react to frequency", async ({ page }) => {
    await page.goto("/tools/ifa-initial-dimensions/");
    const primary = page.getByTestId("primary-result");
    const diagram = page.getByTestId("ifa-dimensions-diagram");
    const initialEndX = await diagram.getAttribute("data-radiator-end-x");
    await expect(primary).toContainText("49.6");
    await page.locator("#ifaFrequency").fill("1840");
    await expect(primary).toContainText("24.8");
    await expect.poll(() => diagram.getAttribute("data-radiator-end-x")).not.toBe(initialEndX);
    const feedMinX = Number(await diagram.getAttribute("data-feed-min-x"));
    const feedMaxX = Number(await diagram.getAttribute("data-feed-max-x"));
    expect(feedMaxX).toBeGreaterThan(feedMinX);
  });

  test("L-match shows both closed-form solutions", async ({ page }) => {
    await page.goto("/tools/l-match/");
    const firstDiagram = page.getByTestId("l-match-diagram-0");
    await expect(page.getByTestId("primary-result")).toContainText("5.97 nH");
    await expect(page.getByText("11.93 pF").first()).toBeVisible();
    await expect(page.getByText("7.06 nH").first()).toBeVisible();
    await expect(firstDiagram).toHaveAttribute("data-topology", "shunt-then-series");
    await page.getByRole("button", { name: "100+j20Ω" }).click();
    await expect(firstDiagram).toHaveAttribute("data-topology", "series-then-shunt");
  });

  test("antenna isolation reacts to spacing", async ({ page }) => {
    await page.goto("/tools/antenna-isolation/");
    const primary = page.getByTestId("primary-result");
    const diagram = page.getByTestId("antenna-isolation-diagram");
    const initialAntennaX = Number(await diagram.getAttribute("data-antenna-2-x"));
    const initialStrokeWidth = Number(await diagram.getAttribute("data-path-stroke-width"));
    await expect(primary).toContainText("-11.7");
    await page.locator("#isolationSpacing").fill("325.8");
    await expect(primary).toContainText("-17.7");
    await expect.poll(() => diagram.getAttribute("data-antenna-2-x")).not.toBe(initialAntennaX.toFixed(2));
    const updatedAntennaX = Number(await diagram.getAttribute("data-antenna-2-x"));
    const updatedStrokeWidth = Number(await diagram.getAttribute("data-path-stroke-width"));
    expect(updatedAntennaX).toBeGreaterThan(initialAntennaX);
    expect(updatedStrokeWidth).toBeLessThan(initialStrokeWidth);
  });

  test("battery life reacts to derating", async ({ page }) => {
    await page.goto("/tools/battery-life/");
    const primary = page.getByTestId("primary-result");
    const curve = page.getByTestId("battery-life-curve-desktop");
    const initialYears = await curve.getAttribute("data-current-years");
    await expect(primary).toContainText("34.1");
    await page.locator("#batteryDerate").fill("100");
    await expect(primary).toContainText("48.7");
    await expect.poll(() => curve.getAttribute("data-current-years")).not.toBe(initialYears);
  });

  test("GNSS compares passive and active C/N0", async ({ page }) => {
    await page.goto("/tools/gnss-cn0/");
    const waterfall = page.getByTestId("gnss-cn0-waterfall-desktop");
    const initialOpenSky = await waterfall.getAttribute("data-open-sky-cn0");
    await expect(page.getByTestId("primary-result")).toContainText("45.4");
    await expect(page.getByText("40.0").first()).toBeVisible();
    await page.locator("#gnssCableLoss").fill("6");
    await expect(page.getByText("37.0").first()).toBeVisible();
    await page.locator("#gnssReceivedPower").fill("-140");
    await expect.poll(() => waterfall.getAttribute("data-open-sky-cn0")).not.toBe(initialOpenSky);
  });

  test("battery and GNSS use dedicated mobile chart layouts", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/tools/battery-life/");
    await expect(page.getByTestId("battery-life-curve-mobile")).toBeVisible();
    await expect(page.getByTestId("battery-life-curve-desktop")).toBeHidden();

    await page.goto("/tools/gnss-cn0/");
    await expect(page.getByTestId("gnss-cn0-waterfall-mobile")).toBeVisible();
    await expect(page.getByTestId("gnss-cn0-waterfall-desktop")).toBeHidden();
  });
});

test.describe("antenna research columns", () => {
  test("patch column follows the substrate input", async ({ page }) => {
    await page.goto("/tools/patch-antenna-dimensions/");
    await expect(page.getByRole("heading", { name: "コラム：パッチは、見えない電界のぶんだけ短く切る" })).toBeVisible();
    await expect(page.getByText("グラフを読み込み中")).toHaveCount(0);
    const fringe = page.getByTestId("patch-column-fringe");
    const initial = await fringe.textContent();
    await page.locator("#patch-antenna-dimensions-substrateHeightMm").fill("3.2");
    await expect.poll(() => fringe.textContent()).not.toBe(initial);
  });

  test("radiation column follows antenna kind", async ({ page }) => {
    await page.goto("/tools/radiation-resistance/");
    await expect(page.getByRole("heading", { name: "コラム：S11が良くても、電力は空へ出たとは限らない" })).toBeVisible();
    await expect(page.getByText("グラフを読み込み中")).toHaveCount(0);
    const resistance = page.getByTestId("radiation-column-resistance");
    const initial = await resistance.textContent();
    await page.locator("#short-antenna-kind").selectOption("dipole");
    await expect.poll(() => resistance.textContent()).not.toBe(initial);
  });

  test("small antenna column follows radius", async ({ page }) => {
    await page.goto("/tools/small-antenna-limit/");
    await expect(page.getByRole("heading", { name: "コラム：小型・高効率・広帯域は、同時に取り切れない" })).toBeVisible();
    await expect(page.getByText("グラフを読み込み中")).toHaveCount(0);
    const bandwidth = page.getByTestId("small-antenna-column-bandwidth");
    const initial = await bandwidth.textContent();
    await page.locator("#small-antenna-limit-radiusMm").fill("30");
    await expect.poll(() => bandwidth.textContent()).not.toBe(initial);
  });

  test("small loop column follows the loop diameter", async ({ page }) => {
    await page.goto("/tools/small-loop-resonance/");
    await expect(page.getByRole("heading", { name: "コラム：財布の中のアンテナは、アンテナではなかった" })).toBeVisible();
    const column = page.getByTestId("small-loop-column");
    const initial = await column.textContent();
    await page.locator("#small-loop-resonance-loopDiameterMm").fill("80");
    await expect.poll(() => column.textContent()).not.toBe(initial);
    await column.locator("summary").click();
    await expect(column.locator("a").first()).toBeVisible();
  });

  test("research columns fit mobile and expose their sources", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const slug of ["patch-antenna-dimensions", "radiation-resistance", "small-antenna-limit"]) {
      await page.goto(`/tools/${slug}/`);
      try {
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
          .toBe(true);
      } catch (error) {
        // 失敗時に「最も右へはみ出した最深要素」と祖先チェーンをCIログへ出力する
        // （Linuxフォントのみで再現するため、ローカルでは特定できない）
        const report = await page.evaluate(() => {
          const doc = document.documentElement;
          const limit = doc.clientWidth + 0.5;
          let worst: { el: Element; right: number; width: number } | null = null;
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const r = el.getBoundingClientRect();
            if (r.right > limit && (!worst || r.right > worst.right)) {
              worst = { el, right: r.right, width: r.width };
            }
          }
          if (!worst) {
            return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, chain: ["(no element found: margin/transform起因の可能性)"] };
          }
          // 最右端に達している最深の子孫まで降りる
          let node: Element = worst.el;
          let descended = true;
          while (descended) {
            descended = false;
            for (const child of Array.from(node.children)) {
              if (child.getBoundingClientRect().right >= worst.right - 0.5) {
                node = child;
                descended = true;
                break;
              }
            }
          }
          const describe = (el: Element) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            const cls = typeof el.className === "string" ? el.className.slice(0, 60) : "";
            const tid = el.getAttribute("data-testid");
            return `${el.tagName}${tid ? `[${tid}]` : ""}.${cls} w=${Math.round(r.width)} right=${Math.round(r.right)} minW=${cs.minWidth} ws=${cs.whiteSpace}`;
          };
          const chain: string[] = [`deepest text="${(node.textContent || "").slice(0, 60)}"`];
          let cur: Element | null = node;
          while (cur && cur !== document.body) {
            chain.push(describe(cur));
            cur = cur.parentElement;
          }
          return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, chain };
        });
        console.log(`[overflow:${slug}] scrollWidth=${report.scrollWidth} clientWidth=${report.clientWidth}\n${report.chain.join("\n")}`);
        throw error;
      }
      const column = page.getByTestId(`${slug.replace("-dimensions", "")}-column`);
      await column.locator("summary").click();
      await expect(column.locator("a").first()).toBeVisible();
    }
  });
});

test("basic tools keep the calculator and primary result near the first viewport", async ({ page }) => {
  // 基本ツール数に比例して増える走査回数に合わせてタイムアウトを動的算出（CI負荷込みで1ツール3.5秒を確保）
  test.setTimeout(Math.max(90_000, basicTools.length * 3_500));
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const tool of basicTools) {
    await page.goto(`/tools/${tool.slug}/`);
    const calculator = page.getByTestId("tool-calculator");
    await expect(calculator).toBeVisible();

    // ハイドレーションやレイアウト確定を待つため、期待する位置に収まるまで自動リトライ（poll）する
    await expect.poll(async () => {
      const box = await calculator.boundingBox();
      return box?.y ?? 999;
    }, {
      message: `${tool.slug}: calculator Y coordinate should be within 400px`,
      timeout: 5000
    }).toBeLessThanOrEqual(400);

    const primaryResult = page.getByTestId("primary-result").first();
    await expect(primaryResult, tool.slug).toBeVisible();

    await expect.poll(async () => {
      const resultBox = await primaryResult.boundingBox();
      return (resultBox?.y ?? 901) + (resultBox?.height ?? 0);
    }, {
      message: `${tool.slug}: primary result bottom coordinate should be within 900px`,
      timeout: 5000
    }).toBeLessThanOrEqual(900);
  }
});

test("VSWR diagram reacts to input", async ({ page }) => {
  await page.goto("/tools/vswr-return-loss/");
  const input = page.locator("#vswrValue");
  await input.fill("3");
  await expect(page.getByText("0.500").first()).toBeVisible();
  await expect(page.getByText("25.0%").first()).toBeVisible();
});

test("VSWR keeps its derived primary result visible beside the inputs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/vswr-return-loss/");

  await expect(page.getByRole("heading", { name: "入力条件" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "VSWR" })).toBeChecked();
  const primaryResult = page.getByTestId("primary-result");
  await expect(primaryResult).toBeVisible();
  const box = await primaryResult.boundingBox();
  expect((box?.y ?? 901) + (box?.height ?? 0)).toBeLessThanOrEqual(900);

  await page.locator("#vswrValue").fill("3");
  await expect(primaryResult).toContainText("1.25");
  await expect(primaryResult).toContainText("dB");
});

test("FSPL keeps its primary result visible beside the inputs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/free-space-loss/");

  await expect(page.getByRole("heading", { name: "入力条件" })).toBeVisible();
  const primaryResult = page.getByTestId("primary-result");
  await expect(primaryResult).toBeVisible();
  const box = await primaryResult.boundingBox();
  expect((box?.y ?? 901) + (box?.height ?? 0)).toBeLessThanOrEqual(900);

  await page.locator("#fsplFrequency").fill("2400");
  await expect(primaryResult).toContainText("dB");
  await expect(page.getByText("送信機 ● ))) ))) ))) ))) 受信機")).toHaveCount(0);
});

test("dBm converter keeps a derived primary result visible beside the input", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/dbm-converter/");

  await expect(page.getByRole("radio", { name: "dBm" })).toBeChecked();
  const primaryResult = page.getByTestId("primary-result");
  await expect(primaryResult).toBeVisible();
  const box = await primaryResult.boundingBox();
  expect((box?.y ?? 901) + (box?.height ?? 0)).toBeLessThanOrEqual(900);

  await page.locator("#dbInput").fill("30");
  await expect(primaryResult).toContainText("1000");
  await expect(primaryResult).toContainText("mW");
});

test("frequency tool keeps wavelength visible beside the input", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/frequency-wavelength/");
  const primaryResult = page.getByTestId("primary-result");
  await expect(primaryResult).toBeVisible();
  const box = await primaryResult.boundingBox();
  expect((box?.y ?? 901) + (box?.height ?? 0)).toBeLessThanOrEqual(900);
  await page.locator("#waveFrequency").fill("2400");
  await expect(primaryResult).toContainText("12.5cm");
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
  await expect(page.getByTestId("primary-result")).toContainText("×100");
});

test("dB feel keeps power ratio visible beside the slider", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/db-feel/");
  const primaryResult = page.getByTestId("primary-result");
  await expect(primaryResult).toBeVisible();
  const box = await primaryResult.boundingBox();
  expect((box?.y ?? 901) + (box?.height ?? 0)).toBeLessThanOrEqual(900);
});

test("coax tool keeps total loss visible beside the inputs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/coaxial-cable-loss/");
  const primaryResult = page.getByTestId("primary-result");
  await expect(primaryResult).toBeVisible();
  const box = await primaryResult.boundingBox();
  expect((box?.y ?? 901) + (box?.height ?? 0)).toBeLessThanOrEqual(900);
  await page.locator("#cableQty").fill("2");
  await expect(primaryResult).toContainText("dB");
});

test("RF calculator opens in guided mode with advice chips that apply on click", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");

  // 既定=かんたんモード: 3ステップとゲージ・次の一手が見える
  const guided = page.getByTestId("guided-link-budget");
  await expect(guided).toBeVisible();
  await expect(guided.getByText("どんな通信ですか？")).toBeVisible();
  await expect(page.getByTestId("guided-advice")).toBeVisible();

  // シナリオカードで前提を一括セット→距離スライダー表示が連動
  await page.getByTestId("guided-preset-lpwa-920").click();
  await expect(page.getByTestId("guided-distance-value")).toContainText("km");

  // 環境チップを金属近接へ→マージン悪化→「次の一手」に距離短縮チップが出る→クリックで距離が縮む
  await guided.getByRole("button", { name: /金属近接/ }).click();
  const before = await page.getByTestId("guided-distance-value").textContent();
  const distanceChip = page.getByTestId("guided-advice").getByRole("button", { name: /距離を約/ });
  if (await distanceChip.count()) {
    await distanceChip.click();
    await expect.poll(() => page.getByTestId("guided-distance-value").textContent()).not.toBe(before);
  }

  // 詳細モードへ切り替えるとクイック調整/解説付きの切替が現れ、値は引き継がれる
  await page.getByTestId("open-expert-mode").click();
  await expect(page.getByRole("button", { name: "クイック調整" })).toBeVisible();
  await page.getByRole("button", { name: "解説付き入力" }).click();
  await expect(page.getByRole("heading", { name: "リンクバジェット簡易診断", exact: true })).toBeVisible();
});

test("RF calculator switches to the research distance sheet", async ({ page }) => {
  await page.goto("/tools/rf-basic-link-calculator/");
  // 既定は「かんたん」モード→詳細モードへ。さらに全項目が見える「解説付き入力」表示に切り替える
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();
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
  // 既定は「かんたん」モード→詳細モードへ。さらに全項目が見える「解説付き入力」表示に切り替える
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();
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
  // 既定は「かんたん」モード→詳細モードへ。さらに全項目が見える「解説付き入力」表示に切り替える
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();
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
  // 既定は「かんたん」モード→詳細モードへ。さらに全項目が見える「解説付き入力」表示に切り替える
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();
  await expect(page.getByTestId("rf-calculator-shell")).toHaveAttribute("data-hydrated", "true");
  await page.locator("#propagationModel").selectOption("okumura_hata");
  await expect(page.locator("#propagationArea")).toBeVisible();
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();

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
  // 既定は「かんたん」モード→詳細モードへ。さらに全項目が見える「解説付き入力」表示に切り替える
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();

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
  // 既定は「かんたん」モード→詳細モードへ。さらに全項目が見える「解説付き入力」表示に切り替える
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();
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
  // 既定は「かんたん」モード→詳細モードへ。さらに全項目が見える「解説付き入力」表示に切り替える
  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();
  await page.locator("#propagationModel").selectOption("iot_hata_calibrated");
  await page.getByRole("button", { name: "解説付き入力" }).click();

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

test("RF calculator keeps compact controls beside the waterfall", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tools/rf-basic-link-calculator/?sys=LoRa+%2F+LoRaWAN&pm=log_distance&f=920&d=1&du=km&tx=13&el=3&rs=-120");
  await expect(page.getByTestId("rf-calculator-shell")).toHaveAttribute("data-hydrated", "true");

  const controls = page.getByRole("region", { name: "クイック調整" });
  const liveControls = page.getByRole("region", { name: "ライブ調整" });
  const compactResult = page.getByTestId("compact-result-summary");
  const chart = page.getByRole("img", { name: "送信電力から受信電力までのリンクバジェット滝グラフ" });
  await expect(controls).toBeVisible();
  await expect(liveControls).toBeVisible();
  await expect(compactResult).toBeVisible();
  await expect(chart).toBeVisible();
  await controls.evaluate((element) => {
    document.documentElement.style.scrollBehavior = "auto";
    element.scrollIntoView({ block: "start" });
  });

  const controlsBox = await controls.boundingBox();
  const resultBox = await compactResult.boundingBox();
  const chartBox = await chart.boundingBox();
  expect(controlsBox).not.toBeNull();
  expect(resultBox).not.toBeNull();
  expect(chartBox).not.toBeNull();
  expect(Math.max(controlsBox!.y, chartBox!.y)).toBeLessThan(Math.min(controlsBox!.y + controlsBox!.height, chartBox!.y + chartBox!.height));
  expect(resultBox!.y).toBeLessThan(chartBox!.y);
  expect(chartBox!.y + chartBox!.height).toBeLessThanOrEqual(900);

  await page.locator("#live-environment-loss").fill("8");
  await expect(page.locator("#live-environment-loss")).toHaveValue("8");
  await expect(page.locator("#environmentLossDb")).toHaveValue("8");
  await expect(chart).toBeVisible();

  await page.getByTestId("calculator-mode-expert").click();
  await page.getByRole("button", { name: "解説付き入力" }).click();
  await expect(page.locator("#environmentLossDb")).toHaveValue("8");
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
  // Field 移行で入力が type="number" → text になったため id で特定する。
  const width = page.locator("#msW");
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

test("fresnel long-distance mode subtracts earth curvature and shows the radio horizon", async ({ page }) => {
  await page.goto("/tools/fresnel-zone/");
  // 10km・中央・送受高50m・障害物5m: k=4/3の曲率降下は約1.47m（libの期待値テストと同一条件）
  await page.locator("#fresnelDist").fill("10");
  await page.locator("#fresnelTxH").fill("50");
  await page.locator("#fresnelRxH").fill("50");
  await page.locator("#fresnelObsH").fill("5");

  // 既定はOFF: 曲率控除の注記も見通し距離も出ない（従来動作）
  await expect(page.getByTestId("fresnel-curvature-drop")).toHaveCount(0);
  await expect(page.getByTestId("fresnel-horizon")).toHaveCount(0);

  await page.getByTestId("fresnel-long-distance-toggle").click();
  await expect(page.getByTestId("fresnel-curvature-drop")).toContainText("1.47m");
  // 見通し距離 4.12·(√50+√50) ≈ 58.3 km
  await expect(page.getByTestId("fresnel-horizon")).toContainText("58.3 km");

  // 低アンテナ高(3m/2m)・20kmでは見通し距離 ≈ 13.0 km を超えるため警告が出る
  await page.locator("#fresnelTxH").fill("3");
  await page.locator("#fresnelRxH").fill("2");
  await page.locator("#fresnelDist").fill("20");
  await expect(page.getByTestId("fresnel-horizon")).toContainText("13.0 km");
  await expect(page.getByTestId("fresnel-horizon")).toContainText("通信距離が見通し距離を超えています");
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

test("radio wave intuition renders chapters, animates the wave and tracks progress", async ({ page }) => {
  await page.goto("/tools/radio-wave-intuition/");

  // 第1章: 周波数スライダーで波長データ属性が変わる
  const waveSvg = page.getByTestId("intuition-wave-svg");
  await expect(waveSvg).toHaveAttribute("data-wavelength-mm", "326");
  await page.locator("#intuition-wave-freq").fill("3.39");
  await expect.poll(() => waveSvg.getAttribute("data-wavelength-mm")).not.toBe("326");

  // 体感済みトグル→進捗が1/6になり、リロード後も保持される
  await expect(page.getByTestId("intuition-progress")).toContainText("0/6");
  await page.getByTestId("intuition-done-toggle").click();
  await expect(page.getByTestId("intuition-progress")).toContainText("1/6");
  await page.reload();
  await expect(page.getByTestId("intuition-progress")).toContainText("1/6");

  // 章ナビで第2章へ移動できる
  await page.getByTestId("intuition-nav-decibel").click();
  await expect(page.getByTestId("intuition-chapter-decibel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "dBは『何倍』を数えるものさし" })).toBeVisible();
});

test("radio wave intuition chapters expose their columns and tool links", async ({ page }) => {
  await page.goto("/tools/radio-wave-intuition/");
  const chapterIds = ["wave", "decibel", "spread", "antenna", "obstacle", "noise"];
  for (const id of chapterIds) {
    await page.getByTestId(`intuition-nav-${id}`).click();
    const chapter = page.getByTestId(`intuition-chapter-${id}`);
    await expect(chapter).toBeVisible();
    // 各章に E1様式コラム（コラム：見出し）と実務ツールへの内部リンクがある
    await expect(chapter.getByRole("heading", { name: /^コラム：/ })).toBeVisible();
    await expect(chapter.locator('a[href^="/tools/"]').first()).toBeVisible();
  }
});

test("RF learning quest answers immediately and saves progress", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");
  await expect(
    page.getByRole("heading", { level: 1, name: "クエストで、アンテナ設計の判断を一つずつ固める" })
  ).toBeVisible();
  await expect(page.getByText("7モードで合計1060問")).toBeVisible();
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
  await expect(page.getByText("1/1060").first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("1/1060").first()).toBeVisible();
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
  await expect(page.getByText("1/1060").first()).toBeVisible();
});

test("RF learning quest keeps seeded choices stable until an answer is shown", async ({ page }) => {
  await page.goto("/tools/rf-learning-quest/");
  const choices = page.locator("button.min-h-16");
  const firstOrder = await choices.allInnerTexts();

  await page.reload();
  await expect(choices).toHaveCount(4);
  expect(await choices.allInnerTexts()).toEqual(firstOrder);

  await choices.first().click();
  await expect(
    page.getByText("正解", { exact: true }).or(page.getByText("惜しい", { exact: true }))
  ).toBeVisible();
  expect(await choices.allInnerTexts()).toEqual(firstOrder);
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
  await expect(page.getByText("5/1060").first()).toBeVisible();
});

test("noise floor tool derives LoRa SF12 sensitivity and links to the link budget", async ({ page }) => {
  await page.goto("/tools/noise-floor/");
  // 既定値 = LoRa SF12（BW125kHz・NF6dB・SNR-20dB）→ 感度 ≈ -137.0dBm
  await expect(page.getByTestId("primary-result")).toContainText("-137");
  await expect(page.getByTestId("primary-result")).toContainText("dBm");

  // SF7 プリセットで感度が浅くなる（-124.5dBm 付近）
  await page.getByRole("button", { name: "SF7", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("-124.5");

  // リンクバジェット診断への突き合わせ導線
  await expect(page.getByRole("link", { name: /リンクバジェット診断の受信感度/ })).toBeVisible();
});

test("eirp compliance tool judges 920MHz limits and reacts to gain and class changes", async ({ page }) => {
  await page.goto("/tools/eirp-compliance/");
  // 既定値 = 13dBm + 3dBi − 0.5dB → EIRP 15.5dBm（20mW型のEIRP上限16dBmに対し余裕+0.5dBで適合）
  // 期待値はlib（calculateEirpDbm）とdata層（aribT108PowerClasses.eirpLimitDbm=16）から検算した確定値
  await expect(page.getByTestId("primary-result")).toContainText("15.5");
  await expect(page.getByTestId("primary-result")).toContainText("dBm");
  await expect(page.getByText("適合（上限以下）")).toBeVisible();

  // アンテナ利得を10dBiへ → EIRP 22.5dBm > 上限16dBm で超過（利得交換で法規を破る実務の落とし穴）
  await page.locator("#eirpAntennaGain").fill("10");
  await expect(page.getByTestId("primary-result")).toContainText("22.5");
  await expect(page.getByTestId("tool-calculator").getByText("上限超過", { exact: true })).toBeVisible();

  // 登録局（250mW型・EIRP上限27dBm）へ切り替えると同じ構成でも適合に戻る
  await page.getByRole("button", { name: "登録局（250mW型）" }).click();
  await expect(page.getByText("適合（上限以下）")).toBeVisible();
});

test("shadowing margin derives the required margin from sigma and reliability", async ({ page }) => {
  await page.goto("/tools/shadowing-margin/");
  // 既定値 σ=8dB・信頼率90% → 8×Φ⁻¹(0.9)=8×1.281552 ≈ 10.3dB
  await expect(page.getByTestId("primary-result")).toContainText("10.3");
  await expect(page.getByTestId("primary-result")).toContainText("dB");

  // 信頼率99%チップ → 8×2.326348 ≈ 18.6dB
  await page.getByRole("button", { name: "99%", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("18.6");

  // 郊外プリセット（σ=6dB）× 99% → 6×2.326348 ≈ 14.0dB
  await page.getByRole("button", { name: "郊外 6dB", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("14.0");

  // リンクバジェット診断への突き合わせ導線
  await expect(page.getByTestId("tool-calculator").getByRole("link", { name: /リンクバジェット診断/ })).toBeVisible();
});

test("shadowing expert mode derives Jakes area coverage", async ({ page }) => {
  await page.goto("/tools/shadowing-margin/");
  const calculator = page.getByTestId("tool-calculator");
  await calculator.getByRole("radio", { name: "エキスパート" }).click();
  await calculator.getByRole("button", { name: "3.5", exact: true }).click();
  await expect(calculator.getByTestId("area-coverage-table")).toContainText("96.57%");
  await expect(calculator.getByTestId("area-coverage-disk")).toHaveAttribute("data-area-coverage", "96.57");

  await calculator.getByRole("button", { name: "50%", exact: true }).click();
  await expect(calculator.getByTestId("area-coverage-disk")).toHaveAttribute("data-area-coverage", "75.45");
});

test("polarization loss tool computes linear 45deg default and switches polarization modes", async ({ page }) => {
  await page.goto("/tools/polarization-loss/");
  // 既定値 = 直線-直線 θ=45° → -20log10(cos45°) = 3.0103 ≈ 3.0dB
  await expect(page.getByTestId("primary-result")).toContainText("3.0");
  await expect(page.getByTestId("primary-result")).toContainText("dB");

  // θ=60° チップ → -20log10(cos60°) = 6.0206 ≈ 6.0dB
  await page.getByRole("button", { name: "60°", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("6.0");

  // 円↔円（既定は同旋）→ 0.0dB
  await page.getByRole("button", { name: "円 ↔ 円", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("0.0");

  // 逆旋 → 理論∞（表示は lib の POLARIZATION_LOSS_DISPLAY_CAP_DB=40dB でクランプし「≥40」）
  await page.getByRole("button", { name: /逆旋/ }).click();
  await expect(page.getByTestId("primary-result")).toContainText("≥40");

  // リンクバジェット診断（追加損失）への突き合わせ導線
  await expect(page.getByRole("link", { name: /リンクバジェット診断の追加損失/ })).toBeVisible();
});

test("rain attenuation tool combines P.838 rain and P.676 gaseous loss", async ({ page }) => {
  await page.goto("/tools/rain-attenuation/");
  // 既定値 28GHz・強雨25mm/h・水平偏波・1km → 降雨4.62dB＋大気ガス0.10dB = 4.72dB
  // （P.838-3 Table 5: 28GHzは kH=0.2051, αH=0.9679 → γ=0.2051×25^0.9679=4.6241dB/km。
  //   P.676-13 標準大気: γgas(28GHz)=0.1008dB/km。合計4.7249dB）
  await expect(page.getByTestId("primary-result")).toContainText("4.72");
  await expect(page.getByTestId("primary-result")).toContainText("dB");

  // 垂直偏波では扁平な雨滴の断面が小さく見えて減衰が減る（kV=0.1964, αV=0.9277 → 合計3.9913dB）
  await page.getByRole("button", { name: "垂直偏波", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("3.99");

  // 雨マージン設計へつなぐ導線
  await expect(page.getByRole("link", { name: /リンクバジェット診断の追加損失/ })).toBeVisible();
});

// e2e/tools.spec.ts の pages 配列へ追加する1行:

// 主結果の確定値テスト（別 test として追加）。既定 VSWR=2 →
// mismatchRangeImpact(2): ML=0.5115…dB, distanceImpactPercent=-5.719…%, reflectedPowerPercent=11.11%
// ResultBar は formatNumber(distanceImpactPercent, 1) = "-5.7"。内訳は ML=formatNumber(_,2)="0.51"、反射電力=formatNumber(_,1)="11.1"。
test("mismatch-range-impact primary result", async ({ page }) => {
  await page.goto("/tools/mismatch-range-impact/");
  const primary = page.getByTestId("primary-result");
  await expect(primary).toContainText("-5.7"); // 距離への影響[%]（自由空間・既定VSWR=2）
  await expect(page.getByText("0.51 dB").first()).toBeVisible(); // ミスマッチ損失 ML
  await expect(page.getByText("11.1 %").first()).toBeVisible();   // 反射電力
});

test("desense reacts to interference level (power addition)", async ({ page }) => {
  await page.goto("/tools/desense/");
  const primary = page.getByTestId("primary-result");
  // 既定 N=-120dBm・I=-120dBm（同レベル）→ Δ=10log10(2)=+3.01dB
  await expect(primary).toContainText("3.0");
  await expect(primary).toContainText("dB");
  // 干渉をフロアより10dB下（-130dBm）にすると Δ=10log10(1.1)=+0.41dB（非線形）
  await page.locator("#desenseInterference").fill("-130");
  await expect(primary).toContainText("0.4");
});

test("measurement sampling tool derives required sample count and reacts to confidence", async ({ page }) => {
  await page.goto("/tools/measurement-sampling/");
  // 既定 = 信頼水準95%・σ8dB・E1dB → n=(1.96×8/1)²≈245.85 → ceil=246点
  // 期待値はlib（requiredSampleCount）から検算した確定値
  await expect(page.getByTestId("primary-result")).toContainText("246");
  await expect(page.getByTestId("primary-result")).toContainText("点");

  // 90%へ下げると許容が緩みnが減る: z=1.6449 → (1.6449×8)²≈173.16 → 174点
  await page.getByRole("button", { name: "90%", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("174");

  // 99%へ上げるとnが増える: z=2.5758 → (2.5758×8)²≈424.63 → 425点
  await page.getByRole("button", { name: "99%", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("425");
});

test("electrical length converts mm to phase and reacts to frequency", async ({ page }) => {
  await page.goto("/tools/electrical-length/");
  const primary = page.getByTestId("primary-result");
  // default: 920MHz, VF=0.695, L=100mm -> phase 360*100/(0.695*(c/920e6)*1000) = 158.96° -> "159.0"
  await expect(primary).toContainText("159.0");
  await expect(primary).toContainText("°");
  // double the frequency -> lambda_g halves -> phase doubles to 317.9°
  await page.locator("#elFrequency").fill("1840");
  await expect(primary).toContainText("317.9");
});

test("LTE signal metrics converts RSSI to RSRP and reacts to bandwidth and direction", async ({ page }) => {
  await page.goto("/tools/lte-signal-metrics/");
  const primary = page.getByTestId("primary-result");
  // 既定 RSSI=-70dBm・10MHz(50RB) → RSRP = -70 − 10log10(12×50) = -70 − 27.78 ≈ -97.8dBm
  // 期待値はlib（rsrpFromRssi/fullLoadCorrectionDb）から検算した確定値
  await expect(primary).toContainText("-97.8");
  await expect(primary).toContainText("dBm");

  // 20MHz(100RB)へ切替 → 補正 30.79dB、RSRP = -70 − 30.79 ≈ -100.8dBm
  await page.getByRole("button", { name: /20MHz/ }).click();
  await expect(primary).toContainText("-100.8");

  // 換算方向を反転（RSRP→RSSI）: 入力-70をRSRPとみなし 20MHz → RSSI = -70 + 30.79 ≈ -39.2dBm
  await page.getByRole("button", { name: "RSRP → RSSI" }).click();
  await expect(primary).toContainText("-39.2");

  // ノイズフロア・受信感度への突き合わせ導線
  await expect(page.getByTestId("tool-calculator").getByRole("link", { name: /ノイズフロア・受信感度/ })).toBeVisible();
});

test("VSWR bandwidth-Q converts between Q and fractional bandwidth", async ({ page }) => {
  await page.goto("/tools/vswr-bandwidth-q/");
  // 既定 = Q→帯域幅・Q=50・VSWR≤2 → FBW=(2−1)/(50·√2)=1.4142% → 表示1.4%
  // 期待値はlib（fractionalBandwidthPercentFromQ(50,2)）から検算した確定値
  const primary = page.getByTestId("primary-result");
  await expect(primary).toContainText("1.4");
  await expect(primary).toContainText("%");

  // VSWR≤3 チップ → (3−1)/(50·√3)=2.3094% → 表示2.3%（同じQでも緩い上限ほど帯域は広い）
  await page.getByRole("button", { name: "VSWR≤3.0", exact: true }).click();
  await expect(primary).toContainText("2.3");

  // Chu限界（小型アンテナ限界）への突き合わせ導線
  await expect(page.getByTestId("tool-calculator").getByRole("link", { name: /小型アンテナ限界/ })).toBeVisible();
});

test("pointing margin derives gain loss and inverts to allowable offset", async ({ page }) => {
  await page.goto("/tools/pointing-margin/");
  // 既定 HPBW=65°・θ=10° → L=12·(10/65)²≈0.28dB（pointingLossDbで検算した確定値）
  await expect(page.getByTestId("primary-result")).toContainText("0.28");
  await expect(page.getByTestId("primary-result")).toContainText("dB");

  // 損失→許容角モード + 許容損失3dB → 65·√(3/12)=32.5°（allowableOffsetDegで検算した確定値）
  await page.getByRole("button", { name: "損失 → 許容角" }).click();
  await page.getByRole("button", { name: "3dB", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("32.5");

  // 開口利得・ビーム幅（HPBW≈70λ/D）への突き合わせ導線
  await expect(page.getByTestId("tool-calculator").getByRole("link", { name: /開口利得・ビーム幅/ })).toBeVisible();
});

test("metal plane effect derives +6dB at quarter-wave and collapses at contact", async ({ page }) => {
  await page.goto("/tools/metal-plane-effect/");
  // 既定 920MHz・d=λ/4相当(81.5mm) → ΔG=20log10(2)=6.0206 ≈ +6.0dB（libで検算した確定値）
  await expect(page.getByTestId("primary-result")).toContainText("+6.0");
  await expect(page.getByTestId("primary-result")).toContainText("dB");

  // 金属板に密着（d=0）→ 逆相の鏡像で相殺し理論∞、表示は床(-40)で ≤-40dB
  await page.locator("#metalDistance").fill("0");
  await expect(page.getByTestId("primary-result")).toContainText("-40");

  // 2.4GHzプリセットは最適離隔 λ/4(31.2mm) にも自動セットするので +6.0 に戻る
  await page.getByRole("button", { name: "2.4GHz", exact: true }).click();
  await expect(page.getByTestId("primary-result")).toContainText("+6.0");

  // リンクバジェット診断（アンテナ利得）への突き合わせ導線
  await expect(page.getByRole("link", { name: /リンクバジェット診断のアンテナ利得/ })).toBeVisible();
});

test("LTE signal metrics judges RSRP quality band and reacts to mode switch", async ({ page }) => {
  await page.goto("/tools/lte-signal-metrics/");
  const calculator = page.getByTestId("tool-calculator");
  // 既定 RSSI=-70dBm・10MHz(50RB) → RSRP≈-97.8dBm（判定入力の前提を primary-result で確認）
  await expect(calculator.getByTestId("primary-result")).toContainText("-97.8");
  // LTE-M では -100〜-90dBm の Fair 帯（judgeCellularSignal で検算した確定値）
  const badge = calculator.getByTestId("cellular-judge-level");
  await expect(badge).toContainText("Fair");
  // NB-IoT へ切替 → 同じ -97.8dBm は -105〜-95dBm の Good 帯に入り、判定バッジが変わる
  await calculator.getByRole("button", { name: /NB-IoT/ }).click();
  await expect(badge).toContainText("Good");
});

test("antenna keepout verdict reacts to the available area", async ({ page }) => {
  await page.goto("/tools/antenna-keepout/");
  const calculator = page.getByTestId("tool-calculator");
  const primary = calculator.getByTestId("primary-result");
  await expect(primary).toBeVisible();
  // 既定: チップ×2.4GHz（必要10×4mm）に確保12×5mm → 充足・不足量ゼロ
  await expect(primary).toContainText("キープアウト充足");
  await expect(primary).toContainText("0.0 / 0.0");
  // 幅を7mmへ → 幅3mm不足（不足率30%）で NG 判定・不足量表示が変わる
  await calculator.locator("#keepoutWidth").fill("7");
  await expect(primary).toContainText("20%以上不足");
  await expect(primary).toContainText("3.0 / 0.0");
});

test("wall penetration tool sums material losses per band and reacts to wall counts", async ({ page }) => {
  await page.goto("/tools/wall-penetration/");
  const calculator = page.getByTestId("tool-calculator");

  // 既定値 = 920MHz・石膏ボード×2＋コンクリート内壁×1 → 合計 10.0〜19.0dB
  // 期待値はlib（sumWallLoss）とdata層（wallMaterials: 1.0×2+8.0 / 2.0×2+15.0）から検算した確定値
  await expect(calculator.getByTestId("primary-result")).toContainText("10.0〜19.0");
  await expect(calculator.getByTestId("primary-result")).toContainText("dB");

  // 帯域チップ 2.4GHz で再計算（1.5×2+12=15.0 / 3.0×2+20=26.0）
  await calculator.getByRole("button", { name: "2.4GHz", exact: true }).click();
  await expect(calculator.getByTestId("primary-result")).toContainText("15.0〜26.0");

  // 枚数カウンタで線形加算（石膏ボード+1枚 → 1.5×3+12=16.5 / 3.0×3+20=29.0）
  await calculator.getByRole("button", { name: "石膏ボード（内壁）を1枚増やす" }).click();
  await expect(calculator.getByTestId("primary-result")).toContainText("16.5〜29.0");

  // リンクバジェット診断（環境損失）への導線
  await expect(calculator.getByRole("link", { name: /リンクバジェット診断の環境損失/ })).toBeVisible();
});

test("body loss tool looks up literature values per scenario and band", async ({ page }) => {
  await page.goto("/tools/body-loss/");
  const calculator = page.getByTestId("tool-calculator");
  // 既定値 = 2.4GHz × 手持ち → Typ 5.0dB（data層 BODY_LOSS_TABLE の文献値。Worst 10dB）
  await expect(calculator.getByTestId("primary-result")).toContainText("5.0");
  await expect(calculator.getByTestId("primary-result")).toContainText("dB");

  // 体による遮蔽 × 2.4GHz → Typ 18.0dB（文献レンジ 18.0〜30.0dB）
  await calculator.getByRole("button", { name: "体による遮蔽" }).click();
  await expect(calculator.getByTestId("primary-result")).toContainText("18.0");
  await expect(calculator.getByText("18.0〜30.0")).toBeVisible();

  // GNSS L1 × 頭部近接 = 文献データなしの組合せ（null。0dBとみなさない）
  await calculator.getByRole("button", { name: "頭部近接" }).click();
  await calculator.getByRole("button", { name: "1575MHz" }).click();
  await expect(calculator.getByTestId("primary-result")).toContainText("—");
  await expect(calculator.getByText("この組合せの文献データがありません")).toBeVisible();
});

test("detuning estimator judges whether the shifted resonance stays in band", async ({ page }) => {
  await page.goto("/tools/detuning-estimator/");
  const calculator = page.getByTestId("tool-calculator");
  const primary = calculator.getByTestId("primary-result");

  // 既定 920MHz・BW46MHz（比帯域5%）・樹脂カバー3mm → シフト-4.6〜-9.2MHz・帯域端±23MHz内 → 収まる
  // （estimateDetuning({920,46,"resin-cover-3mm"}) で検算した確定値）
  await expect(primary).toContainText("収まる");

  // 手把持（-4.0〜-8.0%）→ 最小シフト-36.8MHzでも帯域端(-23MHz)を超える → 外れる
  await calculator.getByRole("button", { name: "手把持", exact: true }).click();
  await expect(primary).toContainText("外れる");

  // 比帯域10%（BW92MHz・帯域端±46MHz）→ 最小-36.8MHzは収まり最大-73.6MHzは外れる → 一部外れ
  await calculator.getByRole("button", { name: "比帯域10%", exact: true }).click();
  await expect(primary).toContainText("一部外れ");

  // 金属面近接の利得変化への突き合わせ導線
  await expect(calculator.getByRole("link", { name: /金属面近接の利得変化/ })).toBeVisible();
});

test("ground plane size tool shows the Lg/λ efficiency drop and reacts to length and frequency", async ({ page }) => {
  await page.goto("/tools/ground-plane-size/");
  const calculator = page.getByTestId("tool-calculator");
  // 既定 920MHz・Lg=32.6mm → Lg/λ≈0.100 → 効率低下 ≈ -6.0dB（データ表の区分線形補間・libで検算した確定値）
  await expect(calculator.getByTestId("primary-result")).toContainText("-6.0");
  await expect(calculator.getByTestId("primary-result")).toContainText("dB");

  // 2.4GHzプリセット: 同じ Lg=32.6mm でも λ=124.9mm と短くなり Lg/λ≈0.261 ≥ 0.25 → 低下 0dB（クランプ）
  await calculator.getByRole("button", { name: "2.4GHz", exact: true }).click();
  await expect(calculator.getByTestId("primary-result")).toContainText("0.0");

  // GND最長辺を 0（GNDなし）へ → 目安表の下端 -20.0dB
  await calculator.locator("#gpGroundLength").fill("0");
  await expect(calculator.getByTestId("primary-result")).toContainText("-20.0");
});

test("db family links dBi to dBd and validates the addition checker", async ({ page }) => {
  await page.goto("/tools/db-family/");
  const calculator = page.getByTestId("tool-calculator");

  // 既定 利得6dBi → dBd表示は 6−2.15=3.85（dbiToDbd/DIPOLE_GAIN_DBIで検算した確定値）
  await expect(calculator.getByTestId("db-family-gain-svg")).toHaveAttribute("data-dbd", "3.85");
  // 0dBi へ → dBdは −2.15（等方基準の0は、ダイポール基準では負になる）
  await calculator.locator("#dbFamilyGain").fill("0");
  await expect(calculator.getByTestId("db-family-gain-svg")).toHaveAttribute("data-dbd", "-2.15");

  // チェッカー既定: 13dBm ＋ アンテナ利得3dBi ＝ 16dBm（有効・dBm+比率）
  const checker = calculator.getByTestId("db-family-checker");
  await expect(checker).toHaveAttribute("data-valid", "true");
  await expect(calculator.getByTestId("primary-result")).toContainText("16.0");

  // 2つ目を 20dBm へ → dBm+dBm は無効。電力和 10log10(10^1.3+10^2)≈20.8dBm を提示（combinePowersDbmで検算）
  await calculator.locator("#dbFamilyTermB").selectOption("tx20");
  await expect(checker).toHaveAttribute("data-valid", "false");
  await expect(checker).toContainText("足し算できません");
  await expect(calculator.getByTestId("primary-result")).toContainText("20.8");
});

test("cellular band map matches bands to the frequency and reacts to input", async ({ page }) => {
  await page.goto("/tools/cellular-band-map/");
  const calculator = page.getByTestId("tool-calculator");
  const primary = calculator.getByTestId("primary-result");
  const map = calculator.getByTestId("cellular-band-map");

  // 既定 900MHz → B8 の UL帯（880-915MHz）のみ該当（findBandsByFrequency で検算した確定値）
  await expect(primary).toContainText("1");
  await expect(primary).toContainText("バンド");
  await expect(map).toHaveAttribute("data-hit-bands", "B8");
  await expect(map).toHaveAttribute("data-selected-band", "B8");
  await expect(calculator.getByTestId("band-detail")).toContainText("880");

  // 入門モードのキャリア点灯は検索周波数と独立し、楽天のB3/B28/n77/n257を強調する。
  await calculator.getByRole("button", { name: "楽天モバイル", exact: true }).click();
  await expect(map).toHaveAttribute("data-carrier-bands", "B3,B28,n77,n257");

  // 3500MHz に変更 → TDDが重なる B42・n77・n78 の3バンドが該当し、主結果も3に変わる
  await calculator.locator("#bandMapFrequency").fill("3500");
  await expect(map).toHaveAttribute("data-hit-bands", "B42,n77,n78");
  await expect(primary).toContainText("3");

  // 該当バンドのチップから n78 を選択 → 地図の選択状態と詳細カードが n78（TDD 3300-3800MHz）へ切り替わる
  await calculator.getByRole("button", { name: "n78（TDD）" }).click();
  await expect(map).toHaveAttribute("data-selected-band", "n78");
  const detail = calculator.getByTestId("band-detail");
  await expect(detail).toHaveAttribute("data-band", "n78");
  await expect(detail).toContainText("3300");
});

test("cellular band map v3 switches five modes and drills down carrier data", async ({ page }) => {
  await page.goto("/tools/cellular-band-map/");
  const calculator = page.getByTestId("tool-calculator");

  // 初期表示は従来互換の入門モード。
  await expect(calculator.getByRole("radio", { name: "入門" })).toHaveAttribute("aria-checked", "true");
  await expect(calculator.getByTestId("cellular-band-map")).toBeVisible();

  // 実務: 日本4キャリアを切り替え、楽天の700MHz商用開始とIoT試験段階を確認。
  await calculator.getByRole("radio", { name: "実務" }).click();
  await calculator.getByRole("button", { name: "楽天モバイル" }).click();
  const profile = calculator.getByTestId("carrier-profile");
  await expect(profile).toHaveAttribute("data-carrier", "jp-rakuten");
  await expect(profile).toContainText("700MHzプラチナバンド");
  await expect(profile).toContainText("未商用");
  await expect(profile).toContainText("UL 715–718 / DL 770–773 MHz");
  await expect(profile).toContainText("3MHz×2");

  // 世界: 韓国3社の28GHzは現役Bandではなく取消履歴として表示。
  await calculator.getByRole("radio", { name: "世界" }).click();
  await calculator.getByRole("button", { name: "韓国" }).click();
  await expect(calculator.getByTestId("carrier-profile")).toContainText("免許取消");

  // 検索一覧: Band/キャリア/IoT語を横断検索できる。
  await calculator.getByRole("radio", { name: "検索一覧" }).click();
  await calculator.getByTestId("carrier-search").fill("B14");
  await expect(calculator.getByTestId("carrier-search-results")).toContainText("AT&T / FirstNet");
});

test.describe("OTA implementation loss / desense analysis", () => {
  test("ota-implementation-loss separates desense and reacts to inputs", async ({ page }) => {
    await page.goto("/tools/ota-implementation-loss/");
    const calculator = page.getByTestId("tool-calculator");
    const primary = calculator.getByTestId("primary-result");
    const diagram = calculator.getByTestId("ota-desense-diagram");

    // 既定（LTE-M B1の例: Pc23/Sc-108/η-3/TRP19.5/TIS-102）
    // → trpGap=0.5, tisGap=3.0, デセンス=2.5dB（要注意）
    await expect(primary).toContainText("2.5");
    await expect(primary).toContainText("要注意");
    await expect(diagram).toHaveAttribute("data-desense", "2.50");

    // TISを-101へ悪化 → tisGap=4.0, デセンス=3.5dB（ノイジー）
    await calculator.locator("#otaTis").fill("-101");
    await expect(primary).toContainText("3.5");
    await expect(primary).toContainText("ノイジー");
    await expect(diagram).toHaveAttribute("data-desense", "3.50");

    // TRPも悪化（19.5→19）→ trpGap=1.0, デセンス=3.0dB（境界はcaution側）
    await calculator.locator("#otaTrp").fill("19");
    await expect(diagram).toHaveAttribute("data-desense", "3.00");
    await expect(primary).toContainText("要注意");

    // Band切替（B8: Pc23/Sc-108/η-4/TRP18/TIS-99）→ trpGap=1.0, tisGap=5.0, デセンス=4.0dB
    await calculator.getByRole("button", { name: "LTE-M B8（例）", exact: true }).click();
    await expect(primary).toContainText("4.0");
    await expect(diagram).toHaveAttribute("data-desense", "4.00");

    // Band行の追加（中立サンプル: 全ギャップ0 → クリーン）
    await calculator.getByRole("button", { name: "＋ Band行を追加" }).click();
    await expect(primary).toContainText("0.0");
    await expect(primary).toContainText("クリーン");
    await expect(diagram).toHaveAttribute("data-desense", "0.00");

    // Band行の削除（追加した行を消すとB1へ…ではなく先頭行が選択される）
    await calculator.getByRole("button", { name: "追加Band 4を削除" }).click();
    await expect(primary).toContainText("デセンス推定値（LTE-M B1（例））");
  });
});

test.describe("antenna term intuition lab", () => {
  test("filters terms and updates two interactive experiences", async ({ page }) => {
    await page.goto("/tools/antenna-term-lab/");
    const calculator = page.getByTestId("tool-calculator");
    await expect(calculator.getByTestId("term-progress")).toContainText("0/21");

    await calculator.getByRole("button", { name: "整合と給電", exact: true }).click();
    await expect(calculator.getByTestId("term-vswr")).toBeVisible();
    await expect(calculator.getByTestId("term-ground-plane")).toBeHidden();

    await calculator.getByPlaceholder("用語を検索...").fill("マルチパス");
    await calculator.getByRole("button", { name: "すべて", exact: true }).click();
    await calculator.getByTestId("term-multipath-fading").click();
    const multipath = calculator.getByTestId("experience-multipath-svg");
    await expect(multipath).toHaveAttribute("data-position", "5");
    await calculator.locator('input[type="range"]').fill("12");
    await expect(multipath).toHaveAttribute("data-position", "12");

    await calculator.getByRole("button", { name: "用語一覧に戻る" }).click();
    await calculator.getByPlaceholder("用語を検索...").fill("VSWR");
    await calculator.getByTestId("term-vswr").click();
    const vswr = calculator.getByTestId("experience-vswr-svg");
    await calculator.locator('input[type="range"]').fill("3");
    await expect(vswr).toHaveAttribute("data-vswr", "3");
  });

  test("persists progress and exposes the related calculator link", async ({ page }) => {
    await page.goto("/tools/antenna-term-lab/");
    const calculator = page.getByTestId("tool-calculator");
    await calculator.getByTestId("term-eirp").click();
    await calculator.getByRole("button", { name: "この用語を理解する" }).click();
    await expect(calculator.getByTestId("term-progress")).toContainText("1/21");
    await expect(calculator.getByRole("link", { name: "EIRP適合性を計算" })).toHaveAttribute("href", "/tools/eirp-compliance/");

    await page.reload();
    await expect(page.getByTestId("term-progress")).toContainText("1/21");
  });
});

test.describe("OTA expert workflow", () => {
  test("finds B8 harmonics, judges targets, and translates range impact", async ({ page }) => {
    await page.goto("/tools/ota-implementation-loss/");
    const calculator = page.getByTestId("tool-calculator");
    await calculator.getByRole("radio", { name: "エキスパート" }).click();
    const expert = calculator.getByTestId("ota-expert-panel");
    await expect(expert).toBeVisible();
    await expect(expert.getByTestId("harmonic-hits")).toContainText("936");
    await expect(expert.getByTestId("harmonic-hits")).toContainText("36次");

    await expert.getByRole("button", { name: "社内目標例を入力" }).click();
    await expect(expert).toContainText("合格");
    await expect(expert).toContainText("距離 -25.0%（n=2）");
  });

  test("imports six Excel columns and reports invalid rows", async ({ page }) => {
    await page.goto("/tools/ota-implementation-loss/");
    const calculator = page.getByTestId("tool-calculator");
    await calculator.getByRole("radio", { name: "エキスパート" }).click();
    const expert = calculator.getByTestId("ota-expert-panel");
    const input = expert.getByLabel("OTA測定結果インポート");
    await input.fill("Band\tPc\tSc\tη\tTRP\tTIS\nB8\t23\t-108\t-4\t18\t-99");
    await expert.getByRole("button", { name: "一括投入" }).click();
    await expect(calculator.getByRole("button", { name: "B8", exact: true })).toBeVisible();

    await input.fill("B1,23,invalid,-3,19,-101");
    await expert.getByRole("button", { name: "一括投入" }).click();
    await expect(expert).toContainText("Band名と5つの数値を確認してください");
  });
});

test("radiation efficiency converts percent, dB, range, and highlights guidance", async ({ page }) => {
  await page.goto("/tools/radiation-efficiency-converter/");
  const calculator = page.getByTestId("tool-calculator");
  await expect(calculator.getByTestId("primary-result")).toContainText("50.0");
  await expect(calculator).toContainText("-3.01");
  await expect(calculator).toContainText("×0.71");

  await calculator.locator("#efficiencyDb").fill("-10");
  await expect(calculator.getByTestId("primary-result")).toContainText("10.0");
  await expect(calculator.getByTestId("efficiency-guideline-920-small")).toHaveAttribute("data-active", "false");
  await calculator.locator("#efficiencyPercent").fill("20");
  await expect(calculator.getByTestId("efficiency-guideline-920-small")).toHaveAttribute("data-active", "true");
});

test("patch HPBW connects half-power boundary, gain, coverage, and catalog orientation", async ({ page }) => {
  await page.goto("/tools/patch-hpbw-explorer/");
  const calculator = page.getByTestId("tool-calculator");
  const pattern = calculator.getByTestId("patch-hpbw-pattern");
  await expect(pattern).toHaveAttribute("data-half-edge", "true");
  await expect(calculator.getByTestId("primary-result")).toContainText("-3.0");

  const hpbwSlider = calculator.getByTestId("patch-hpbw-slider");
  const offsetSlider = calculator.getByTestId("patch-offset-slider");
  await hpbwSlider.fill("120");
  await offsetSlider.fill("110");
  await hpbwSlider.fill("30");
  await expect(offsetSlider).toHaveValue("30");
  await hpbwSlider.fill("40");
  await expect(calculator.getByTestId("patch-directivity")).toContainText("14.1");

  await calculator.getByRole("button", { name: "天井GW" }).click();
  await calculator.locator('input[type="range"]').last().fill("6");
  await expect(calculator.getByTestId("coverage-diameter")).toHaveAttribute("data-diameter", "4.37");

  await calculator.getByRole("button", { name: "カタログE/H面" }).click();
  const orientation = calculator.getByTestId("catalog-orientation");
  await orientation.click();
  await expect(orientation).toHaveAttribute("data-orientation", "landscape");
});

test("diffraction shadow compares bands and reacts to inputs", async ({ page }) => {
  await page.goto("/tools/diffraction-shadow/");
  const calculator = page.getByTestId("tool-calculator");
  const primary = calculator.getByTestId("primary-result");
  // 既定: ビル20m・d1=d2=1000m・送信10m/受信1.5m → LOS高5.75m・h=14.25m。
  // 920MHz(λ≈0.3259m)で v≈1.579 → J≈17.2dB（libと同式から検算した確定値）
  await expect(primary).toContainText("17.2");
  // 障害物を5m（LOSより0.75m下・v≈-0.083）へ → J≈5.3dB に減る
  await calculator.locator("#diffractionObstacleHeight").fill("5");
  await expect(primary).toContainText("5.3");
  // 20mに戻し、バンドチップを150MHzへ切替 → 同じ影でも低周波は損失が小さい（J≈11.4dB）
  await calculator.locator("#diffractionObstacleHeight").fill("20");
  await calculator.getByRole("button", { name: "150MHz", exact: true }).click();
  await expect(primary).toContainText("11.4");
  // 断面図は選択バンドの損失をdata-loss属性に反映する（入力連動の確認）
  await expect(calculator.getByTestId("diffraction-shadow-diagram")).toHaveAttribute("data-loss", "11.37");
});

test("RF antipatterns filters by severity, expands a card and links to the verifying tool", async ({ page }) => {
  await page.goto("/tools/rf-antipatterns/");
  await expect(page.getByRole("heading", { level: 1, name: "RFアンチパターン図鑑" })).toBeVisible();

  // 初期状態: 全10パターン表示（primary-result は表示中件数）
  await expect(page.getByTestId("primary-result")).toContainText("10 / 10");
  await expect(page.getByTestId("antipattern-s11-good-but-no-range")).toBeVisible();

  // severityフィルタ: critical に絞ると3件になり、minor のカードが消える
  await page.getByTestId("antipattern-filter-critical").click();
  await expect(page.getByTestId("primary-result")).toContainText("3 / 10");
  await expect(page.getByTestId("antipattern-flush-on-metal")).toBeVisible();
  await expect(page.getByTestId("antipattern-dbi-dbd-mixup")).toHaveCount(0);

  // 「すべて」に戻すと10件へ復帰
  await page.getByTestId("antipattern-filter-all").click();
  await expect(page.getByTestId("primary-result")).toContainText("10 / 10");

  // アコーディオン展開: 閉状態では本文が隠れ、展開で「数字で見る誤差」→「正しいやり方」→ツールリンクが現れる
  const card = page.getByTestId("antipattern-s11-good-but-no-range");
  await expect(card.getByText("数字で見る誤差")).not.toBeVisible();
  await card.locator("summary").click();
  await expect(card.getByText("数字で見る誤差")).toBeVisible();
  await expect(card.getByText("正しいやり方")).toBeVisible();
  const toolLink = card.locator('a[href*="/tools/radiation-resistance"]');
  await expect(toolLink).toBeVisible();
  await expect(toolLink).toContainText("放射抵抗と効率で確認する");
});
