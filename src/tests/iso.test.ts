import { describe, expect, it } from "vitest";
import { isoBoxFaces, isoPolygonPoints, isoProject, shadeColor } from "@/lib/ui/iso";

const COS30 = Math.cos(Math.PI / 6);

describe("isoProject（等角投影）", () => {
  it("x軸単位ベクトル → (cos30°, 0.5)", () => {
    const p = isoProject(1, 0, 0);
    expect(p.x).toBeCloseTo(COS30, 10);
    expect(p.y).toBeCloseTo(0.5, 10);
  });

  it("y軸単位ベクトル → (−cos30°, 0.5)", () => {
    const p = isoProject(0, 1, 0);
    expect(p.x).toBeCloseTo(-COS30, 10);
    expect(p.y).toBeCloseTo(0.5, 10);
  });

  it("z（高さ）は画面上方向（yが減る）へ", () => {
    expect(isoProject(0, 0, 1)).toEqual({ x: 0, y: -1 });
  });

  it("原点は原点へ", () => {
    expect(isoProject(0, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe("isoBoxFaces / isoPolygonPoints", () => {
  it("各面は4頂点の points 文字列", () => {
    const faces = isoBoxFaces(2, 1, 1);
    for (const face of [faces.top, faces.left, faces.right]) {
      expect(face.split(" ")).toHaveLength(4);
    }
  });

  it("上面は z=h 平面（最初の頂点は (0,0,h) の投影）", () => {
    const faces = isoBoxFaces(2, 1, 3);
    const first = faces.top.split(" ")[0];
    const p = isoProject(0, 0, 3);
    expect(first).toBe(`${Math.round(p.x * 1000) / 1000},${Math.round(p.y * 1000) / 1000}`);
  });

  it("isoPolygonPoints は3桁へ丸める", () => {
    expect(isoPolygonPoints([{ x: 1.23456, y: -0.98765 }])).toBe("1.235,-0.988");
  });
});

describe("shadeColor（面の陰影）", () => {
  it("amount=0 は不変・大文字HEXで返す", () => {
    expect(shadeColor("#0071bd", 0)).toBe("#0071BD");
  });

  it("負で黒へ、正で白へ混色（端は完全に黒/白）", () => {
    expect(shadeColor("#0071BD", -1)).toBe("#000000");
    expect(shadeColor("#0071BD", 1)).toBe("#FFFFFF");
  });

  it("-0.3 の暗化（各チャネルが70%へ）", () => {
    // 0x00→0, 0x71(113)→79(0x4F), 0xBD(189)→132(0x84)
    expect(shadeColor("#0071BD", -0.3)).toBe("#004F84");
  });

  it("範囲外 amount はクランプ・不正HEXは throw", () => {
    expect(shadeColor("#FFFFFF", -2)).toBe("#000000");
    expect(() => shadeColor("red", 0)).toThrowError();
    expect(() => shadeColor("#FFF", 0)).toThrowError();
  });
});
