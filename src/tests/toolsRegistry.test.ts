import { describe, expect, it } from "vitest";
import { basicTools, getBasicTool } from "@/data/basicTools";
import { toolCategories, toolDirectory } from "@/data/toolDirectory";

// レジストリ統合（tools.ts 単一ソース化）の前後で、公開データが1バイトも変わらないことを固定する。
describe("tool registries", () => {
  it("basicTools snapshot (slug順で内容を固定。配列順はgetBasicTool検索のみのため非依存)", () => {
    const sorted = [...basicTools].sort((a, b) => a.slug.localeCompare(b.slug));
    expect(sorted).toMatchSnapshot();
  });

  it("toolDirectory snapshot", () => {
    expect(toolDirectory).toMatchSnapshot();
  });

  it("toolCategories snapshot", () => {
    expect(toolCategories).toMatchSnapshot();
  });

  it("getBasicTool resolves by slug and misses gracefully", () => {
    expect(getBasicTool("free-space-loss")?.title).toBe("自由空間損失（FSPL）");
    expect(getBasicTool("does-not-exist")).toBeUndefined();
  });

  it("every basic tool slug appears in the directory", () => {
    const dirSlugs = new Set(toolDirectory.map((t) => t.href.replace("/tools/", "")));
    for (const tool of basicTools) {
      expect(dirSlugs.has(tool.slug)).toBe(true);
    }
  });

  it("every directory tool has a known category", () => {
    const categoryIds = new Set<string>(toolCategories.map((c) => c.id));
    for (const tool of toolDirectory) {
      expect(categoryIds.has(tool.category)).toBe(true);
    }
  });
});
