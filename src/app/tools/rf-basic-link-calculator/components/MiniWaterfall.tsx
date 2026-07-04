import { formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";
import { stepStyles } from "./LinkBudgetWaterfallChart";
import { chartTheme } from "@/lib/chartTheme";

// モバイルの追従サマリ用の簡易滝グラフ。受信電力と受信感度の上下関係＝リンクマージンだけを示す。

type MiniWaterfallProps = {
  result: LinkBudgetResult;
  input: LinkBudgetInput;
};

const X0 = 36;
const X1 = 284;
const TRACK_Y = 30;

function round(value: number): number {
  return Number(value.toFixed(1));
}

export function MiniWaterfall({ result, input }: MiniWaterfallProps) {
  const received = result.receivedPowerDbm;
  const sensitivity = input.receiverSensitivityDbm;
  const lo = Math.min(received, sensitivity);
  const hi = Math.max(received, sensitivity);
  const span = Math.max(1, hi - lo);
  const pad = span * 0.35 + 2;
  const domainLo = lo - pad;
  const domainHi = hi + pad;

  const xOf = (value: number) =>
    round(X0 + ((value - domainLo) / (domainHi - domainLo)) * (X1 - X0));
  const xR = xOf(received);
  const xS = xOf(sensitivity);
  const barLeft = Math.min(xR, xS);
  const barWidth = Math.max(2, Math.abs(xR - xS));
  const ok = result.linkMarginDb >= 0;

  // マージンが0dB付近でマーカーが近接すると「感度」「受信」ラベルが重なるため、左右へ振り分ける。
  const close = Math.abs(xR - xS) < 30;
  const sensAnchor = close ? (xS <= xR ? "end" : "start") : "middle";
  const sensX = close ? xS + (xS <= xR ? -4 : 4) : xS;
  const recvAnchor = close ? (xR < xS ? "end" : "start") : "middle";
  const recvX = close ? xR + (xR < xS ? -4 : 4) : xR;

  return (
    <svg viewBox="0 0 320 56" role="img" aria-label="受信電力と受信感度の差（リンクマージン）の簡易表示" className="mt-1 w-full">
      <line x1={X0} y1={TRACK_Y} x2={X1} y2={TRACK_Y} stroke={chartTheme.grid.primary} strokeWidth="2" />
      {/* マージン区間 */}
      <rect x={barLeft} y={TRACK_Y - 4} width={barWidth} height="8" rx="2" fill={ok ? chartTheme.series.gain : chartTheme.series.loss} opacity="0.5" />
      {/* 受信感度マーカー */}
      <line x1={xS} y1={TRACK_Y - 9} x2={xS} y2={TRACK_Y + 9} stroke={chartTheme.reference.sensitivity} strokeWidth="2.5" />
      <text x={sensX} y={TRACK_Y + 22} textAnchor={sensAnchor} fontSize="9" fill={chartTheme.seriesText.loss}>感度</text>
      {/* 受信電力マーカー */}
      <circle cx={xR} cy={TRACK_Y} r="5" fill={stepStyles.total.fill} stroke={chartTheme.surface.plain} strokeWidth="1.5" />
      <text x={recvX} y={TRACK_Y + 22} textAnchor={recvAnchor} fontSize="9" fill={stepStyles.total.text}>受信</text>
      {/* マージン値 */}
      <text x={round((barLeft + barLeft + barWidth) / 2)} y={TRACK_Y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill={ok ? chartTheme.seriesText.gain : chartTheme.seriesText.loss}>
        {formatSigned(result.linkMarginDb, "dB")}
      </text>
    </svg>
  );
}
