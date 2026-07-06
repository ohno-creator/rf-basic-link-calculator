"use client";

import { useRef, useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import {
  exportFilename,
  normalizeSvgMarkup,
  PNG_MIME,
  pngScale,
  svgMarkupToDataUri
} from "@/lib/ui/svgExport";

type DiagramExportButtonProps = {
  /** ダウンロードファイル名の元（ツール名等）。 */
  filenameBase: string;
  /** 書き出し対象の <svg> を含む要素をラップする。 */
  children: ReactNode;
  /** PNG の描画倍率（既定2倍）。 */
  scale?: number;
};

function triggerDownload(href: string, filename: string): void {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * 図版（内包する最初の <svg>）を SVG / PNG で保存するボタン（Track H7）。
 * 提案書・レポートへの貼付用途。純ロジックは src/lib/ui/svgExport.ts。
 * SVGシリアライズ→（PNGは img→canvas 描画）→ダウンロード発火は client 側で行う。
 */
export function DiagramExportButton({ filenameBase, children, scale = 2 }: DiagramExportButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const readSvgMarkup = (): string | null => {
    const svg = childrenRef.current?.querySelector("svg");
    if (!svg) {
      return null;
    }
    // 忠実度の保険（v4 R4）: クラス由来の文字スタイル（CSSはSVG単体に同梱されない）を
    // computed style から属性へ焼き込む。recharts等クラス依存の図でも書き出しが画面と一致する。
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const sourceTexts = svg.querySelectorAll("text");
    const cloneTexts = clone.querySelectorAll("text");
    sourceTexts.forEach((source, index) => {
      const target = cloneTexts[index];
      if (!target) {
        return;
      }
      const style = window.getComputedStyle(source);
      target.setAttribute("fill", style.fill);
      target.setAttribute("font-size", style.fontSize);
      target.setAttribute("font-weight", style.fontWeight);
      target.setAttribute("font-family", style.fontFamily);
      if (style.fontVariantNumeric && style.fontVariantNumeric !== "normal") {
        target.setAttribute("font-variant-numeric", style.fontVariantNumeric);
      }
      target.removeAttribute("class");
    });
    return normalizeSvgMarkup(clone.outerHTML);
  };

  const exportSvg = () => {
    const markup = readSvgMarkup();
    if (!markup) return;
    triggerDownload(svgMarkupToDataUri(markup), exportFilename(filenameBase, "svg"));
  };

  const exportPng = () => {
    const svg = childrenRef.current?.querySelector("svg");
    const markup = readSvgMarkup();
    if (!svg || !markup) return;
    setBusy(true);
    const rect = svg.getBoundingClientRect();
    const factor = pngScale(scale);
    const width = Math.max(1, Math.round((rect.width || 800) * factor));
    const height = Math.max(1, Math.round((rect.height || 400) * factor));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff"; // 透過を避け、レポート地色を白で確定。
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            triggerDownload(url, exportFilename(filenameBase, "png"));
            URL.revokeObjectURL(url);
          }
          setBusy(false);
        }, PNG_MIME);
      } else {
        setBusy(false);
      }
    };
    image.onerror = () => setBusy(false);
    image.src = svgMarkupToDataUri(markup);
  };

  const btn =
    "rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 disabled:opacity-50";

  return (
    <div ref={wrapRef}>
      <div className="mb-2 flex items-center justify-end gap-2">
        <span className="mr-auto inline-flex items-center gap-1 text-xs text-slate-400">
          <Download aria-hidden className="h-3 w-3" />
          図を保存
        </span>
        <button type="button" className={btn} onClick={exportSvg} disabled={busy}>
          SVG
        </button>
        <button type="button" className={btn} onClick={exportPng} disabled={busy}>
          {busy ? "…" : "PNG"}
        </button>
      </div>
      <div ref={childrenRef}>{children}</div>
    </div>
  );
}

export default DiagramExportButton;
