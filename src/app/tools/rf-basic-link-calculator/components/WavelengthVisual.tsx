import { Accordion } from "@/components/Accordion";
import { calculateWavelengthFromMHz } from "@/lib/rf/frequency";
import { formatMeters } from "@/lib/rf/format";
import { DielectricImpactTable } from "./DielectricImpactTable";
import { HalfWaveResonanceDiagram } from "./HalfWaveResonanceDiagram";

type WavelengthVisualProps = {
  frequencyMHz: number;
  // 入力が有効なときだけ「入力値」行を表示する。無効でもチャート枠と固定行は残す。
  hasInput?: boolean;
};

const baseRows = [
  { label: "920MHz", frequencyMHz: 920 },
  { label: "2.4GHz", frequencyMHz: 2400 },
  { label: "5GHz", frequencyMHz: 5000 },
  { label: "6GHz", frequencyMHz: 6000 }
];

export function WavelengthVisual({ frequencyMHz, hasInput = true }: WavelengthVisualProps) {
  const showInputRow = hasInput && Number.isFinite(frequencyMHz) && frequencyMHz > 0;
  const inputRows = showInputRow ? [{ label: "入力値", frequencyMHz }] : [];
  const rows = [...baseRows, ...inputRows].map((row) => {
    // アンテナの基準寸法は半波長（λ/2）なので、半波長を表示する。
    const halfWavelengthM = calculateWavelengthFromMHz(row.frequencyMHz) / 2;
    return { ...row, halfWavelengthM };
  });

  // 一番長い半波長を基準（100%）にしてバー幅を決める。
  const maxHalf = Math.max(...rows.map((row) => row.halfWavelengthM));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-950">半波長アンテナ長の目安（λ/2）</h3>
        <span className="text-xs font-medium text-slate-500">共振する基本サイズ</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        ダイポールなど基本的なアンテナは、長さが半波長（λ/2）のときに共振します。各周波数のλ/2を比較しています。
      </p>

      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const current = row.label === "入力値";
          const width = Math.max(14, Math.min(100, (row.halfWavelengthM / maxHalf) * 100));

          return (
            <div
              key={`${row.label}-${row.frequencyMHz}`}
              className="grid grid-cols-[80px_1fr_90px] items-center gap-3 text-sm"
            >
              <span className={current ? "font-semibold text-staf-dark" : "text-slate-600"}>
                {row.label}
              </span>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${current ? "bg-staf" : "bg-slate-400"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-right font-medium text-slate-800">
                {formatMeters(row.halfWavelengthM)}
              </span>
            </div>
          );
        })}
      </div>

      {!showInputRow ? (
        <p className="mt-3 text-xs font-medium text-rose-700">
          有効な周波数を入力すると「入力値」のバーが追加されます。
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        周波数が高いほど半波長は短くなり、アンテナも小さくできます。表示値は理想的なλ/2で、実際の共振長は端部効果などで数%短くなります。
      </p>

      <div className="mt-4 rounded-lg border border-staf/20 bg-staf-light p-4">
        <p className="text-sm font-semibold text-slate-950">なぜ半波長なのか</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          アンテナが電波を効率よく放射するには、導体の長さが波長と釣り合っている必要があります。長さがちょうど半波長（λ/2）のとき、導体上の電流分布が定在波としてきれいに収まり「共振」します。共振時は給電点インピーダンスが純抵抗（半波長ダイポールで約73Ω）になり、反射が少なく、給電した電力を効率よく電波に変えられます。これが半波長がアンテナ設計の基準寸法になる本質的な理由です。
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-4">
        <h4 className="text-sm font-semibold text-slate-950">一般解説（入力非依存）</h4>
        <span className="text-xs font-medium text-slate-500">
          以下の図・表は入力周波数では変わりません
        </span>
      </div>

      <HalfWaveResonanceDiagram />

      <DielectricImpactTable />

      <div className="mt-4 space-y-3">
        <Accordion title="半波長を縮める工夫（誘電率・装荷）">
          <p>製品ではλ/2のままだと大きすぎることが多く、いくつかの小型化手法で物理長を縮めます。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-semibold text-slate-800">誘電体装荷</span>
              ：比誘電率εrの高い材料の中では波長が λ/√εr に短くなります。セラミックチップアンテナのように、高εr材を使って物理サイズを小さくします。実際の効き方は、誘電体の厚さや、エレメントの片面だけか両面を覆うか（実効比誘電率 εeff）で変わります。
            </li>
            <li>
              <span className="font-semibold text-slate-800">メアンダ／ヘリカル形状</span>
              ：導体を蛇行・らせん状に折りたたみ、限られたスペースで電気的な長さを確保します。
            </li>
            <li>
              <span className="font-semibold text-slate-800">ローディング（装荷）</span>
              ：途中にコイル（インダクタ）を入れたり、先端に容量を付けたりして、短い導体でも共振させます。
            </li>
          </ul>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-white">
            <code>誘電体中の波長 λg = λ0 / √εr</code>
          </pre>
        </Accordion>

        <Accordion title="小型化すると特性はどう劣化する？">
          <p>アンテナを半波長より小さくすると、特性は必ずどこかが犠牲になります。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>放射効率の低下：導体や誘電体の損失が相対的に大きくなり、電波に変わらず熱になる割合が増えます。</li>
            <li>帯域が狭くなる：Q値が高くなって共振が鋭くなり、使える周波数範囲が狭まります。</li>
            <li>利得の低下：放射効率の低下に伴い、利得も下がります。</li>
            <li>マッチングがシビアに：筐体、基板GND、周辺部品、人体の影響を受けやすく、量産ばらつきにも敏感になります。</li>
          </ul>
          <p className="mt-2">
            これは小型アンテナの物理的な限界（Chu限界）に由来し、「小型化」と「効率・帯域」は本質的にトレードオフの関係です。どこまで小さくして目標性能を満たせるかは、筐体込みの実機評価で見極めるのが確実です。
          </p>
        </Accordion>
      </div>
    </section>
  );
}
