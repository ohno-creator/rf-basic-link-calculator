import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Database,
  Gauge,
  Info,
  RadioTower,
  Ruler,
  Waves
} from "lucide-react";
import { Callout } from "@/components/Callout";
import { Tooltip } from "@/components/Tooltip";
import { getPropagationModelOption } from "@/data/linkBudgetOptions";
import { getCommunicationMode, type LinkBudgetInput } from "@/lib/rf/linkBudget";

type ModelAssumptionGuideProps = {
  input: LinkBudgetInput;
};

const modelRows: Array<{
  model: LinkBudgetInput["propagationModel"];
  title: string;
  inputs: string;
  assumption: string;
  mismatch: string;
}> = [
  {
    model: "free_space",
    title: "自由空間損失モデル",
    inputs: "周波数、通信距離",
    assumption: "反射・遮蔽・筐体を含まない見通し基準です。",
    mismatch: "低高度IoTでは良く出すぎやすいため、環境損失と端末近傍損失を別途入れます。"
  },
  {
    model: "two_ray",
    title: "2波モデル",
    inputs: "周波数、通信距離、送信側アンテナ高、受信側アンテナ高",
    assumption: "直接波と地面反射を単純化して扱います。",
    mismatch: "近距離側や複雑な地面・壁・車両環境では深い落ち込みを再現しきれません。"
  },
  {
    model: "log_distance",
    title: "Log-distanceモデル",
    inputs: "周波数、通信距離、距離損失指数 n",
    assumption: "現地環境の距離減衰を指数で近似します。",
    mismatch: "nを実測で合わせないと、屋内・倉庫・市街地で大きくずれることがあります。"
  },
  {
    model: "measured_correction",
    title: "実測補正モデル",
    inputs: "自由空間損失、実測補正値、リンクバジェット各項目",
    assumption: "計算値と現地RSSI/RSRPの差分をまとめて補正します。",
    mismatch: "同じ損失を環境損失や端末近傍損失にも入れると二重計上になります。"
  },
  {
    model: "iot_hata_calibrated",
    title: "IoT実測補正Hataモード",
    inputs: "Hata系入力、実測アンカー距離、実測受信電力、距離勾配補正",
    assumption: "Hata/COST231-Hataを基準線にし、現地測定でオフセットを校正します。",
    mismatch: "アンカー距離から大きく外挿する場合は、複数地点測定で勾配を確認します。"
  },
  {
    model: "okumura_hata",
    title: "奥村・秦モデル（参考）",
    inputs: "周波数、距離、基地局高 hb、移動局高 hm、エリア種別",
    assumption: "高所基地局と移動局の広域平均損失を扱う経験式です。",
    mismatch: "低高度端末・短距離・屋内・地面近接は適用範囲外として警告を確認します。"
  },
  {
    model: "cost231_hata",
    title: "COST231-Hataモデル（参考）",
    inputs: "周波数、距離、基地局高 hb、移動局高 hm、エリア種別",
    assumption: "Hataを1.5〜2GHz帯へ拡張したセルラー向け参考式です。",
    mismatch: "2GHz超、低高度端末同士、屋内・筐体内蔵条件では参考値扱いにします。"
  }
];

function selectedModeSummary(input: LinkBudgetInput) {
  const communicationMode = getCommunicationMode(input.linkType);

  if (communicationMode === "high_base_station_to_iot_terminal") {
    return {
      title: "高所基地局 → 地上近傍IoT端末",
      text:
        "Hata系モデルは基地局から端末付近までの広域平均の参考値として使い、端末直近の地面・筐体・遮蔽・設置ばらつきは端末近傍損失へ分けて入れます。"
    };
  }

  if (communicationMode === "gateway_to_low_height_terminal") {
    return {
      title: "ゲートウェイ → 低高度端末",
      text:
        "低い位置のゲートウェイでは、地面反射、フレネルゾーン欠損、周辺遮蔽物、アンテナ高の影響が大きくなります。自由空間、2波、Log-distance、実測補正を主に見て、Hata系は参考値として扱います。"
    };
  }

  if (communicationMode === "low_height_terminal_to_terminal") {
    return {
      title: "低高度端末 ↔ 低高度端末",
      text:
        "地面反射、フレネルゾーン欠損、アンテナ高、周辺遮蔽物の影響が支配的です。自由空間、2波、Log-distance、実測補正を主に見て、Hata系は参考値として扱います。"
    };
  }

  return {
    title: "カスタム条件",
    text:
      "アンテナ高、距離、損失、実測補正を個別に設定する条件です。選んだ伝搬モデルの適用範囲と、損失の二重計上を確認してください。"
  };
}

export function ModelAssumptionGuide({ input }: ModelAssumptionGuideProps) {
  const activeModel = getPropagationModelOption(input.propagationModel);
  const activeRows = modelRows.map((row) => ({
    ...row,
    active: row.model === input.propagationModel
  }));
  const modeSummary = selectedModeSummary(input);

  return (
    <div className="space-y-4">
      <Callout
        tone="info"
        size="md"
        icon={<Crosshair aria-hidden="true" className="h-5 w-5" />}
        title={modeSummary.title}
      >
        <p className="leading-relaxed">{modeSummary.text}</p>
        <p className="mt-2 text-xs leading-relaxed">
          現在の主モデルは「{activeModel.label}」です。下の表で、どの入力が計算に効くかを確認できます。
        </p>
      </Callout>

      <div className="grid gap-3">
        {activeRows.map((row) => (
          <article
            key={row.model}
            className={`rounded-lg border p-4 ${
              row.active ? "border-staf bg-staf/5 shadow-card" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-950">{row.title}</h3>
              {row.active ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-staf px-2.5 py-1 text-xs font-bold text-white">
                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                  選択中
                </span>
              ) : null}
            </div>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1 font-semibold text-slate-700">
                  <Ruler aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  使う入力
                </dt>
                <dd className="mt-1 leading-relaxed text-slate-600">{row.inputs}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 font-semibold text-slate-700">
                  <Info aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  前提
                </dt>
                <dd className="mt-1 leading-relaxed text-slate-600">{row.assumption}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 font-semibold text-slate-700">
                  <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-600" />
                  ずれやすい点
                </dt>
                <dd className="mt-1 leading-relaxed text-slate-600">{row.mismatch}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <Callout
        tone="caution"
        size="md"
        icon={<Gauge aria-hidden="true" className="h-5 w-5" />}
        title="二重計上に注意"
      >
            <p className="leading-relaxed">
              同じ現象を複数欄へ入れると、リンクマージンを必要以上に悪く見積もります。
              <Tooltip term="二重計上">
                例えば筐体による差分を「環境損失」と「筐体損失」と「実測補正値」に同時に入れると、同じ損失を何度も引くことになります。
              </Tooltip>
            </p>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed sm:grid-cols-3">
              <li className="rounded-md bg-white/70 p-3">
                <span className="font-semibold">環境損失</span>
                <br />
                建物、壁、クラッタ、設置環境の広めの追加損失。
              </li>
              <li className="rounded-md bg-white/70 p-3">
                <span className="font-semibold">端末近傍損失</span>
                <br />
                地面、筐体、偏波、人体・車両、設置ばらつきなど端末直近の損失。
              </li>
              <li className="rounded-md bg-white/70 p-3">
                <span className="font-semibold">実測補正値</span>
                <br />
                現地
                <Tooltip term="RSSI/RSRP">
                  RSSIは受信信号強度の総量、RSRPはLTE系で参照信号の受信電力を表す指標です。同じ指標で継続比較してください。
                </Tooltip>
                と計算値の残差をまとめる欄。
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed">
              IoT実測補正Hataモードでは、実測アンカー点からHata基準との差分を既に推定します。
              追加で「実測補正値」を入れる場合は、アンカー補正とは別の要因だけを入れてください。
            </p>
      </Callout>

      <Callout
        tone="neutral"
        size="md"
        icon={<Database aria-hidden="true" className="h-5 w-5" />}
        title="現地実測で確認する順番"
      >
            <ol className="list-decimal space-y-1 pl-5 leading-relaxed">
              <li>送信電力、アンテナ利得、アンテナ高、距離を現地条件に合わせます。</li>
              <li>筐体・地面・遮蔽など、原因が分かる損失は個別欄へ入れます。</li>
              <li>残った差分だけを実測補正値、またはIoT実測補正Hataのアンカー点へ入れます。</li>
              <li>距離が大きく変わる場合は、複数地点で距離勾配補正を確認します。</li>
            </ol>
      </Callout>

      <Callout
        tone="success"
        size="md"
        icon={<RadioTower aria-hidden="true" className="h-5 w-5" />}
        title="奥村・秦の高さ入力"
      >
            <p className="leading-relaxed">
              奥村・秦/COST231-Hataでは、送信側アンテナ高を
              <Tooltip term="hb">基地局アンテナ高です。一般的な目安は30〜200mです。</Tooltip>
              、受信側アンテナ高を
              <Tooltip term="hm">移動局アンテナ高です。一般的な目安は1〜10mです。</Tooltip>
              として使います。値は固定ではなく、入力欄の変更が伝搬損失へ反映されます。
            </p>
      </Callout>

      <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <div className="flex items-start gap-3">
          <Waves aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" />
          <div>
            <h3 className="text-sm font-bold text-indigo-950">最新研究から見た使い方</h3>
            <p className="mt-1 text-sm leading-relaxed text-indigo-900">
              2025〜2026年のIoT伝搬研究では、単一の経験式をそのまま使うより、実測値、壁・クラッタ、温湿度や在室状況などの環境特徴量、残差分布から決めるフェードマージンを組み合わせる方向が強まっています。
              本ツールでは、その考え方を「端末近傍損失」「実測補正値」「IoT実測補正Hata」「研究ベース距離計算」に分けて入力できるようにしています。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
