import { describe, expect, it } from "vitest";
import { chartTheme } from "@/lib/chartTheme";
import {
  DIAGRAM_DEF_IDS,
  diagramPalette,
  diagramRef,
  diagramStroke,
  diagramText
} from "@/lib/ui/diagramTheme";

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

describe("diagramPalette（Track I 便4b）", () => {
  it("全色が #RRGGBB 形式で重複なし", () => {
    const values = Object.values(diagramPalette);
    for (const v of values) {
      expect(v).toMatch(/^#[0-9A-F]{6}$/);
    }
    expect(new Set(values).size).toBe(values.length);
  });

  it("diagramText の label/caption/value と同値（単一ソースの整合）", () => {
    expect(diagramPalette.muted).toBe(diagramText.label.fill);
    expect(diagramPalette.faint).toBe(diagramText.caption.fill);
    expect(diagramPalette.ink).toBe(diagramText.value.fill);
  });

  it("chartTheme と同系の値は同値（図とチャートの色統一）", () => {
    expect(diagramPalette.grid).toBe(chartTheme.grid.primary);
    expect(diagramPalette.canvas).toBe(chartTheme.surface.canvas);
    expect(diagramPalette.white).toBe(chartTheme.surface.plain);
    expect(diagramPalette.staf).toBe(chartTheme.series.source);
    expect(diagramPalette.stafDark).toBe(chartTheme.seriesText.source);
    expect(diagramPalette.success).toBe(chartTheme.series.gain);
    expect(diagramPalette.successDeep).toBe(chartTheme.seriesText.gain);
    expect(diagramPalette.danger).toBe(chartTheme.reference.sensitivity);
    expect(diagramPalette.dangerDeep).toBe(chartTheme.seriesText.loss);
    expect(diagramPalette.faint).toBe(chartTheme.reference.baseline);
  });
});
