"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { ChapterFrame, PlayPauseButton } from "./ChapterFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "./useIntuitionAnimation";
import type { IntuitionChapterMeta } from "./types";

export const chapter6NoiseMeta: IntuitionChapterMeta = {
  id: "noise",
  order: 6,
  title: "ノイズの海から信号を拾う",
  lead: "信号を強くしたり、増幅してみたり——「聞き取れる」条件を探ってください。",
  navLabel: "ノイズ"
};

const VIEW_W = 560;
const VIEW_H = 240;
const PLOT_X0 = 20;
const PLOT_W = 520;
const WAVE_Y = 120;
/** 表示クリップ（±px）。実受信機の飽和と同じく、はみ出しは頭打ちで描く。 */
const CLIP_PX = 96;
/** 0dB時の表示振幅（px・電圧スケール）。 */
const BASE_AMP_PX = 10;

/** 信号（正弦波）: 画面内に4周期・ゆっくり流れる。 */
const SIGNAL_CYCLES = 4;
const SIGNAL_OMEGA = Math.PI * 2 * 0.9;

/**
 * 決定論的擬似ノイズ（シード固定）。互いに非整数倍の空間周波数をもつ5本の正弦波の和で、
 * 周期性が目につかない「ノイズらしい」波形を再現よく描く。
 * 各成分の振幅は 1/√5 に正規化（Σa²=1）——和のRMSが振幅1の正弦波と同じ 1/√2 になり、
 * 表示するSNR（dB差）が電力比として正確に対応する。
 */
const NOISE_COMPONENTS = [
  { cycles: 2.71, omega: 1.7, phase: 0.9 },
  { cycles: 5.13, omega: -2.3, phase: 2.2 },
  { cycles: 9.47, omega: 3.1, phase: 4.1 },
  { cycles: 17.3, omega: -4.6, phase: 0.4 },
  { cycles: 29.9, omega: 5.9, phase: 3.3 }
];
const NOISE_NORM = 1 / Math.sqrt(NOISE_COMPONENTS.length);

const BADGES = {
  clear: { label: "はっきり聞こえる", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  faint: { label: "かすれる", className: "border-amber-200 bg-amber-50 text-amber-700" },
  buried: { label: "埋もれた", className: "border-rose-200 bg-rose-50 text-rose-700" }
} as const;

function judgeSnr(snrDb: number) {
  if (snrDb > 10) {
    return BADGES.clear;
  }
  if (snrDb >= 0) {
    return BADGES.faint;
  }
  return BADGES.buried;
}

function formatSignedDb(db: number): string {
  return `${db >= 0 ? "+" : ""}${db.toFixed(1)}`;
}

function clampPx(value: number): number {
  return Math.min(CLIP_PX, Math.max(-CLIP_PX, value));
}

function NoiseExperience() {
  const [signalDb, setSignalDb] = useState(0);
  const [noiseDb, setNoiseDb] = useState(0);
  const [amplified, setAmplified] = useState(false);
  const [timeSec, setTimeSec] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    setTimeSec(elapsedMs / 1000);
  }, playing);

  // 電圧スケールで振幅を計算（dBは電力なので 10^(dB/20)）。増幅トグルは信号もノイズも一律×2。
  const gain = amplified ? 2 : 1;
  const signalAmpPx = BASE_AMP_PX * 10 ** (signalDb / 20) * gain;
  const noiseAmpPx = BASE_AMP_PX * 10 ** (noiseDb / 20) * gain;
  // 増幅は分子分母に同じ倍率がかかるのでSNRに影響しない（＝gainは式に現れない）
  const snrDb = signalDb - noiseDb;
  const badge = judgeSnr(snrDb);

  const { compositeD, signalD, clipped } = useMemo(() => {
    const composite: string[] = [];
    const signalOnly: string[] = [];
    let clip = false;
    for (let i = 0; i <= PLOT_W; i += 2) {
      const u = i / PLOT_W;
      const s = signalAmpPx * Math.sin(Math.PI * 2 * SIGNAL_CYCLES * u - SIGNAL_OMEGA * timeSec);
      let n = 0;
      for (const c of NOISE_COMPONENTS) {
        n += Math.sin(Math.PI * 2 * c.cycles * u + c.omega * timeSec + c.phase);
      }
      n *= NOISE_NORM * noiseAmpPx;
      const raw = s + n;
      if (Math.abs(raw) > CLIP_PX) {
        clip = true;
      }
      const cmd = i === 0 ? "M" : "L";
      composite.push(`${cmd} ${PLOT_X0 + i} ${(WAVE_Y - clampPx(raw)).toFixed(1)}`);
      signalOnly.push(`${cmd} ${PLOT_X0 + i} ${(WAVE_Y - clampPx(s)).toFixed(1)}`);
    }
    return { compositeD: composite.join(" "), signalD: signalOnly.join(" "), clipped: clip };
  }, [signalAmpPx, noiseAmpPx, timeSec]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-pressed={amplified}
          onClick={() => setAmplified((prev) => !prev)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            amplified
              ? "border-staf bg-staf text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
          }`}
        >
          増幅してみる（×2）
        </button>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div>
          <p className="text-xs font-semibold text-slate-500">SNR＝信号 − ノイズ</p>
          <p className="text-2xl font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatSignedDb(snrDb)} dB
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
        {amplified ? (
          <span className="text-xs font-semibold text-slate-500">
            増幅中——波は大きくなっても、SNRと判定バッジは変わりません
          </span>
        ) : null}
      </div>

      <svg
        role="img"
        aria-label={`信号とノイズの合成波形。信号 ${formatSignedDb(signalDb)} dB、ノイズ ${formatSignedDb(
          noiseDb
        )} dB、SNR ${formatSignedDb(snrDb)} dB で判定は「${badge.label}」。増幅は${amplified ? "オン" : "オフ"}。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="intuition-noise-svg"
        data-snr-db={snrDb.toFixed(1)}
        data-amplified={amplified ? "1" : "0"}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* 凡例 */}
        <line x1={PLOT_X0} y1={14} x2={PLOT_X0 + 22} y2={14} stroke={diagramPalette.staf} strokeWidth={2.5} />
        <text x={PLOT_X0 + 28} y={18} fill={diagramPalette.inkSoft} fontSize={11} fontWeight={600}>
          受信波形（信号＋ノイズ）
        </text>
        <line
          x1={PLOT_X0 + 210}
          y1={14}
          x2={PLOT_X0 + 232}
          y2={14}
          stroke={chartTheme.series.gain}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text x={PLOT_X0 + 238} y={18} fill={chartTheme.seriesText.gain} fontSize={11} fontWeight={600}>
          信号だけ（本当に聞きたい声）
        </text>

        {/* ゼロ線と波形 */}
        <line x1={PLOT_X0} y1={WAVE_Y} x2={PLOT_X0 + PLOT_W} y2={WAVE_Y} stroke={diagramPalette.faint} strokeDasharray="4 4" />
        <path d={signalD} fill="none" stroke={chartTheme.series.gain} strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={compositeD} fill="none" stroke={diagramPalette.staf} strokeWidth={2} strokeLinecap="round" />

        {clipped ? (
          <text x={PLOT_X0 + PLOT_W} y={VIEW_H - 6} textAnchor="end" fill={diagramPalette.faint} fontSize={10}>
            はみ出した波形は画面の上下で頭打ちにしています（実際の受信機も大入力では飽和します）
          </text>
        ) : null}
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="intuition-noise-signal" className="text-sm font-semibold text-slate-900">
            信号レベル
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatSignedDb(signalDb)} dB（相対）
          </span>
        </div>
        <input
          id="intuition-noise-signal"
          type="range"
          min={-20}
          max={20}
          step={0.5}
          value={signalDb}
          aria-label="信号レベル（-20〜+20dB相対）"
          className="mt-2 w-full"
          onChange={(event) => setSignalDb(Number(event.target.value))}
        />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="intuition-noise-noise" className="text-sm font-semibold text-slate-900">
            ノイズレベル
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatSignedDb(noiseDb)} dB（相対）
          </span>
        </div>
        <input
          id="intuition-noise-noise"
          type="range"
          min={-10}
          max={10}
          step={0.5}
          value={noiseDb}
          aria-label="ノイズレベル（-10〜+10dB相対）"
          className="mt-2 w-full"
          onChange={(event) => setNoiseDb(Number(event.target.value))}
        />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        判定バッジを動かせるのは<span className="font-bold text-slate-900">信号とノイズの「差」</span>だけです。
        「増幅してみる」を押すと波形全体は2倍（電圧×2＝
        <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
          +6.0 dB
        </span>
        ）になりますが、信号もノイズも同じだけ持ち上がるので、SNRもバッジも1ミリも動きません——
        <span className="font-bold text-slate-900">増幅では「聞き取れる」ようにならない</span>のです。
      </p>
    </div>
  );
}

export function Chapter6Noise() {
  return (
    <ChapterFrame
      chapterId="noise"
      experienceHint="信号とノイズのスライダーで判定バッジが変わる条件を探し、そのあと「増幅してみる」を押して——バッジが変わらないことを確かめてください。"
      experience={<NoiseExperience />}
      grasp={[
        "聞き取れるかどうかは信号の「大きさ」ではなく、ノイズとの差（SNR）で決まる。",
        "増幅は信号もノイズも一緒に持ち上げる。受信機の前で失ったSNRは、後段の増幅では戻らない。",
        "ノイズの床は温度と帯域幅で決まる（kTB）。だから帯域を絞ると床が下がり、感度が上がる。"
      ]}
      practice={{
        text: "受信感度は「ノイズフロア（-174dBm/Hz＋帯域幅＋NF）＋所要SNR」で見積もれます。帯域幅とNFを入れて、実際の感度を数字で確かめてみましょう。",
        toolHref: "/tools/noise-floor",
        toolLabel: "ノイズフロア・受信感度ツールで実際の感度を計算"
      }}
      deepDive={{
        formula:
          "熱雑音電力: N = kTB　→ 10 log₁₀(kT₀·1Hz/1mW) = -174 dBm/Hz（T₀=290K）\nノイズフロア: N[dBm] = -174 + 10 log₁₀(B[Hz]) + NF[dB]\n例: B=1MHz, NF=6dB → -174 + 60 + 6 = -108 dBm\n受信感度 ≒ ノイズフロア + 所要SNR（所要SNR 10dB なら -98 dBm）\n縦続雑音指数（Friis）: F = F₁ + (F₂−1)/G₁ + (F₃−1)/(G₁G₂) + …",
        body: (
          <>
            <p>
              この図のうそ：実際の熱雑音は正規分布に従うガウス雑音（白色雑音）で、この画面の「ノイズ」は見やすさのために
              非整数倍の周波数をもつ5本の正弦波を固定シードで足し合わせた擬似波形です（毎回同じ形＝再現可能）。
              ただし擬似ノイズのRMSは信号と同じ基準に正規化してあるので、表示するSNR＝信号dB−ノイズdBは電力比として正確です。
              波形は電圧で描いており（振幅は10^(dB/20)倍）、SNRのdBは電力比（10log₁₀）——電圧2倍＝電力4倍＝+6dBの対応です。
              画面からはみ出す波形は上下で頭打ちにしています。
            </p>
            <p>
              -174dBm/Hzは「常温の世界が1Hzあたりに放つノイズの床」で、これより下は冷やさない限り誰にも聞こえません。
              受信機はこの床に自分のノイズ（NF）を上乗せします。縦続NFのFriis式が示すのは「初段が命」——
              初段の利得G₁が大きいほど後段のノイズ寄与は1/G₁に薄まるので、低NFのLNAをアンテナ直近に置くのが定石です。
              逆に初段の手前にケーブル損失があると、その損失dBはそのままNFに加算され、後からどれだけ増幅しても取り返せません。
            </p>
          </>
        )
      }}
      column={{
        title: "静けさは買える——電波暗室という異世界",
        body: (
          <>
            <p>
              扉を閉めると、世界から反射が消えます。電波暗室の内壁は、床も天井も一面が紺色のピラミッドで覆われています。
              正体はカーボンを練り込んだウレタン発泡体。とがった先端はほとんど「すき間」で、根元に向かうほど材料が密になる——
              つまり空気から吸収体へと、電波の通りにくさ（インピーダンス）が徐々に変わるスロープになっているのです。
              性質が急に変わる境界があると電波はそこで反射しますが、ゆるやかに変われば反射を生む「段差」がどこにもない。
              迷い込んだ電波は谷の奥へ奥へと導かれ、熱に変わって静かに消えます。
            </p>
            <p>
              音の世界にも同じ部屋があります。米ミネアポリスのオーフィールド研究所の無響室は−24.9dBAを記録し、
              ギネス世界記録の「世界一静かな場所」と呼ばれました。訪れた人は自分の心臓の鼓動、血の流れ、関節のきしみまで
              聞こえはじめ、「長くは居られない」と語ります。静けさとは何も無いことではなく、自分のノイズだけが残ること。
              アンテナのOTA測定に電波暗室が要るのも同じ理由です。壁や床の反射、放送やWi-Fiの外来波が混ざれば、
              測れているのが試作機の実力なのか部屋のクセなのか分からなくなる。だから設計者は大金を払って「電波の静けさ」を買い、
              その中でアンテナだけの声を聞くのです。
            </p>
          </>
        ),
        breakNote:
          "「電波の無音室」といっても消せるのは反射と外来波まで——部屋も受信機も常温である限り、kTBの熱雑音は残り、測定系の底には必ずノイズフロアがあります。",
        sources: [
          {
            label: "IEEE Std 149 (IEEE Recommended Practice for Antenna Measurements)",
            note: "電波暗室を含むアンテナ測定法の標準"
          },
          {
            label: "CTIA Test Plan for Wireless Device Over-the-Air Performance",
            note: "スマホ等のOTA測定の業界試験規格"
          },
          {
            label: "Orfield Laboratories \"Quietest Place on Earth\"（Guinness World Records）",
            note: "−24.9dBAの無響室と「長く居られない」逸話の報道"
          }
        ]
      }}
    />
  );
}
