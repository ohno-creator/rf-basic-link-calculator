import { Accordion } from "@/components/Accordion";
import { Callout } from "@/components/Callout";

export function WallPenetrationColumn() {
  return (
    <section className="mt-8 space-y-4" aria-labelledby="wall-column-title">
      <div>
        <p className="text-sm font-semibold text-staf-dark">設計コラム</p>
        <h2 id="wall-column-title" className="mt-1 text-xl font-bold text-slate-950">
          壁損失は「材質名」だけでは一つに決まらない
        </h2>
      </div>
      <Accordion title="なぜレンジで表示する？">
        <p className="text-sm leading-relaxed text-slate-700">
          同じコンクリートでも厚さ、含水率、鉄筋間隔、入射角で損失が変わります。特にLow-Eガラスは金属膜の仕様、
          鉄筋コンクリートは開口や鉄筋配置による差が大きいため、単一値より最小〜最大レンジで余裕を見る方が安全です。
        </p>
      </Accordion>
      <Accordion title="リンクバジェットへの入れ方">
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            経路上の壁を順に通過する場合、各壁の電力倍率は乗算されるため、対数表現のdBでは加算します。
            最悪側の合計を環境損失としてリンクバジェットへ入れると、設置差を含む保守的な確認になります。
          </p>
          <Callout tone="caution" size="sm">
            本値は代表レンジです。重要回線は現地測定を行い、扉の開閉、人、家具、回折経路による時間変動も確認してください。
          </Callout>
        </div>
      </Accordion>
    </section>
  );
}
