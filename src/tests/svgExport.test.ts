import { describe, expect, it } from "vitest";
import {
  exportFilename,
  normalizeSvgMarkup,
  PNG_MIME,
  pngScale,
  SVG_MIME,
  svgMarkupToDataUri
} from "@/lib/ui/svgExport";

describe("normalizeSvgMarkup（H7）", () => {
  it("xmlns が無ければ補い、XML宣言を先頭へ", () => {
    const out = normalizeSvgMarkup('<svg viewBox="0 0 10 10"></svg>');
    expect(out).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(out.startsWith("<?xml")).toBe(true);
  });

  it("既に xmlns があれば二重付与しない", () => {
    const src = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>';
    const out = normalizeSvgMarkup(src);
    expect((out.match(/xmlns=/g) ?? [])).toHaveLength(1);
  });
});

describe("svgMarkupToDataUri", () => {
  it("image/svg+xml の data URI を返し Unicode を安全に符号化", () => {
    const uri = svgMarkupToDataUri('<svg viewBox="0 0 1 1"><text>受信</text></svg>');
    expect(uri.startsWith(`data:${SVG_MIME};charset=utf-8,`)).toBe(true);
    expect(uri).toContain(encodeURIComponent("受信"));
  });
});

describe("exportFilename", () => {
  it("baseをslug化し拡張子を付ける", () => {
    expect(exportFilename("Link Budget 滝グラフ", "svg")).toBe("link-budget.svg");
    expect(exportFilename("NCU 断面図", "png")).toBe("ncu.png");
  });

  it("非ASCIIのみ/空はフォールバック diagram", () => {
    expect(exportFilename("断面図", "svg")).toBe("diagram.svg");
    expect(exportFilename("   ", "png")).toBe("diagram.png");
  });

  it("先頭末尾ハイフンを除去", () => {
    expect(exportFilename("--dBm--", "svg")).toBe("dbm.svg");
  });
});

describe("pngScale / MIME", () => {
  it("既定2倍、1未満/非有限は1へクランプ", () => {
    expect(pngScale()).toBe(2);
    expect(pngScale(3)).toBe(3);
    expect(pngScale(0.5)).toBe(1);
    expect(pngScale(Number.NaN)).toBe(1);
  });

  it("MIME定数", () => {
    expect(SVG_MIME).toBe("image/svg+xml");
    expect(PNG_MIME).toBe("image/png");
  });
});
