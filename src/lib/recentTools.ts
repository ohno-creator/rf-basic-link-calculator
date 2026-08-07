/**
 * 「最近使ったツール」の localStorage 履歴。
 *
 * ツールページを開くたびに slug を先頭へ記録し（重複は除去）、
 * 検索パレットとヘッダーの入口から素早く再訪できるようにする。
 * SSR・プライベートモードでは黙って no-op（履歴は空扱い）。
 */

const STORAGE_KEY = "rf-tools:recent";
const MAX_RECENT = 8;

export function loadRecentToolSlugs(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function recordRecentTool(slug: string): void {
  try {
    const next = [slug, ...loadRecentToolSlugs().filter((item) => item !== slug)].slice(0, MAX_RECENT);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ストレージ不可の環境では履歴なしで動作継続
  }
}
