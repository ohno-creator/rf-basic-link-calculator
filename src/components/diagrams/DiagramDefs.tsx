import { DIAGRAM_DEF_IDS } from "@/lib/ui/diagramTheme";

/**
 * 自作SVG診断図の共通 <defs>（Track H3）。各図の <svg> 直下に一度だけ置く:
 *
 *   <svg viewBox="...">
 *     <DiagramDefs />
 *     <rect fill={diagramRef(DIAGRAM_DEF_IDS.gradientSoil)} ... />
 *
 * ID・線幅・タイポの規約は src/lib/ui/diagramTheme.ts が単一の真実の源。
 * 素材（金属/コンクリート/樹脂/土/水）のグラデーションと、落ち影・矢印・地面ハッチを提供する。
 * 純表示・フック無しのためサーバー/クライアントどちらからも利用可。
 */
export function DiagramDefs() {
  return (
    <defs>
      {/* 柔らかい落ち影（主要形状に filter={diagramRef(softShadow)}） */}
      <filter id={DIAGRAM_DEF_IDS.softShadow} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.18" />
      </filter>

      {/* 寸法線・視線の矢印（markerEnd={diagramRef(arrowHead)}） */}
      <marker
        id={DIAGRAM_DEF_IDS.arrowHead}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L10 5 L0 10 z" fill="#475569" />
      </marker>
      <marker
        id={DIAGRAM_DEF_IDS.arrowHeadMuted}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L10 5 L0 10 z" fill="#94A3B8" />
      </marker>

      {/* 空（上）→ 白（下）: 断面図の上空 */}
      <linearGradient id={DIAGRAM_DEF_IDS.gradientSky} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DBEAFE" />
        <stop offset="100%" stopColor="#F8FAFC" />
      </linearGradient>

      {/* 土・地中: 表土が濃く、深部でわずかに明るく落ち着く */}
      <linearGradient id={DIAGRAM_DEF_IDS.gradientSoil} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A16207" stopOpacity="0.55" />
        <stop offset="12%" stopColor="#854D0E" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#713F12" stopOpacity="0.35" />
      </linearGradient>

      {/* 金属: 斜光ハイライトの入ったグレー（蓋・鋼板・鋳鉄） */}
      <linearGradient id={DIAGRAM_DEF_IDS.gradientMetal} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="35%" stopColor="#94A3B8" />
        <stop offset="55%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>

      {/* コンクリート: 僅かな明暗のフラットグレー */}
      <linearGradient id={DIAGRAM_DEF_IDS.gradientConcrete} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>

      {/* 樹脂・プラスチック: 明るい暖白 */}
      <linearGradient id={DIAGRAM_DEF_IDS.gradientResin} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>

      {/* 水・湿潤: 透明感のある青 */}
      <linearGradient id={DIAGRAM_DEF_IDS.gradientWater} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.5" />
      </linearGradient>

      {/* 地面ハッチ: 断面の切り口（fill={diagramRef(hatchGround)}） */}
      <pattern id={DIAGRAM_DEF_IDS.hatchGround} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#F1F5F9" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="#CBD5E1" strokeWidth="1.5" />
      </pattern>
    </defs>
  );
}
