const scaleItems = [
  { dbm: "0dBm", mw: "1mW", value: 0 },
  { dbm: "10dBm", mw: "10mW", value: 10 },
  { dbm: "20dBm", mw: "100mW", value: 20 },
  { dbm: "30dBm", mw: "1W", value: 30 }
];

const SCALE_MIN = 0;
const SCALE_MAX = 30;

type DecibelScaleVisualProps = {
  /** 現在の入力に対応する dBm 値。未入力（換算不能）なら null。 */
  currentDbm?: number | null;
};

export function DecibelScaleVisual({ currentDbm = null }: DecibelScaleVisualProps) {
  const hasMarker = currentDbm != null && Number.isFinite(currentDbm);
  // スケール（0–30dBm）上の現在位置を 0–100% で表す。範囲外はクランプ。
  const clampedDbm = hasMarker ? Math.min(Math.max(currentDbm, SCALE_MIN), SCALE_MAX) : 0;
  const markerPercent = ((clampedDbm - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const isBelow = hasMarker && currentDbm < SCALE_MIN;
  const isAbove = hasMarker && currentDbm > SCALE_MAX;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">Decibel Scale Visual</h3>

      {hasMarker ? (
        <p className="mt-1 text-sm text-slate-600">
          現在の入力は{" "}
          <span className="font-bold text-staf-dark">{currentDbm.toFixed(1)}dBm</span>{" "}
          付近です。
          {isBelow ? "（スケール下限0dBm未満）" : null}
          {isAbove ? "（スケール上限30dBm超）" : null}
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-500">数値を入力すると現在位置を表示します。</p>
      )}

      {/* 0–30dBm のスケールバー。現在値のマーカーを重ねて入力に連動させる。 */}
      <div className="mt-4">
        <div className="relative h-3 rounded-full bg-gradient-to-r from-slate-200 via-staf/30 to-staf/70">
          {hasMarker ? (
            <div
              className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${markerPercent}%` }}
              aria-hidden="true"
            >
              <div className="h-5 w-5 rounded-full border-2 border-white bg-staf shadow-md" />
            </div>
          ) : null}
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-500">
          <span>0dBm</span>
          <span>10dBm</span>
          <span>20dBm</span>
          <span>30dBm</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {scaleItems.map((item, index) => {
          // 現在値に最も近い目盛りをハイライトする。
          const isActive =
            hasMarker &&
            scaleItems.every(
              (other) => Math.abs(clampedDbm - item.value) <= Math.abs(clampedDbm - other.value)
            );
          return (
            <div
              key={item.dbm}
              className={`rounded-lg border p-4 text-center transition ${
                isActive
                  ? "border-staf bg-staf/10 ring-2 ring-staf/30"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="text-lg font-bold text-staf-dark">{item.dbm}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{item.mw}</p>
              {index < scaleItems.length - 1 ? (
                <p className="mt-2 text-xs text-slate-500">次は +10dB = 10倍</p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">1W</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        dBを使うと、アンテナ利得や損失を足し算・引き算で整理できます。リンクバジェットは、このdBの特徴を使って通信余裕を見積もります。
      </p>
    </section>
  );
}
