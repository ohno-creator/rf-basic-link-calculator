import { describe, expect, it } from "vitest";
import { DIAGRAM_DEF_IDS, diagramRef, diagramStroke, diagramText } from "@/lib/ui/diagramTheme";

describe("diagramTheme（Track H3）", () => {
  it("defs の ID はすべて一意で dgm- プレフィクスを持つ", () => {
    const ids = Object.values(DIAGRAM_DEF_IDS);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id.startsWith("dgm-")).toBe(true);
    }
  });

  it("diagramRef は url(#id) 形式を返す", () => {
    expect(diagramRef(DIAGRAM_DEF_IDS.softShadow)).toBe("url(#dgm-soft-shadow)");
    expect(diagramRef(DIAGRAM_DEF_IDS.gradientMetal)).toBe("url(#dgm-grad-metal)");
  });

  it("線幅の規約: 補助 < 主要 < 強調", () => {
    expect(diagramStroke.support).toBeLessThan(diagramStroke.main);
    expect(diagramStroke.main).toBeLessThan(diagramStroke.emphasis);
  });

  it("値ラベルは tabular-nums", () => {
    expect(diagramText.value.fontVariantNumeric).toBe("tabular-nums");
  });
});
