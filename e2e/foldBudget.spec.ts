import { expect, test } from "@playwright/test";
import { basicTools } from "../src/data/basicTools";
import * as fs from "fs";
import * as path from "path";

const HEIGHT_BUDGET_SLUGS = new Set([
  "ifa-initial-dimensions",
  "l-match",
  "antenna-isolation",
  "battery-life",
  "gnss-cn0"
]);

test("fold budget KPI metrics and status map generation", async ({ page }, testInfo) => {
  // 全基本ツールの順次実行に十分なタイムアウトを設定
  test.setTimeout(90000);

  const budgetReports: Array<{
    slug: string;
    firstInputY: number | null;
    firstInputPass: boolean;
    primaryResultY: number | null;
    primaryResultPass: boolean;
    hasTestId: boolean;
    pageHeight: number;
    pageHeightPass: boolean;
    pageHeightRequired: boolean;
  }> = [];

  // デスクトップビューポート (1440x900)
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const t of basicTools) {
    await page.goto(`/tools/${t.slug}/`);
    
    // レイアウト・Hydrationの安定待ち
    await page.waitForTimeout(300);

    // 最初のインタラクティブ要素を取得
    const firstInput = page.locator('#main-content input, #main-content select, #main-content button[type="button"], #main-content [role="radio"]').first();
    let firstInputY: number | null = null;
    let firstInputPass = false;

    if (await firstInput.count() > 0) {
      const box = await firstInput.boundingBox();
      if (box) {
        firstInputY = Math.round(box.y);
        firstInputPass = firstInputY <= 400;
      }
    }

    // 主結果要素の検証（data-testid="primary-result"）
    const primaryResult = page.locator('[data-testid="primary-result"]').first();
    const hasTestId = await primaryResult.count() > 0;
    let primaryResultY: number | null = null;
    let primaryResultPass = false;

    if (hasTestId) {
      const box = await primaryResult.boundingBox();
      if (box) {
        primaryResultY = Math.round(box.y);
        // ビューポートの下端 900px に主結果全体が入っているか
        primaryResultPass = (box.y + box.height) <= 900;
      }
    }

    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const pageHeightPass = pageHeight <= 2500;
    const pageHeightRequired = HEIGHT_BUDGET_SLUGS.has(t.slug);

    budgetReports.push({
      slug: t.slug,
      firstInputY,
      firstInputPass,
      primaryResultY,
      primaryResultPass,
      hasTestId,
      pageHeight,
      pageHeightPass,
      pageHeightRequired
    });
  }

  let markdown = `# フォールド予算KPI達成状況マップ (Fold Budget Status Map)\n\n`;
  markdown += `**計測日時**: ${new Date().toISOString()}\n`;
  markdown += `**測定ビューポート**: デスクトップ (1440x900)\n\n`;
  markdown += `| ツール (slug) | 最初の入力Y (目標≦400px) | 最初の入力判定 | 主結果要素Y (目標≦900px) | 主結果判定 | ページ総高 (目標≦2500px) | 総高判定 | data-testid有無 | 総合評価 |\n`;
  markdown += `|---|---|---|---|---|---|---|---|---|\n`;

  const sortedReports = [...budgetReports].sort((a, b) => a.slug.localeCompare(b.slug));
  let overallFailureCount = 0;

  for (const r of sortedReports) {
    const inputVal = r.firstInputY !== null ? `${r.firstInputY}px` : "N/A";
    const inputPass = r.firstInputPass ? "🟢 PASS" : "❌ FAIL";
    
    let resultVal = "N/A";
    let resultPass = "N/A";
    if (r.hasTestId) {
      resultVal = r.primaryResultY !== null ? `${r.primaryResultY}px` : "Error";
      resultPass = r.primaryResultPass ? "🟢 PASS" : "❌ FAIL";
    } else {
      resultPass = "⚠️ testid未付与";
    }

    const isTotalPass =
      r.firstInputPass &&
      r.primaryResultPass &&
      (!r.pageHeightRequired || r.pageHeightPass);
    if (!isTotalPass) {
      overallFailureCount++;
    }

    const totalEval = isTotalPass ? "🟢 達成" : "🔴 未達";
    const heightStatus = r.pageHeightRequired
      ? r.pageHeightPass
        ? "🟢 PASS"
        : "❌ FAIL"
      : "参考";
    markdown += `| \`${r.slug}\` | ${inputVal} | ${inputPass} | ${resultVal} | ${resultPass} | ${r.pageHeight}px | ${heightStatus} | ${r.hasTestId ? "○" : "×"} | ${totalEval} |\n`;
  }

  await testInfo.attach("fold-budget-status", {
    body: markdown,
    contentType: "text/markdown"
  });

  // 既存の引き継ぎレポートを更新するときだけ、明示的に書き込みを許可する。
  if (process.env.UPDATE_FOLD_REPORT === "true") {
    const dir = path.join(__dirname, "../docs/handoff");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "fold-budget-status.md"), markdown, "utf-8");
  }

  const failedSlugs = sortedReports
    .filter(
      (report) =>
        !report.firstInputPass ||
        !report.primaryResultPass ||
        (report.pageHeightRequired && !report.pageHeightPass)
    )
    .map((report) => report.slug);
  expect(
    overallFailureCount,
    `フォールド予算KPI未達: ${failedSlugs.join(", ")}`
  ).toBe(0);
});
