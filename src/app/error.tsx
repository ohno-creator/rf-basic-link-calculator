"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

// ルート共通のエラー境界。計算ライブラリ等の想定外の例外でページ全体が白画面になるのを防ぐ。
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-staf-dark">エラーが発生しました</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">ページの表示中に問題が発生しました</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        入力値を変更した直後の場合は、再試行で復帰できることがあります。復帰しない場合はページを再読み込みしてください。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-staf px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
      >
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
        再試行
      </button>
    </main>
  );
}
