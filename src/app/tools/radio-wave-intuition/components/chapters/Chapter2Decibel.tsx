"use client";

import { useRef, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { ChapterFrame, PlayPauseButton } from "./ChapterFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "./useIntuitionAnimation";
import type { IntuitionChapterMeta } from "./types";

export const chapter2DecibelMeta: IntuitionChapterMeta = {
  id: "decibel",
  order: 2,
  title: "dBは『何倍』を数えるものさし",
  lead: "×2、×10のボタンを押して、掛け算が足し算になる瞬間を見てください。",
  navLabel: "dBを知る"
};

/** ×2の正確なdB値（+3dBは丸め。表示はtabular-numsで+3.01を見せる）。 */
const DB_PER_X2 = 10 * Math.log10(2);
const DB_MIN = -30;
const DB_MAX = 30;
/** リニアものさしの目盛上限（倍率10でフルスケール＝すぐ振り切れる演出）。 */
const LINEAR_FULL_SCALE = 10;

const RATIO_BUTTONS = [
  { label: "×2", deltaDb: DB_PER_X2 },
  { label: "×10", deltaDb: 10 },
  { label: "÷2", deltaDb: -DB_PER_X2 },
  { label: "÷10", deltaDb: -10 }
];

const VIEW_W = 560;
const VIEW_H = 216;
const PLOT_X0 = 30;
const PLOT_W = 500;

// リニアものさし（上段）のレイアウト
const LIN_TITLE_Y = 18;
const LIN_TRACK_Y = 30;
const LIN_TRACK_H = 18;
const LIN_LABEL_Y = 64;

// dBものさし（下段）のレイアウト
const DB_TITLE_Y = 104;
const DB_VALUE_Y = 136;
const DB_TRACK_Y = 144;
const DB_TRACK_H = 18;
const DB_LABEL_Y = 180;
const CAPTION_Y = 204;

function clampDb(db: number): number {
  return Math.min(DB_MAX, Math.max(DB_MIN, db));
}

function xLinear(ratio: number): number {
  return PLOT_X0 + (Math.min(ratio, LINEAR_FULL_SCALE) / LINEAR_FULL_SCALE) * PLOT_W;
}

function xDb(db: number): number {
  return PLOT_X0 + ((db - DB_MIN) / (DB_MAX - DB_MIN)) * PLOT_W;
}

function formatRatio(ratio: number): string {
  if (ratio >= 100) {
    return ratio.toFixed(0);
  }
  if (ratio >= 10) {
    return ratio.toFixed(1);
  }
  if (ratio >= 1) {
    return ratio.toFixed(2);
  }
  if (ratio >= 0.1) {
    return ratio.toFixed(3);
  }
  return ratio.toFixed(4);
}

function formatDb(db: number): string {
  return `${db >= 0 ? "+" : ""}${db.toFixed(2)}`;
}

function DecibelExperience() {
  // 状態は dB（＝倍率のlog10×10）で持つ。スライダー0.001〜1000倍は-30〜+30dBと等価。
  const [targetDb, setTargetDb] = useState(DB_PER_X2);
  const [animDb, setAnimDb] = useState(DB_PER_X2);
  const { playing, toggle } = useExperiencePlayback();

  const targetRef = useRef(targetDb);
  targetRef.current = targetDb;
  const lastElapsedRef = useRef(0);

  // マーカーを現在値へ滑らかに補間（時定数約120ms）。停止中は即時追従（reduced-motion側）。
  useIntuitionAnimation((elapsedMs) => {
    const dt = Math.min(elapsedMs - lastElapsedRef.current, 100);
    lastElapsedRef.current = elapsedMs;
    setAnimDb((prev) => {
      const target = targetRef.current;
      const k = 1 - Math.exp(-dt / 120);
      const next = prev + (target - prev) * k;
      return Math.abs(target - next) < 0.005 ? target : next;
    });
  }, playing);

  const displayDb = playing ? animDb : targetDb;
  const displayRatio = 10 ** (displayDb / 10);
  const targetRatio = 10 ** (targetDb / 10);

  const linearBarW = xLinear(displayRatio) - PLOT_X0;
  const overflowing = targetRatio > LINEAR_FULL_SCALE;
  const vanishing = !overflowing && targetRatio < 0.05;
  const overflowFactor = targetRatio / LINEAR_FULL_SCALE;

  const dbZeroX = xDb(0);
  const dbValueX = xDb(displayDb);
  const dbPositive = displayDb >= 0;
  const dbBarColor = dbPositive ? chartTheme.series.gain : chartTheme.series.loss;
  const dbTextColor = dbPositive ? chartTheme.seriesText.gain : chartTheme.seriesText.loss;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {RATIO_BUTTONS.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={() => setTargetDb((db) => clampDb(db + button.deltaDb))}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark"
            >
              {button.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setTargetDb(0)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark"
          >
            リセット（×1）
          </button>
        </div>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <svg
        role="img"
        aria-label={`電力倍率 ${formatRatio(targetRatio)} 倍を、リニア目盛とデシベル目盛の2本のものさしで表示。デシベルでは ${formatDb(targetDb)} dB。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="intuition-decibel-svg"
        data-db={displayDb.toFixed(2)}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* 上段: リニアのものさし（倍率をそのまま長さに） */}
        <text x={PLOT_X0} y={LIN_TITLE_Y} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
          リニアのものさし（倍率＝バーの長さ）
        </text>
        {overflowing ? (
          <text
            x={PLOT_X0 + PLOT_W}
            y={LIN_TITLE_Y}
            textAnchor="end"
            fill={diagramPalette.dangerDeep}
            fontSize={11}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            振り切れ！ ×{formatRatio(targetRatio)} は目盛の{" "}
            {overflowFactor >= 10 ? overflowFactor.toFixed(0) : overflowFactor.toFixed(1)}倍先
          </text>
        ) : null}
        {vanishing ? (
          <text
            x={PLOT_X0 + PLOT_W}
            y={LIN_TITLE_Y}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            fontWeight={600}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            ×{formatRatio(targetRatio)} のバーは細すぎてほぼ見えません
          </text>
        ) : null}

        <rect
          x={PLOT_X0}
          y={LIN_TRACK_Y}
          width={PLOT_W}
          height={LIN_TRACK_H}
          fill={diagramPalette.white}
          stroke={diagramPalette.line}
        />
        <rect x={PLOT_X0} y={LIN_TRACK_Y} width={Math.max(linearBarW, 0)} height={LIN_TRACK_H} fill={diagramPalette.staf} />
        {overflowing ? (
          <g aria-hidden="true">
            {/* 目盛の右端で「切れて続く」ことを示す破断記号 */}
            <line
              x1={PLOT_X0 + PLOT_W - 10}
              y1={LIN_TRACK_Y - 4}
              x2={PLOT_X0 + PLOT_W - 18}
              y2={LIN_TRACK_Y + LIN_TRACK_H + 4}
              stroke={diagramPalette.white}
              strokeWidth={3}
            />
            <line
              x1={PLOT_X0 + PLOT_W - 4}
              y1={LIN_TRACK_Y - 4}
              x2={PLOT_X0 + PLOT_W - 12}
              y2={LIN_TRACK_Y + LIN_TRACK_H + 4}
              stroke={diagramPalette.white}
              strokeWidth={3}
            />
          </g>
        ) : (
          <circle
            cx={PLOT_X0 + Math.max(linearBarW, 0)}
            cy={LIN_TRACK_Y + LIN_TRACK_H / 2}
            r={5}
            fill={diagramPalette.white}
            stroke={diagramPalette.staf}
            strokeWidth={2}
          />
        )}
        {Array.from({ length: LINEAR_FULL_SCALE + 1 }, (_, i) => (
          <g key={i}>
            <line
              x1={PLOT_X0 + (PLOT_W / LINEAR_FULL_SCALE) * i}
              y1={LIN_TRACK_Y + LIN_TRACK_H}
              x2={PLOT_X0 + (PLOT_W / LINEAR_FULL_SCALE) * i}
              y2={LIN_TRACK_Y + LIN_TRACK_H + (i % 2 === 0 ? 6 : 4)}
              stroke={diagramPalette.faint}
              strokeWidth={1}
            />
            {i % 2 === 0 ? (
              <text
                x={PLOT_X0 + (PLOT_W / LINEAR_FULL_SCALE) * i}
                y={LIN_LABEL_Y}
                textAnchor="middle"
                fill={diagramPalette.muted}
                fontSize={10}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                ×{i}
              </text>
            ) : null}
          </g>
        ))}

        {/* 下段: dBのものさし（対数目盛・-30〜+30で必ず収まる） */}
        <text x={PLOT_X0} y={DB_TITLE_Y} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
          dBのものさし（10log₁₀＝比率を等間隔に）
        </text>

        <text
          x={Math.min(Math.max(dbValueX, PLOT_X0 + 34), PLOT_X0 + PLOT_W - 34)}
          y={DB_VALUE_Y}
          textAnchor="middle"
          fill={dbTextColor}
          fontSize={13}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatDb(displayDb)} dB
        </text>

        <rect
          x={PLOT_X0}
          y={DB_TRACK_Y}
          width={PLOT_W}
          height={DB_TRACK_H}
          fill={diagramPalette.white}
          stroke={diagramPalette.line}
        />
        <rect
          x={Math.min(dbZeroX, dbValueX)}
          y={DB_TRACK_Y}
          width={Math.abs(dbValueX - dbZeroX)}
          height={DB_TRACK_H}
          fill={dbBarColor}
        />
        <line
          x1={dbZeroX}
          y1={DB_TRACK_Y - 5}
          x2={dbZeroX}
          y2={DB_TRACK_Y + DB_TRACK_H + 5}
          stroke={diagramPalette.inkMuted}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <circle
          cx={dbValueX}
          cy={DB_TRACK_Y + DB_TRACK_H / 2}
          r={5}
          fill={diagramPalette.white}
          stroke={dbTextColor}
          strokeWidth={2}
        />
        {Array.from({ length: 13 }, (_, i) => {
          const db = DB_MIN + i * 5;
          const major = db % 10 === 0;
          return (
            <g key={db}>
              <line
                x1={xDb(db)}
                y1={DB_TRACK_Y + DB_TRACK_H}
                x2={xDb(db)}
                y2={DB_TRACK_Y + DB_TRACK_H + (major ? 6 : 4)}
                stroke={diagramPalette.faint}
                strokeWidth={1}
              />
              {major ? (
                <text
                  x={xDb(db)}
                  y={DB_LABEL_Y}
                  textAnchor="middle"
                  fill={diagramPalette.muted}
                  fontSize={10}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {db > 0 ? `+${db}` : db}
                </text>
              ) : null}
            </g>
          );
        })}

        <text x={PLOT_X0} y={CAPTION_Y} fill={diagramPalette.faint} fontSize={10}>
          同じ操作でも、上のものさしは端まで走って消え、下のものさしは0.001倍〜1000倍がいつも1本に収まります。
        </text>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="intuition-decibel-ratio" className="text-sm font-semibold text-slate-900">
            電力倍率
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            ×{formatRatio(targetRatio)}（{formatDb(targetDb)} dB）
          </span>
        </div>
        <input
          id="intuition-decibel-ratio"
          type="range"
          min={DB_MIN}
          max={DB_MAX}
          step={0.05}
          value={targetDb}
          aria-label="電力倍率（対数スケール・0.001倍から1000倍）"
          className="mt-2 w-full"
          onChange={(event) => setTargetDb(Number(event.target.value))}
        />
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          ×2を押すたびに、dBのものさしは
          <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
            +3.01 dB
          </span>
          ずつ<span className="font-bold text-slate-900">同じ歩幅</span>で進みます。×2→×10→×2と掛け算を重ねても、dBなら
          3.01 + 10 + 3.01 と足すだけ——これが「掛け算が足し算になる」の正体です。
        </p>
      </div>
    </div>
  );
}

export function Chapter2Decibel() {
  return (
    <ChapterFrame
      chapterId="decibel"
      experienceHint="×2・×10のボタンを連打してください。上のリニア目盛はすぐ振り切れますが、下のdB目盛は等間隔に進み続けて必ず収まります。"
      experience={<DecibelExperience />}
      grasp={[
        "×2は+3dB、×10は+10dB。倍率の掛け算が、dBでは足し算に変わる。",
        "増幅も損失も何段つながってもdBなら足し引きだけ。だからリンクバジェットは1行の足し算で書ける。",
        "dBは『比率』、dBmは『1mWを基準にした絶対値』。0dBm=1mW、+10dBm=10mW。"
      ]}
      practice={{
        text: "リンクバジェットでは送信電力・アンテナ利得・経路損失をすべてdBで足し引きします。dBm⇄mWの換算感覚は、専用ツールで手に馴染ませるのが早道です。",
        toolHref: "/tools/db-feel",
        toolLabel: "dB体感ツールでもっと遊ぶ"
      }}
      deepDive={{
        formula:
          "dB = 10 log₁₀(P₂/P₁)（電力比）\n電圧比は 20 log₁₀(V₂/V₁)（P ∝ V²/R のため。同一インピーダンスでの比較が前提）\ndBm = 10 log₁₀(P / 1mW)　例: 1mW = 0dBm、100mW = +20dBm\n×2 = +3.0103 dB（「+3dB」は丸め）",
        body: (
          <>
            <p>
              この図のうそ：リニアものさしの「振り切れ」は演出です。実際には目盛の最大値を1000倍に取り直せば収まります——
              本当の問題は「1本のものさしで0.001倍から1000倍（6桁）まで読めるか」で、リニア軸でそれをやると×2の変化は
              線の太さ以下になって読めません。dBは桁をまたぐ量を等間隔に写す座標変換で、どのスケールでも同じ歩幅で読めます。
            </p>
            <p>
              dBは無次元の「比」で、dBm・dBW・dBμVのように基準を固定すると「絶対値」になります。単位の混在
              （dB同士の足し算はよいが、dBm+dBmは物理的に無意味）は実務の定番ミスなので、式を書くときは基準を必ず明記してください。
            </p>
          </>
        )
      }}
      column={{
        title: "人間の感覚は最初から対数だった",
        body: (
          <>
            <p>
              2100年前、ギリシャの天文学者ヒッパルコスは夜空の星を明るさで6段階に分けました。最も明るい星が1等星、
              目でやっと見える星が6等星。19世紀に光の量を測定できるようになると、驚くべきことが分かります——
              1等星は6等星のほぼ100倍明るかったのです。5段で100倍、つまり1段は約2.5倍。人間の目は明るさの「差」ではなく
              「比」を等間隔に感じていました。星の等級は、人類が無自覚のうちに作った最初の対数目盛だったのです。
            </p>
            <p>
              音も同じです。ウェーバーとフェヒナーは19世紀に「感覚の強さは刺激の対数に比例する」という法則にまとめました。
              ささやき声も雷鳴も聞き分ける耳は、100万倍を超える強さの幅を対数で圧縮して受け取っています。
              だから20世紀初頭、ベルシステムの電話技師たちが回線の損失を表す単位を設計したとき、対数を選んだのは
              数学の趣味ではありません。通話品質を最後に判定するのは人間の耳であり、耳が対数で聞くなら単位も対数であるべき
              ——それだけの必然でした。「標準ケーブル1マイルぶんの減衰」という不便な基準は1920年代に対数の伝送単位（TU）へ
              置き換えられ、1929年、電話の父グラハム・ベルに敬意を表して「デシベル」と改名されます。
              あなたがさっき押した「×2＝+3dB」の等しい歩幅は、星を数えた古代の目と音を聞く耳の性質を、そのまま単位にしたものです。
            </p>
          </>
        ),
        breakNote:
          "「感覚＝対数」は近似で、現代の精神物理学ではスティーヴンスのべき法則が有力です——それでも「等比を等間隔に感じる」という大枠と、dBが耳に合うという実用は揺らぎません。",
        sources: [
          {
            label: "G. T. Fechner, Elemente der Psychophysik (1860)",
            note: "「感覚は刺激の対数に比例する」精神物理学の原典"
          },
          {
            label: "S. S. Stevens, \"On the psychophysical law\", Psychological Review (1957)",
            note: "対数法則を修正するべき法則の提案"
          },
          {
            label: "W. H. Martin, \"The Transmission Unit and Telephone Transmission Reference Systems\", Bell Syst. Tech. J. (1929)",
            note: "伝送単位TUとデシベル命名の経緯"
          }
        ]
      }}
    />
  );
}
