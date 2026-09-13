/**
 * ツール検索の純関数（正規化＋スコアリング）。
 *
 * ホームの一覧絞り込みと ⌘K 検索パレットの両方から使う単一実装。
 * - 正規化: NFKC（全角/半角統一）→ 小文字化 → カタカナ→ひらがな。
 *   「ＤＢＭ」「デシベル/でしべる」「FSPL/fspl」の表記ゆれを吸収する。
 * - 対象: name / tagline / slug / toolKeywords（別名辞書）。
 * - 複数語（空白区切り）は AND。各語のベストマッチ箇所でスコアを加算し、
 *   name 一致 > 別名一致 > tagline 一致 の順に上位へ並べる。
 */

import { toolDirectory, type DirectoryTool } from "@/data/toolDirectory";
import { toolKeywords } from "@/data/toolKeywords";

/** 検索用に正規化（NFKC → 小文字 → カタカナ→ひらがな）。 */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

export type SearchableTool = DirectoryTool & {
  /** /tools/xxx の xxx 部分。 */
  slug: string;
  keywords: string[];
};

type IndexedTool = {
  tool: SearchableTool;
  nameNorm: string;
  taglineNorm: string;
  slugNorm: string;
  keywordsNorm: string[];
};

function slugFromHref(href: string): string {
  return href.replace(/^\/tools\//, "").replace(/\/$/, "");
}

/** レジストリ＋別名辞書をマージした検索対象一覧。 */
export function getSearchableTools(): SearchableTool[] {
  return toolDirectory.map((tool) => {
    const slug = slugFromHref(tool.href);
    return { ...tool, slug, keywords: toolKeywords[slug] ?? [] };
  });
}

// モジュールロード時に一度だけ正規化インデックスを構築する（レジストリは静的）。
let cachedIndex: IndexedTool[] | null = null;

function getIndex(): IndexedTool[] {
  if (!cachedIndex) {
    cachedIndex = getSearchableTools().map((tool) => ({
      tool,
      nameNorm: normalizeSearchText(tool.name),
      taglineNorm: normalizeSearchText(tool.tagline),
      slugNorm: normalizeSearchText(tool.slug),
      keywordsNorm: tool.keywords.map(normalizeSearchText)
    }));
  }
  return cachedIndex;
}

/** 1トークンに対する1ツールのスコア。0 = 不一致。 */
function scoreToken(entry: IndexedTool, token: string): number {
  if (entry.nameNorm === token) {
    return 100;
  }
  if (entry.nameNorm.startsWith(token)) {
    return 80;
  }
  if (entry.nameNorm.includes(token)) {
    return 60;
  }
  if (entry.keywordsNorm.some((keyword) => keyword === token)) {
    return 50;
  }
  if (entry.keywordsNorm.some((keyword) => keyword.includes(token))) {
    return 40;
  }
  if (entry.slugNorm.includes(token)) {
    return 30;
  }
  if (entry.taglineNorm.includes(token)) {
    return 20;
  }
  return 0;
}

export type ToolSearchResult = {
  tool: SearchableTool;
  score: number;
};

/**
 * クエリでツールを検索し、スコア降順で返す。
 * 空クエリは空配列（呼び出し側が「最近使った」等を出す）。
 * 複数語は AND: どれか1語でも不一致のツールは落とす。
 */
export function searchTools(query: string, limit = 50): ToolSearchResult[] {
  const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return [];
  }

  const results: ToolSearchResult[] = [];
  for (const entry of getIndex()) {
    let total = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const score = scoreToken(entry, token);
      if (score === 0) {
        matchedAll = false;
        break;
      }
      total += score;
    }
    if (matchedAll) {
      results.push({ tool: entry.tool, score: total });
    }
  }

  // スコア同点はレジストリ定義順（＝カテゴリの意図された並び）を保つ安定ソート。
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
