import { Card } from "@/components/Card";
import { Tooltip } from "@/components/Tooltip";
import { getPropagationModelOption, linkTypeOptions } from "@/data/linkBudgetOptions";
import {
  calculateNearTerminalLossDb,
  getCommunicationMode,
  normalizeDistanceKm,
  type LinkBudgetInput
} from "@/lib/rf/linkBudget";
import { isHataFamily } from "./linkBudgetPanelShared";

export function InputAssumptionMenu({ input }: { input: LinkBudgetInput }) {
  const linkType = linkTypeOptions.find((option) => option.value === input.linkType) ?? linkTypeOptions[0];
  const model = getPropagationModelOption(input.propagationModel);
  const distanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  const nearLossDb = calculateNearTerminalLossDb(input);
  const communicationMode = getCommunicationMode(input.linkType);
  const isLowTerminalPair = communicationMode === "low_height_terminal_to_terminal";
  const isLowGatewayLink = communicationMode === "gateway_to_low_height_terminal";
  const lossBucketRows = [
    {
      label: "環境損失",
      value: `${input.environmentLossDb.toFixed(1)} dB`,
      note: "壁・屋内外・周辺クラッタなど、経路全体に近い追加損失。"
    },
    {
      label: "端末近傍損失",
      value: `${nearLossDb.toFixed(1)} dB`,
      note: "地面近接・筐体・偏波・遮蔽・設置ばらつきなど、端末周りの損失。"
    },
    {
      label: "実測補正値",
      value: `${input.calibrationOffsetDb.toFixed(1)} dB`,
      note: "現地RSSI/RSRPと計算の残差。原因別に入れた損失は再入力しない。"
    }
  ];

  return (
    <Card padding="md" shadow={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-950">入力前提チェックメニュー</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            計算前に、通信形態、モデル、距離・高さ、損失の入れ分けを確認します。各見出しは折りたたみ可能です。
          </p>
        </div>
        <Tooltip term="前提チェック">
          ここは計算式そのものではなく、入力が現実の条件とずれていないかを見る確認メニューです。迷ったら、通信形態→伝搬モデル→距離/高さ→損失→実測補正の順に確認します。
        </Tooltip>
      </div>

      <div className="mt-3 grid gap-2">
        <details className="rounded-md border border-slate-200 bg-slate-50 p-3" open>
          <summary className="cursor-pointer text-xs font-bold text-slate-900">1. 通信形態と推奨モデル</summary>
          <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">現在：</span>
              {linkType.label}。{linkType.description}
            </p>
            <p>
              <span className="font-semibold text-slate-900">推奨：</span>
              {linkType.recommendedModels}
            </p>
            {isLowTerminalPair && isHataFamily(input.propagationModel) ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-2 font-semibold text-amber-900">
                低高度端末同士でHata系を選んでいます。結果は比較値として扱い、2波、Log-distance、実測補正を主に見てください。
              </p>
            ) : null}
            {isLowGatewayLink && isHataFamily(input.propagationModel) ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-2 font-semibold text-amber-900">
                低い位置のゲートウェイと低高度端末でHata系を選んでいます。結果は比較値として扱い、2波、Log-distance、実測補正を主に見てください。
              </p>
            ) : null}
          </div>
        </details>

        <details className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-900">2. 伝搬モデルが含むもの・含まないもの</summary>
          <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">現在：</span>
              {model.label}。{model.description}
            </p>
            <p>
              <span className="font-semibold text-slate-900">含まないもの：</span>
              筐体内蔵アンテナの劣化、人体・車両遮蔽、設置方向ばらつき、現地RSSI/RSRPの残差は別欄で扱います。
            </p>
            {input.propagationModel === "two_ray" ? (
              <p className="rounded-md border border-orange-200 bg-orange-50 p-2 text-orange-900">
                2波モデルのリンク判定は平滑化した包絡線です。直接波と反射波の干渉による山谷は、結果タブの「2波モデル実験室」で確認してください。
              </p>
            ) : null}
          </div>
        </details>

        <details className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-900">3. 距離・高さの前提</summary>
          <div className="mt-2 grid gap-2 text-xs leading-relaxed text-slate-600 sm:grid-cols-3">
            <p className="rounded-md bg-white p-2">
              <span className="block font-semibold text-slate-900">2D距離</span>
              {Number.isFinite(distanceKm) ? `${distanceKm.toFixed(3)} km` : "未入力"}
            </p>
            <p className="rounded-md bg-white p-2">
              <span className="block font-semibold text-slate-900">送信側アンテナ高</span>
              {input.txAntennaHeightM.toFixed(1)} m
            </p>
            <p className="rounded-md bg-white p-2">
              <span className="block font-semibold text-slate-900">受信側アンテナ高</span>
              {input.rxAntennaHeightM.toFixed(1)} m
            </p>
            <p className="sm:col-span-3">
              距離は地図上の水平距離に近い前提です。地形起伏、建物高、屋内侵入、道路角度、アンテナ指向性は完全には再現しません。
            </p>
          </div>
        </details>

        <details className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-900">4. 損失の入れ分けと二重計上</summary>
          <div className="mt-2 grid gap-2 text-xs leading-relaxed text-slate-600">
            {lossBucketRows.map((row) => (
              <div key={row.label} className="rounded-md bg-white p-2">
                <p className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </p>
                <p className="mt-1">{row.note}</p>
              </div>
            ))}
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2 font-semibold text-amber-900">
              同じ「筐体で悪い」「人体で遮蔽された」「測定で10dB悪い」を複数欄に入れると、悲観的すぎる結果になります。
            </p>
          </div>
        </details>
      </div>
    </Card>
  );
}
