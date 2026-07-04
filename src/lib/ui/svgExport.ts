// 図版（SVG）のエクスポート用の純ロジック（Track H7）。
// レポート・提案書への貼付用途で、SVGをそのまま／PNGへ書き出すための DOM 非依存な補助関数群。
// 実際の DOM シリアライズ・canvas 描画・ダウンロード発火は client コンポーネント側で行い、
// ここには「文字列整形・data URI 生成・ファイル名生成・MIME」だけを置く（vitest で検証可能）。

/** 書き出し形式。 */
export type SvgExportFormat = "svg" | "png";

export const SVG_MIME = "image/svg+xml";
export const PNG_MIME = "image/png";

/**
 * SVG のマークアップ文字列に、単体ファイルとして開けるよう xmlns と XML 宣言を補う。
 * 既に xmlns がある場合は二重付与しない。
 */
export function normalizeSvgMarkup(svgMarkup: string): string {
  let markup = svgMarkup.trim();
  if (!/\sxmlns=/.test(markup)) {
    markup = markup.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!markup.startsWith("<?xml")) {
    markup = `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
  }
  return markup;
}

/** SVG 文字列を data URI（image/svg+xml）へ。encodeURIComponent でUnicode安全に。 */
export function svgMarkupToDataUri(svgMarkup: string): string {
  return `data:${SVG_MIME};charset=utf-8,${encodeURIComponent(normalizeSvgMarkup(svgMarkup))}`;
}

/**
 * ダウンロードファイル名を生成する。base を安全な slug（英数・ハイフン）へ整え、拡張子を付ける。
 * 日本語などの非ASCIIは除去し、空になった場合は "diagram" にフォールバックする。
 */
export function exportFilename(base: string, format: SvgExportFormat): string {
  const slug = base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "diagram"}.${format}`;
}

/** PNG 書き出し時の描画スケール（Retina/印刷向けに既定2倍）。1以上の有限値でクランプ。 */
export function pngScale(requested = 2): number {
  return Number.isFinite(requested) && requested >= 1 ? requested : 1;
}
