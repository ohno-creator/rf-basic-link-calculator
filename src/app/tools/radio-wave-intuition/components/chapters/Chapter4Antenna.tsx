"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { ChapterFrame, PlayPauseButton } from "./ChapterFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "./useIntuitionAnimation";
import type { IntuitionChapterMeta } from "./types";

export const chapter4AntennaMeta: IntuitionChapterMeta = {
  id: "antenna",
  order: 4,
  title: "アンテナは長さが命——共振",
  lead: "素子の長さを変えて、電波と『息が合う』長さを探してください。",
  navLabel: "共振"
};

const SPEED_OF_LIGHT_M_S = 299_792_458;

const FREQUENCY_PRESETS = [
  { label: "LPWA 920MHz", mhz: 920 },
  { label: "Wi-Fi/BLE 2450MHz", mhz: 2450 }
];

/** 共振カーブの鋭さ（視認用の代表値。実際のQは素子径・周囲環境で変わる→deepDive参照）。 */
const RESONANCE_Q = 10;
/** 「共振！」判定のしきい値（|δ| < 3%）。 */
const RESONANT_DELTA = 0.03;

const VIEW_W = 560;
const VIEW_H = 270;
const CENTER_X = 280;
const PLOT_W = 520;
/** スライダー上限400mmを描画幅いっぱいに割り付ける（1.3 px/mm の実寸比スケール）。 */
const PX_PER_MM = PLOT_W / 400;
const ELEMENT_Y = 130;
const ENVELOPE_AMP_MAX = 52;
const DIMENSION_Y = 210;
const FEED_GAP_PX = 5;

/** λ/2 目標長[mm]。 */
function halfWaveTargetMm(frequencyMHz: number): number {
  return (SPEED_OF_LIGHT_M_S / (2 * frequencyMHz * 1e6)) * 1000;
}

/** 共振の良さ（0〜1）。ローレンツ型 1/(1+(2Q·δ)²)、δ=(L−λ/2)/(λ/2)。 */
function resonanceQuality(lengthMm: number, targetMm: number): number {
  const delta = (lengthMm - targetMm) / targetMm;
  return 1 / (1 + (2 * RESONANCE_Q * delta) ** 2);
}

function AntennaExperience() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [lengthMm, setLengthMm] = useState(100);
  const [phase, setPhase] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    setPhase((elapsedMs / 1000) * Math.PI * 2 * 1.2);
  }, playing);

  const targetMm = halfWaveTargetMm(frequencyMHz);
  const delta = (lengthMm - targetMm) / targetMm;
  const quality = resonanceQuality(lengthMm, targetMm);
  const qualityPct = Math.round(quality * 100);
  const resonant = Math.abs(delta) < RESONANT_DELTA;

  const halfPx = (lengthMm / 2) * PX_PER_MM;
  const targetHalfPx = (targetMm / 2) * PX_PER_MM;
  // 包絡線の振幅。共振の良さでスケール（+0.06の下駄は「萎んでも輪郭は見える」ための視認用）。
  const amp = ENVELOPE_AMP_MAX * (0.06 + 0.94 * quality);

  // 定在波電流の包絡線（sin半波・中央最大・両端ゼロ）を上下対称の閉パスで描く。
  const envelopePath = useMemo(() => {
    const top: string[] = [];
    const bottom: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i += 1) {
      const x = -halfPx + (2 * halfPx * i) / steps;
      const e = amp * Math.cos((Math.PI * x) / (2 * halfPx));
      top.push(`${i === 0 ? "M" : "L"} ${(CENTER_X + x).toFixed(1)} ${(ELEMENT_Y - e).toFixed(1)}`);
      bottom.push(`L ${(CENTER_X - x).toFixed(1)} ${(ELEMENT_Y + e).toFixed(1)}`);
    }
    return `${top.join(" ")} ${bottom.join(" ")} Z`;
  }, [halfPx, amp]);

  // 包絡線の内側で振動する「いまの電流」カーブ。
  const currentPath = useMemo(() => {
    const points: string[] = [];
    const steps = 60;
    const swing = Math.sin(phase);
    for (let i = 0; i <= steps; i += 1) {
      const x = -halfPx + (2 * halfPx * i) / steps;
      const y = ELEMENT_Y - amp * Math.cos((Math.PI * x) / (2 * halfPx)) * swing;
      points.push(`${i === 0 ? "M" : "L"} ${(CENTER_X + x).toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  }, [halfPx, amp, phase]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FREQUENCY_PRESETS.map((preset) => {
            const active = frequencyMHz === preset.mhz;
            return (
              <button
                key={preset.mhz}
                type="button"
                aria-pressed={active}
                onClick={() => setFrequencyMHz(preset.mhz)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-staf bg-staf text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <svg
        role="img"
        aria-label={`全長 ${lengthMm} mm のダイポールアンテナ。周波数 ${frequencyMHz} MHz の目標長 λ/2 は ${targetMm.toFixed(1)} mm。共振の良さは ${qualityPct}%。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="intuition-antenna-svg"
        data-resonance-quality={qualityPct}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* 共振の良さメーター（左上） */}
        <text x={20} y={22} fill={diagramPalette.muted} fontSize={11}>
          共振の良さ
        </text>
        <text
          x={196}
          y={22}
          textAnchor="end"
          fill={diagramPalette.ink}
          fontSize={12}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {qualityPct}%
        </text>
        <rect x={20} y={28} width={176} height={8} rx={4} fill={diagramPalette.grid} />
        <rect x={20} y={28} width={176 * quality} height={8} rx={4} fill={diagramPalette.success} />

        {/* 共振バッジ（|δ|<3%のときだけ） */}
        {resonant ? (
          <g data-testid="intuition-antenna-resonant-badge">
            <rect x={CENTER_X - 92} y={12} width={184} height={26} rx={13} fill={diagramPalette.success} />
            <text
              x={CENTER_X}
              y={30}
              textAnchor="middle"
              fill={diagramPalette.white}
              fontSize={13}
              fontWeight={700}
            >
              共振！ 息が合いました
            </text>
          </g>
        ) : null}

        {/* λ/2 目標長のガイド（破線＋目盛） */}
        <line
          x1={CENTER_X - targetHalfPx}
          y1={70}
          x2={CENTER_X - targetHalfPx}
          y2={DIMENSION_Y + 8}
          stroke={diagramPalette.stafDark}
          strokeWidth={1}
          strokeDasharray="5 4"
        />
        <line
          x1={CENTER_X + targetHalfPx}
          y1={70}
          x2={CENTER_X + targetHalfPx}
          y2={DIMENSION_Y + 8}
          stroke={diagramPalette.stafDark}
          strokeWidth={1}
          strokeDasharray="5 4"
        />
        <text
          x={CENTER_X}
          y={250}
          textAnchor="middle"
          fill={diagramPalette.stafDark}
          fontSize={12}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          目標 λ/2 = {targetMm.toFixed(1)} mm（{frequencyMHz} MHz）
        </text>

        {/* 電流の包絡線（定在波・中央最大） */}
        <path
          d={envelopePath}
          fill={diagramPalette.success}
          fillOpacity={chartTheme.overlay.secondary}
          stroke={diagramPalette.successDeep}
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* ダイポール素子（中央給電・左右2本の腕） */}
        <rect
          x={CENTER_X - halfPx}
          y={ELEMENT_Y - 3}
          width={Math.max(halfPx - FEED_GAP_PX, 1)}
          height={6}
          rx={3}
          fill={diagramPalette.inkSoft}
        />
        <rect
          x={CENTER_X + FEED_GAP_PX}
          y={ELEMENT_Y - 3}
          width={Math.max(halfPx - FEED_GAP_PX, 1)}
          height={6}
          rx={3}
          fill={diagramPalette.inkSoft}
        />
        {/* 給電点（中央） */}
        <circle cx={CENTER_X} cy={ELEMENT_Y} r={7} fill={diagramPalette.white} stroke={diagramPalette.staf} strokeWidth={1.5} />
        <text x={CENTER_X} y={ELEMENT_Y + 3.5} textAnchor="middle" fill={diagramPalette.staf} fontSize={10} fontWeight={700}>
          〜
        </text>
        <text x={CENTER_X} y={ELEMENT_Y + 22} textAnchor="middle" fill={diagramPalette.faint} fontSize={10}>
          中央給電
        </text>

        {/* いまの電流（包絡線の内側で振動） */}
        <path d={currentPath} fill="none" stroke={chartTheme.series.gain} strokeWidth={2.5} strokeLinecap="round" />

        {/* 素子全長の寸法線 */}
        <line
          x1={CENTER_X - halfPx}
          y1={DIMENSION_Y}
          x2={CENTER_X + halfPx}
          y2={DIMENSION_Y}
          stroke={diagramPalette.muted}
          strokeWidth={1.5}
        />
        <line x1={CENTER_X - halfPx} y1={DIMENSION_Y - 6} x2={CENTER_X - halfPx} y2={DIMENSION_Y + 6} stroke={diagramPalette.muted} strokeWidth={1.5} />
        <line x1={CENTER_X + halfPx} y1={DIMENSION_Y - 6} x2={CENTER_X + halfPx} y2={DIMENSION_Y + 6} stroke={diagramPalette.muted} strokeWidth={1.5} />
        <text
          x={CENTER_X}
          y={DIMENSION_Y + 20}
          textAnchor="middle"
          fill={diagramPalette.ink}
          fontSize={12}
          fontWeight={600}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          素子全長 L = {lengthMm} mm
        </text>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="intuition-antenna-length" className="text-sm font-semibold text-slate-900">
            素子の全長
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {lengthMm} mm
          </span>
        </div>
        <input
          id="intuition-antenna-length"
          type="range"
          min={20}
          max={400}
          step={1}
          value={lengthMm}
          aria-label="ダイポール素子の全長（ミリメートル）"
          className="mt-2 w-full"
          onChange={(event) => setLengthMm(Number(event.target.value))}
        />
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {resonant ? (
            <>
              いまの長さは目標の<span className="font-bold text-slate-900">λ/2とほぼ一致</span>。
              ブランコを押すタイミングが合ったときのように、電流が素子いっぱいに大きく乗っています。
            </>
          ) : (
            <>
              目標の λ/2（
              <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                {targetMm.toFixed(1)} mm
              </span>
              ）より
              <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                {Math.abs(delta * 100).toFixed(0)}%{delta > 0 ? "長め" : "短め"}
              </span>
              。波と息が合わず、電流はあまり乗りません（共振の良さ {qualityPct}%）。
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export function Chapter4Antenna() {
  return (
    <ChapterFrame
      chapterId="antenna"
      experienceHint="周波数チップを選んでから全長スライダーを動かし、「共振の良さ」が100%に近づく長さを探してください。"
      experience={<AntennaExperience />}
      grasp={[
        "素子の全長がちょうどλ/2のとき、電流がいちばん大きく乗る。ブランコを押すタイミングが合った状態と同じ。",
        "λ/2は2.4GHz帯で約6.1cm、920MHzで約16.3cm。使う周波数が決まると、アンテナの「正しい長さ」も決まる。",
        "それでも短くしたいときは整合回路で「無理を通す」。その代償として帯域と効率を差し出すことになる。"
      ]}
      practice={{
        text: "実際の製品では基板の都合でダイポールをそのまま載せられないことが多く、λ/4系のIFA（逆Fアンテナ）に変形します。まずは初期寸法をツールで出すのが近道です。",
        toolHref: "/tools/ifa-initial-dimensions",
        toolLabel: "IFA初期寸法ツールで実物の寸法を出す"
      }}
      deepDive={{
        formula:
          "λ/2[m] = c / (2f) = 299,792,458 / (2 × f[Hz])\n例: 920MHz → λ/2 = 162.9 mm ／ 2450MHz → λ/2 = 61.2 mm\n共振の良さ（本図）= 1 / (1 + (2Q·δ)²)、δ = (L − λ/2) / (λ/2)、Q = 10",
        body: (
          <>
            <p>
              半波長ダイポールの入力インピーダンスは約73Ω（厳密にはL=λ/2ちょうどで73+j42.5Ω）。虚部を0にする実際の共振長は、
              端効果と素子径の影響でλ/2より2〜9%短く、L≈0.47〜0.48λが目安です（太い素子ほど短縮率が大きい）。
              共振の鋭さQと帯域はトレードオフで、VSWR規定の比帯域幅はおおむね1/Qに比例します——短縮アンテナを整合回路で
              無理に共振させるとQが上がり、帯域と効率が犠牲になります。
            </p>
            <p>
              この図のうそ（簡略化）: ローレンツ応答のQ=10は視認用の代表値で、実際のQは素子の太さや周囲の誘電体・金属で変わります。
              また電流分布はどの長さでも「中央最大のsin半波」で描いていますが、細線ダイポールの実分布は
              I(x)=I₀·sin(k(L/2−|x|)) で、L&gt;λ/2では最大点が中央からずれます。萎んでも見えるよう包絡線に6%の下駄も履かせています。
            </p>
          </>
        )
      }}
      column={{
        title: "うさぎの耳の科学——世界で一番売れたアンテナ",
        body: (
          <>
            <p>
              昔のテレビの上には、必ず「ロッドアンテナ2本」が載っていました。米国で rabbit ears（うさぎの耳）と呼ばれた、
              史上もっとも数多く売られたアンテナ——正体はこの章で触ったものと同じ、中央給電のダイポールです。
              2本をハの字に開くのはV型ダイポールにするためで、開き角で共振とパターンを微調整できました。
              そして伸縮ロッドを縮めたり伸ばしたりするのは、まさにあなたが動かしたスライダーそのもの。
              VHFの低いチャンネルでは長く、高いチャンネルでは短く——「チャンネルを変えたら耳の長さも変える」のが作法でした。
            </p>
            <p>
              映りが悪いときの民間療法「アルミホイルを巻く」にも理屈があります。ホイルで素子が実効的に太く・長くなると、
              共振点がずれて帯域も広がるため、たまたま条件が合えば本当に映りが良くなったのです。
              このうさぎの耳を絶滅させたのが地上デジタル化でした。放送の主力がUHF帯（470MHz以上）へ移ると
              λ/2は30cm以下になり、室内アンテナはループ型や薄いフラット型で足りるようになります。
              テレビの上から耳が消えたのは流行ではなく、周波数が上がって「正しい長さ」が短くなったから——
              アンテナの形の歴史は、そのまま周波数の歴史です。
            </p>
          </>
        ),
        breakNote:
          "「ブランコを押すタイミング」のたとえでは押し手が時間を合わせますが、アンテナは周波数が決まっていて合わせるのは長さのほう——時間ではなく空間の寸法で同調する点が違います。",
        sources: [
          {
            label: "C. A. Balanis, Antenna Theory: Analysis and Design",
            note: "ダイポールの電流分布・入力インピーダンス・V型ダイポールの章"
          },
          {
            label: "NAB Engineering Handbook",
            note: "放送受信アンテナ実務とVHF/UHF帯の変遷"
          },
          {
            label: "FCC: Antennas and Digital Television",
            href: "https://www.fcc.gov/consumers/guides/antennas-and-digital-television",
            note: "地デジ移行後の受信アンテナ消費者向けガイド"
          }
        ]
      }}
    />
  );
}
