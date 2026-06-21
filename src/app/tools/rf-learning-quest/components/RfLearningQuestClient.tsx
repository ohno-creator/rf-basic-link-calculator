"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Swords
} from "lucide-react";

type LessonLevel = "初心者" | "見習い" | "実務者" | "玄人";

type Lesson = {
  id: string;
  level: LessonLevel;
  title: string;
  enemy: string;
  question: string;
  choices: string[];
  correctIndex: number;
  immediateAnswer: string;
  explanation: string;
  appLink: {
    href: string;
    label: string;
  };
  column: string;
};

const STORAGE_KEY = "rf-learning-quest-progress:v1";

const lessons: Lesson[] = [
  {
    id: "db-basics",
    level: "初心者",
    title: "dBのものさしを手に入れる",
    enemy: "dBスライム",
    question: "+3dBは、電力で見るとおおよそ何倍ですか？",
    choices: ["約1.2倍", "約2倍", "約10倍"],
    correctIndex: 1,
    immediateAnswer: "+3dBは電力で約2倍です。",
    explanation:
      "dBは倍率を足し算で扱うための単位です。+10dBで10倍、+3dBで約2倍、-3dBで約半分と覚えるとリンクバジェットの足し引きが読みやすくなります。",
    appLink: { href: "/tools/db-feel", label: "dBを体感する" },
    column:
      "リンクバジェットでは、送信電力、アンテナ利得、損失、補正値をすべてdB系で足し引きします。まずdBの感覚ができると、以降の計算が一気に楽になります。"
  },
  {
    id: "fspl-distance",
    level: "初心者",
    title: "距離2倍の呪文",
    enemy: "距離ゴーレム",
    question: "自由空間損失では、距離が2倍になると損失はおおよそどう変わりますか？",
    choices: ["約3dB増える", "約6dB増える", "約20dB増える"],
    correctIndex: 1,
    immediateAnswer: "距離2倍で自由空間損失は約6dB増えます。",
    explanation:
      "FSPLは距離に対して20log10(d)で増えます。2倍なら20log10(2)≒6dBです。これは見通し条件の基準で、実環境では遮蔽や反射がさらに乗ります。",
    appLink: { href: "/tools/free-space-loss", label: "自由空間損失を試す" },
    column:
      "セル半径を倍に伸ばすには、単純なFSPLだけでも約6dBの余裕が必要です。現実にはシャドウフェージングや建物損失もあるため、余裕はさらに必要になります。"
  },
  {
    id: "two-ray",
    level: "見習い",
    title: "地面反射の山谷を読む",
    enemy: "反射ミラー",
    question: "2波モデルで、距離に対して損失グラフが波打つ主な理由はどれですか？",
    choices: ["直接波と地面反射波が干渉するため", "送信電力が周期的に変わるため", "受信感度が距離で変わるため"],
    correctIndex: 0,
    immediateAnswer: "直接波と地面反射波の位相差で、強め合い・弱め合いが起きます。",
    explanation:
      "2波モデルの完全版では、直接波と反射波を位相込みで合成します。少し位置が変わるだけで強め合いから弱め合いへ移るため、局所的な山谷が出ます。リンク判定では平滑化した包絡線と実測補正を併用します。",
    appLink: { href: "/tools/propagation-loss", label: "2波モデル実験室を見る" },
    column:
      "実機を数十cm動かすだけでRSSIが大きく変わる現象は、この干渉の谷を踏んだ可能性があります。低高度端末では設置高さと向きがとても効きます。"
  },
  {
    id: "near-terminal-loss",
    level: "見習い",
    title: "端末近傍損失の罠",
    enemy: "筐体シールド",
    question: "Hata系モデルだけでは表しにくく、別途加算すべきものはどれですか？",
    choices: ["端末筐体・地面近接・人体遮蔽", "周波数の単位変換", "送信電力のdBm変換"],
    correctIndex: 0,
    immediateAnswer: "端末筐体・地面近接・人体遮蔽などは端末近傍損失として別枠で見ます。",
    explanation:
      "Hata系は高所基地局から移動局までの広域平均損失を扱う経験式です。地面に近いIoT端末では、筐体、基板GND、車両、人体、設置方向の影響が支配的になることがあります。",
    appLink: { href: "/tools/rf-basic-link-calculator", label: "リンクバジェットで近傍損失を入れる" },
    column:
      "同じ測定差分を環境損失、筐体損失、実測補正値へ何度も入れると二重計上になります。原因が分かるものは個別損失へ、残差だけを実測補正へ入れます。"
  },
  {
    id: "hata-height",
    level: "実務者",
    title: "hb/hmの門番",
    enemy: "Hata門番",
    question: "奥村・秦モデルで重要な入力条件として正しいものはどれですか？",
    choices: ["基地局高hbと移動局高hm", "ケーブル色", "受信機のメーカー名"],
    correctIndex: 0,
    immediateAnswer: "奥村・秦モデルでは基地局高hbと移動局高hmが式に入ります。",
    explanation:
      "Hata系では周波数、距離、基地局高、移動局高、エリア種別が伝搬損失に効きます。一般的な目安は150〜1500MHz、1〜20km、hb 30〜200m、hm 1〜10mです。",
    appLink: { href: "/tools/propagation-loss", label: "Hata系を比較する" },
    column:
      "低高度端末同士ではHata系を主モデルにしない、という判断も重要です。モデルを使うより、モデルの前提を外したときに警告を読めることが実務力です。"
  },
  {
    id: "reliability",
    level: "実務者",
    title: "信頼率マージンの盾",
    enemy: "シャドウフェード",
    question: "90%や95%の信頼率つき距離評価で短くなる主な理由はどれですか？",
    choices: ["シャドウフェージング分の余裕を差し引くため", "周波数が自動で下がるため", "アンテナ利得が消えるため"],
    correctIndex: 0,
    immediateAnswer: "信頼率を上げると、場所ばらつき分の余裕を差し引くため最大距離は短くなります。",
    explanation:
      "平均損失だけで届く距離は、半分程度の場所で成立する中央値に近い評価です。実務ではσと目標信頼率から余裕を取り、中央値損失が許容値を下回る距離を探します。",
    appLink: { href: "/tools/rf-basic-link-calculator", label: "研究ベース距離計算を開く" },
    column:
      "基地局設計では、カバレッジ確率、干渉、容量、地図クラッタ、ドライブテスト補正を合わせて見ます。距離だけでなく、何%の場所で成立させるかが重要です。"
  },
  {
    id: "carrier-models",
    level: "玄人",
    title: "標準モデルを使い分ける",
    enemy: "モデル迷宮",
    question: "都市街路NLOSの屋根越し・街路回折を簡易的に見るモデルとして近いものはどれですか？",
    choices: ["COST231 Walfisch-Ikegami", "dBm/mW変換", "VSWR変換"],
    correctIndex: 0,
    immediateAnswer: "COST231 Walfisch-Ikegamiは都市街路NLOSの簡易比較に使えます。",
    explanation:
      "街路幅、平均建物高、建物間隔、道路角度などを使い、都市の屋根越し・街路回折を近似します。実キャリア設計ではGIS、クラッタ、アンテナパターン、レイトレース、実測補正も重ねます。",
    appLink: { href: "/tools/rf-basic-link-calculator", label: "研究ベース距離計算で比較する" },
    column:
      "SUI Terrain A/B/C、3GPP UMi/UMa、COST231 WI、CI/Dual-slopeを並べると、『モデルで距離がどれだけ変わるか』が見えます。実測があるなら最後は補正値で閉じます。"
  },
  {
    id: "measurement-loop",
    level: "玄人",
    title: "実測でモデルを鍛える",
    enemy: "残差ドラゴン",
    question: "現地RSSI/RSRPが計算より10dB悪いとき、最初に確認すべき考え方はどれですか？",
    choices: ["入力違い・近傍損失・遮蔽を確認し、残差を実測補正に入れる", "送信電力を無限に上げる", "モデル警告を隠す"],
    correctIndex: 0,
    immediateAnswer: "まず入力違いと原因別損失を確認し、残った差分だけを実測補正に入れます。",
    explanation:
      "周波数、距離、アンテナ高、利得、ケーブル損失が正しいかを確認し、筐体や遮蔽など原因が分かる損失は個別欄へ入れます。残差だけを補正値へ入れると、二重計上を避けられます。",
    appLink: { href: "/tools/rf-basic-link-calculator", label: "実測補正を入れる" },
    column:
      "単一点補正はアンカー近傍では有効ですが、遠距離へ外挿すると距離勾配がずれることがあります。複数距離の実測でLog-distanceのnやIoT実測補正Hataの勾配を合わせます。"
  }
];

function loadProgress(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, boolean>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 保存できない環境では、現在セッションだけで進める。
  }
}

export function RfLearningQuestClient() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const completedCount = useMemo(() => lessons.filter((lesson) => progress[lesson.id]).length, [progress]);
  const xp = completedCount * 120;

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  function answerLesson(lesson: Lesson, choiceIndex: number) {
    setAnswers((current) => ({ ...current, [lesson.id]: choiceIndex }));
    if (choiceIndex === lesson.correctIndex) {
      setProgress((current) => {
        const next = { ...current, [lesson.id]: true };
        saveProgress(next);
        return next;
      });
    }
  }

  function resetProgress() {
    setProgress({});
    setAnswers({});
    saveProgress({});
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-staf">
              <Swords aria-hidden="true" className="h-4 w-4" />
              RF学習クエスト
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              問題を倒して、リンク設計の勘を育てる
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              問題を選ぶと即答えが出て、なぜそうなるか、どのツールで試せるか、現場では何に注意するかまで確認できます。
              進捗はこのブラウザに保存されます。
            </p>
          </div>
          <div className="rounded-lg border border-staf/20 bg-staf-light p-4 text-staf">
            <p className="text-xs font-bold">冒険進捗</p>
            <p className="mt-1 text-2xl font-bold">
              {completedCount}/{lessons.length}
            </p>
            <p className="text-xs font-semibold">XP {xp}</p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-staf/30 bg-white px-2.5 py-1.5 text-xs font-bold text-staf"
              onClick={resetProgress}
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              リセット
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {lessons.map((lesson, index) => {
          const selected = answers[lesson.id];
          const answered = selected !== undefined;
          const correct = selected === lesson.correctIndex;
          const done = Boolean(progress[lesson.id]);

          return (
            <article key={lesson.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-400">
                    STAGE {index + 1} / {lesson.level}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">{lesson.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">対戦相手：{lesson.enemy}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    done ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {done ? <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> : <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />}
                  {done ? "攻略済み" : "未攻略"}
                </span>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-950">{lesson.question}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {lesson.choices.map((choice, choiceIndex) => {
                    const isSelected = selected === choiceIndex;
                    const isCorrect = choiceIndex === lesson.correctIndex;
                    const tone =
                      answered && isCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : answered && isSelected
                          ? "border-rose-300 bg-rose-50 text-rose-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-staf/40";

                    return (
                      <button
                        key={choice}
                        type="button"
                        className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${tone}`}
                        onClick={() => answerLesson(lesson, choiceIndex)}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {answered ? (
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                  <section className={`rounded-lg border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                      {correct ? <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" /> : <Sparkles aria-hidden="true" className="h-4 w-4 text-amber-700" />}
                      {correct ? "正解" : "惜しい"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{lesson.immediateAnswer}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{lesson.explanation}</p>
                    <Link
                      href={lesson.appLink.href}
                      className="mt-3 inline-flex items-center gap-1 rounded-md bg-staf px-3 py-2 text-sm font-bold text-white transition hover:bg-staf-dark"
                    >
                      {lesson.appLink.label}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </section>

                  <details open className="rounded-lg border border-slate-200 bg-white p-4">
                    <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-950">
                      <BookOpen aria-hidden="true" className="h-4 w-4 text-staf" />
                      現場コラム
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{lesson.column}</p>
                  </details>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
