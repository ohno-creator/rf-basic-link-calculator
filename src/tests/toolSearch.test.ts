import { describe, expect, it } from "vitest";
import { toolDirectory } from "@/data/toolDirectory";
import { toolKeywords } from "@/data/toolKeywords";
import { getSearchableTools, normalizeSearchText, searchTools } from "@/lib/toolSearch";

describe("normalizeSearchText", () => {
  it("全角英数をNFKCで半角へ、英字は小文字へ", () => {
    expect(normalizeSearchText("ＦＳＰＬ")).toBe("fspl");
    expect(normalizeSearchText("dBm")).toBe("dbm");
  });

  it("カタカナをひらがなへ畳む（読みの表記ゆれ吸収）", () => {
    expect(normalizeSearchText("デシベル")).toBe("でしべる");
    expect(normalizeSearchText("アンテナ")).toBe("あんてな");
  });
});

describe("toolKeywords 辞書の整合性", () => {
  const slugs = new Set(toolDirectory.map((tool) => tool.href.replace(/^\/tools\//, "")));

  it("全キーが実在するツールslugである", () => {
    for (const key of Object.keys(toolKeywords)) {
      expect(slugs.has(key), `unknown slug in toolKeywords: ${key}`).toBe(true);
    }
  });

  it("キーワードは空文字を含まない", () => {
    for (const [slug, keywords] of Object.entries(toolKeywords)) {
      for (const keyword of keywords) {
        expect(keyword.trim().length, `${slug} has empty keyword`).toBeGreaterThan(0);
      }
    }
  });
});

describe("searchTools", () => {
  it("空クエリは空配列", () => {
    expect(searchTools("")).toEqual([]);
    expect(searchTools("   ")).toEqual([]);
  });

  it("名前の部分一致で見つかる（従来動作の維持）", () => {
    const results = searchTools("フレネル");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tool.slug).toBe("fresnel-zone");
  });

  it("名前一致は別名一致より上位に来る", () => {
    // "vswr" は VSWR・リターンロス（name一致）が別名のみのツールより上に来るはず
    const results = searchTools("vswr");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tool.name).toContain("VSWR");
  });

  it("全角・カタカナの表記ゆれでもヒットする", () => {
    const wide = searchTools("ＦＳＰＬ");
    const narrow = searchTools("fspl");
    expect(wide.map((r) => r.tool.slug)).toEqual(narrow.map((r) => r.tool.slug));
    expect(narrow.length).toBeGreaterThan(0);
  });

  it("複数語はANDで絞り込む", () => {
    const single = searchTools("アンテナ");
    const double = searchTools("アンテナ 利得");
    expect(double.length).toBeLessThanOrEqual(single.length);
    for (const r of double) {
      const hay = `${r.tool.name}${r.tool.tagline}${r.tool.keywords.join("")}${r.tool.slug}`;
      expect(normalizeSearchText(hay)).toContain("あんてな");
    }
  });

  it("getSearchableTools は全ツールを返し slug を持つ", () => {
    const all = getSearchableTools();
    expect(all).toHaveLength(toolDirectory.length);
    for (const tool of all) {
      expect(tool.slug.length).toBeGreaterThan(0);
      expect(tool.href).toBe(`/tools/${tool.slug}`);
    }
  });
});
