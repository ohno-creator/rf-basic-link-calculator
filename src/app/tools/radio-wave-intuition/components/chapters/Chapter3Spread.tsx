"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { ChapterFrame, PlayPauseButton } from "./ChapterFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "./useIntuitionAnimation";
import type { IntuitionChapterMeta } from "./types";

export const chapter3SpreadMeta: IntuitionChapterMeta = {
  id: "spread",
  order: 3,
  title: "電波は広がって薄まる——距離2乗の法則",
  lead: "受信機を遠ざけると、同じ電波がどれだけ薄まるかを見てください。",
  navLabel: "薄まる"
};

const FREQ_MHZ = 920;
const TX_POWER_DBM = 0;
const LOG_DIST_MAX = 2; // 10^2 = 100 m
const LOG2 = Math.log10(2);

const VIEW_W = 560;
const VIEW_H = 260;
const ANT_X = 50;
const ANT_Y = 128;
const R_MIN = 40; // 1m の描画半径
const R_MAX = 490; // 100m の描画半径
const AXIS_Y = 228;
const RING_SPACING = 56;
const RING_SPEED_PX_S = 42;

/** 粒の密度表現: 角度ステップは半径によらず一定 → 円周上の間隔は距離に比例して開く。 */
const DOT_ANGLES_DEG = [-63, -54, -45, -36, -27, -18, -9, 0, 9, 18, 27, 36, 45, 54, 63];

const AXIS_TICKS_M = [1, 2, 5, 10, 20, 50, 100];

/** FSPL[dB] = 20log10(d[km]) + 20log10(f[MHz]) + 32.44（自由空間・遠方界）。 */
function fsplDb(distanceM: number): number {
  return 20 * Math.log10(distanceM / 1000) + 20 * Math.log10(FREQ_MHZ) + 32.44;
}

/** 距離[m]（1〜100・対数）→ 図中の半径[px]。横軸は対数目盛。 */
function radiusPx(distanceM: number): number {
  return R_MIN + (Math.log10(distanceM) / LOG_DIST_MAX) * (R_MAX - R_MIN);
}

function formatDistance(distanceM: number): string {
  return distanceM >= 9.95 ? distanceM.toFixed(0) : distanceM.toFixed(1);
}

function SpreadExperience() {
  const [logDist, setLogDist] = useState(0); // log10(m): 0=1m, 2=100m
  const [ghost, setGhost] = useState<{ distanceM: number; rxDbm: number } | null>(null);
  const [ripplePx, setRipplePx] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    setRipplePx(((elapsedMs / 1000) * RING_SPEED_PX_S) % RING_SPACING);
  }, playing);

  const distanceM = 10 ** logDist;
  const rxDbm = TX_POWER_DBM - fsplDb(distanceM);
  const rxRadius = radiusPx(distanceM);
  const rxX = ANT_X + rxRadius;

  const canDouble = logDist <= LOG_DIST_MAX - LOG2 + 1e-9;
  const deltaDb = ghost ? rxDbm - ghost.rxDbm : null;

  const doubleDistance = () => {
    if (!canDouble) {
      return;
    }
    setGhost({ distanceM, rxDbm });
    setLogDist((current) => Math.min(current + LOG2, LOG_DIST_MAX));
  };

  // 外へ流れる等間隔リング（装飾: 速さ・間隔は視認用。外側ほど薄く=「薄まり」の暗喩）
  const rings = useMemo(() => {
    const list: { r: number; opacity: number }[] = [];
    for (let i = 0; i < 10; i += 1) {
      const r = ripplePx + i * RING_SPACING;
      if (r < 8 || r > R_MAX + 30) {
        continue;
      }
      list.push({ r, opacity: Math.max(0.08, 0.75 * (1 - r / (R_MAX + 60))) });
    }
    return list;
  }, [ripplePx]);

  const ghostRadius = ghost ? radiusPx(ghost.distanceM) : null;
  const rxLabelX = Math.min(Math.max(rxX, 80), 495);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-600">
          送信 {TX_POWER_DBM} dBm・{FREQ_MHZ} MHz 固定。波紋は外へ広がるほど薄くなります。
        </p>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <svg
        role="img"
        aria-label={`送信0dBm・920MHzの電波が同心円状に広がる図。距離 ${formatDistance(distanceM)} m の受信点では ${rxDbm.toFixed(1)} dBm まで薄まる。横軸は対数目盛。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="intuition-spread-svg"
        data-rx-dbm={rxDbm.toFixed(1)}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* 外へ流れる同心円の波紋 */}
        {rings.map((ring) => (
          <circle
            key={ring.r.toFixed(2)}
            cx={ANT_X}
            cy={ANT_Y}
            r={ring.r}
            fill="none"
            stroke={diagramPalette.path}
            strokeWidth={1.5}
            opacity={ring.opacity}
          />
        ))}

        {/* 送信アンテナ */}
        <line x1={ANT_X} y1={ANT_Y} x2={ANT_X} y2={ANT_Y + 52} stroke={diagramPalette.inkSoft} strokeWidth={3} />
        <line x1={ANT_X - 10} y1={ANT_Y + 52} x2={ANT_X + 10} y2={ANT_Y + 52} stroke={diagramPalette.inkSoft} strokeWidth={2} />
        <circle cx={ANT_X} cy={ANT_Y} r={5} fill={diagramPalette.staf} />
        <text x={ANT_X} y={ANT_Y - 14} textAnchor="middle" fill={diagramPalette.stafDark} fontSize={11} fontWeight={700}>
          送信 0 dBm
        </text>

        {/* 受信点を通る波面と「粒の密度」（同じ粒数が広い円周に散らばる） */}
        <circle cx={ANT_X} cy={ANT_Y} r={rxRadius} fill="none" stroke={diagramPalette.faint} strokeDasharray="2 5" strokeWidth={1} />
        {DOT_ANGLES_DEG.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <circle
              key={deg}
              cx={ANT_X + rxRadius * Math.cos(rad)}
              cy={ANT_Y + rxRadius * Math.sin(rad)}
              r={2.6}
              fill={diagramPalette.stafDark}
              opacity={0.85}
            />
          );
        })}

        {/* 前回位置のゴーストマーカー */}
        {ghost && ghostRadius !== null ? (
          <g>
            <circle
              cx={ANT_X + ghostRadius}
              cy={ANT_Y}
              r={6}
              fill="none"
              stroke={diagramPalette.muted}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <text
              x={Math.min(Math.max(ANT_X + ghostRadius, 70), 495)}
              y={ANT_Y + 24}
              textAnchor="middle"
              fill={diagramPalette.muted}
              fontSize={10}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              前回 {ghost.rxDbm.toFixed(1)} dBm
            </text>
          </g>
        ) : null}

        {/* 受信点と受信電力 */}
        <line x1={rxX} y1={ANT_Y + 8} x2={rxX} y2={AXIS_Y} stroke={diagramPalette.faint} strokeDasharray="3 4" strokeWidth={1} />
        <circle cx={rxX} cy={ANT_Y} r={7} fill={chartTheme.series.loss} stroke={chartTheme.surface.plain} strokeWidth={2} />
        <text
          x={rxLabelX}
          y={ANT_Y - 16}
          textAnchor="middle"
          fill={chartTheme.seriesText.loss}
          fontSize={15}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {rxDbm.toFixed(1)} dBm
        </text>
        <text
          x={rxLabelX}
          y={ANT_Y - 34}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={10}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          受信点 {formatDistance(distanceM)} m
        </text>

        {/* 距離軸（対数目盛） */}
        <line x1={ANT_X + R_MIN} y1={AXIS_Y} x2={ANT_X + R_MAX} y2={AXIS_Y} stroke={diagramPalette.inkMuted} strokeWidth={1.5} />
        {AXIS_TICKS_M.map((tick) => {
          const x = ANT_X + radiusPx(tick);
          return (
            <g key={tick}>
              <line x1={x} y1={AXIS_Y} x2={x} y2={AXIS_Y + 5} stroke={diagramPalette.inkMuted} strokeWidth={1} />
              <text
                x={x}
                y={AXIS_Y + 17}
                textAnchor="middle"
                fill={diagramPalette.muted}
                fontSize={10}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {tick}m
              </text>
            </g>
          );
        })}
        <text x={ANT_X + R_MAX} y={AXIS_Y - 8} textAnchor="end" fill={diagramPalette.faint} fontSize={10}>
          距離（対数目盛）
        </text>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="intuition-spread-dist" className="text-sm font-semibold text-slate-900">
            送信アンテナからの距離
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatDistance(distanceM)} m
          </span>
        </div>
        <input
          id="intuition-spread-dist"
          type="range"
          min={0}
          max={LOG_DIST_MAX}
          step={0.005}
          value={logDist}
          aria-label="距離（対数スケール・1mから100m）"
          className="mt-2 w-full"
          onChange={(event) => setLogDist(Number(event.target.value))}
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-xs font-semibold text-slate-600">受信電力（送信 0 dBm・920 MHz）</p>
            <p className="text-3xl font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
              {rxDbm.toFixed(1)} dBm
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              type="button"
              onClick={doubleDistance}
              disabled={!canDouble}
              className="rounded-md border border-staf/30 bg-white px-3 py-1.5 text-sm font-bold text-staf-dark transition hover:border-staf/60 hover:bg-staf-light disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              距離を2倍にする
            </button>
            {deltaDb !== null ? (
              <span
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                前回の位置から {deltaDb > 0 ? "+" : ""}
                {deltaDb.toFixed(2)} dB
              </span>
            ) : (
              <span className="text-xs text-slate-500">押すと前回値がゴーストで残ります</span>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          同じ電波でも、遠ざかるほど「粒」の間隔が開いていきます。距離を2倍にするたびに、受信電力はきっかり
          <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
            −6.02 dB（1/4）
          </span>
          ずつ薄まります。
        </p>
      </div>
    </div>
  );
}

export function Chapter3Spread() {
  return (
    <ChapterFrame
      chapterId="spread"
      experienceHint="距離スライダーで受信点●を遠ざけ、「距離を2倍にする」ボタンで受信電力が毎回いくつ下がるかを確かめてください。"
      experience={<SpreadExperience />}
      grasp={[
        "距離が2倍になると受信電力は−6dB（1/4）。電波が球面状に広がり、同じ電力が4倍の表面積に薄まるから。",
        "薄まりは最初の数mが急で、遠方はゆるやか。1m→2mも50m→100mも同じ−6dB——対数の目盛りでは等間隔の階段。",
        "「電波が飛ぶ」とは、薄まりきる前に受信機が判別できる電力（SNR）を残すこと。距離は敵ではなく、正確に計算できる相手。"
      ]}
      practice={{
        text: "この「距離2倍で−6dB」の法則を式にしたものが自由空間損失（FSPL）です。周波数と距離を入れれば、リンク設計に使う正確なdB値が得られます。",
        toolHref: "/tools/free-space-loss",
        toolLabel: "自由空間損失ツールで正確に計算"
      }}
      deepDive={{
        formula:
          "FSPL[dB] = 20 log₁₀(d[km]) + 20 log₁₀(f[MHz]) + 32.44 = 20 log₁₀(4πd/λ)\n例: 920MHz・d=1m → 31.7dB、d=10m → 51.7dB、d=100m → 71.7dB（送信0dBmなら受信−71.7dBm）",
        body: (
          <>
            <p>
              FSPLは「空気が電波を吸う」損失ではありません。等方放射の電力密度 Pt/4πd²（距離2乗で薄まる）に対し、
              受信アンテナが掬い取れる実効面積 Ae = λ²G/4π が有限であることの比です。周波数の項 20log₁₀(f)
              が付くのは、高い周波数ほど同じ利得のアンテナの実効面積が小さくなるため——空間の薄まり自体は周波数に依りません。
            </p>
            <p>
              この式が成り立つのは遠方界（目安: d &gt; 2D²/λ かつ d ≫ λ。Dはアンテナ最大寸法）で、見通しがあり反射・回折が無視できる自由空間のみ。
              地面反射や遮蔽がある実環境では、距離のべきが2乗から3〜4乗相当まで悪化します。
            </p>
            <p>
              この図のうそ: 波紋の速さと間隔は視認用で実寸ではありません（920MHzのλ=32.6cmは、100mスケールの図では細かすぎて描けない）。
              横軸も対数目盛に圧縮しています。また円周上の「粒」は2次元の絵なので密度は1/dで開きますが、実際は球面に広がるため電力密度は1/d²で薄まります。
            </p>
          </>
        )
      }}
      column={{
        title: "月をアンテナ代わりに——EME通信",
        body: (
          <>
            <p>
              アマチュア無線には「EME（Earth-Moon-Earth）」という究極の遊びがあります。地球から月に電波をぶつけ、
              月面で反射して返ってきたかけらを地球の裏側で受信する——月を「空に浮かぶ反射板」にした交信です。
              片道約38万km、往復77万km。距離2乗則を往路と復路で二重に食らい、しかも月面は入射電力の7%ほどしか反射しません。
              合計の経路損失は144MHz帯でおよそ250dB超。送信した電力の10²⁵分の1しか戻らない、この章の「薄まり」の極北です。
            </p>
            <p>
              それでも交信は成立します。八木アンテナを何本も束ね、巨大パラボラで利得をかき集め、帯域を極限まで絞って雑音を減らし、
              モールスのような遅くて確実な符号で執念深く拾う。2000年代には、パルサー観測でノーベル物理学賞を受けた電波天文学者
              ジョー・テイラー（コールサインK1JT）が天文の信号処理をこの世界に持ち込み、雑音より20dB以上も下に埋もれた信号を
              解読するデジタルプロトコルJT65を作りました。いまや100W級と数本のアンテナの「小さな局」でも月からのエコーが拾えます。
              距離2乗で薄まることは誰にも止められません。しかし、どこまで薄まるかを正確に計算できれば、
              その微かな残りを掬い上げる設計ができる。あなたがボタンで下りた−6dBの階段は、月まで続いています。
            </p>
          </>
        ),
        breakNote:
          "月を「鏡」にたとえましたが、実際の月面は凹凸だらけの岩石で電波を乱反射するため、エコーは拡散して歪み、月の秤動でドップラー的な揺らぎまで加わります。",
        sources: [
          {
            label: "ARRL Handbook for Radio Communications（Earth-Moon-Earth 章）",
            note: "EME局の設計指針と経路損失の実際"
          },
          {
            label: "J. Taylor (K1JT), The JT65 Communications Protocol, QEX (2005)",
            note: "ノーベル物理学賞受賞者が開発した弱信号EMEプロトコル"
          },
          {
            label: "IEEE Transactions on Antennas and Propagation: EME path loss 関連文献",
            note: "月面反射の経路損失・反射係数の学術的解析"
          }
        ]
      }}
    />
  );
}
