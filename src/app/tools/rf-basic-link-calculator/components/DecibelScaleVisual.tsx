const scaleItems = [
  { dbm: "0dBm", mw: "1mW" },
  { dbm: "10dBm", mw: "10mW" },
  { dbm: "20dBm", mw: "100mW" },
  { dbm: "30dBm", mw: "1W" }
];

export function DecibelScaleVisual() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">Decibel Scale Visual</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {scaleItems.map((item, index) => (
          <div key={item.dbm} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-lg font-bold text-staf">{item.dbm}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{item.mw}</p>
            {index < scaleItems.length - 1 ? (
              <p className="mt-2 text-xs text-slate-500">次は +10dB = 10倍</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">1W</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        dBを使うと、アンテナ利得や損失を足し算・引き算で整理できます。リンクバジェットは、このdBの特徴を使って通信余裕を見積もります。
      </p>
    </section>
  );
}
