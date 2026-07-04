// 2.5D（等角投影）プリミティブ（Track H6 のフォールバック経路）。
// WebGL/three.js を使わずに SVG だけで立体感のある図（地下BOX・基板・筐体）を描くための
// 純数学ヘルパー。React 非依存・vitest 検証可能。
//
// 座標系: x=右奥行き, y=左奥行き, z=高さ（上）。標準等角（30°）で画面座標へ投影する。
//   screenX = (x − y)·cos30°,  screenY = (x + y)·sin30° − z
// 単位は任意（viewBox スケール）。呼び出し側で原点オフセットを加える。

const COS30 = Math.cos(Math.PI / 6); // ≈ 0.8660254
const SIN30 = 0.5;

export type IsoPoint = { x: number; y: number };

/** 3D座標を等角投影して画面座標を返す。 */
export function isoProject(x: number, y: number, z: number): IsoPoint {
  return { x: (x - y) * COS30, y: (x + y) * SIN30 - z };
}

/** SVG polygon の points 文字列へ（小数3桁へ丸めスナップショットを安定させる）。 */
export function isoPolygonPoints(points: IsoPoint[]): string {
  return points.map((p) => `${round3(p.x)},${round3(p.y)}`).join(" ");
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

export type IsoBoxFaces = {
  /** 上面（z=h）。 */
  top: string;
  /** 左面（y=d 側）。 */
  left: string;
  /** 右面（x=w 側）。 */
  right: string;
};

/**
 * 原点 (0,0,0) に置いた幅w（x方向）×奥行きd（y方向）×高さh の直方体について、
 * 等角投影で見える3面（上・左・右）の polygon points を返す。
 * 陰影は shadeColor で 上=基準色 / 右=−0.15 / 左=−0.3 とするのが既定の作法（光源=左上）。
 */
export function isoBoxFaces(w: number, d: number, h: number): IsoBoxFaces {
  const p = (x: number, y: number, z: number) => isoProject(x, y, z);
  return {
    top: isoPolygonPoints([p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)]),
    left: isoPolygonPoints([p(0, d, 0), p(w, d, 0), p(w, d, h), p(0, d, h)]),
    right: isoPolygonPoints([p(w, 0, 0), p(w, d, 0), p(w, d, h), p(w, 0, h)])
  };
}

/**
 * HEXカラーの明度調整。amount∈[-1,1]。負=黒へ混色（陰）、正=白へ混色（ハイライト）。
 * 等角面の陰影（上面=基準、右面=-0.15、左面=-0.3）に使う。
 */
export function shadeColor(hex: string, amount: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) {
    throw new Error(`shadeColor: invalid hex color: ${hex}`);
  }
  const clamped = Math.max(-1, Math.min(1, amount));
  const target = clamped < 0 ? 0 : 255;
  const t = Math.abs(clamped);
  const value = Number.parseInt(m[1], 16);
  const mix = (channel: number) => Math.round(channel + (target - channel) * t);
  const r = mix((value >> 16) & 0xff);
  const g = mix((value >> 8) & 0xff);
  const b = mix(value & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}
