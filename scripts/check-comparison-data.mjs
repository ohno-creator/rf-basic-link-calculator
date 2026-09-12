import { readFileSync } from 'node:fs';
const records = JSON.parse(readFileSync(new URL('../src/data/comparisonApprovedData.json', import.meta.url), 'utf8'));
if (!Array.isArray(records)) throw new Error('公開データは配列にしてください');
for (const r of records) {
  if (r.lifecycle !== 'public-approved' || r.publicationPermission !== 'public-approved') throw new Error('比較データに未承認レコードがあります');
  for (const key of ['id', 'revision', 'sourceTitle', 'sourceRevision', 'sourceLocation', 'reviewedAt', 'reviewerRole', 'referenceBoundary', 'includedComponents']) if (typeof r[key] !== 'string' || !r[key].trim()) throw new Error(`公開データの${key}が未記入です`);
}
// 承認データが0件のP0。追加時は照合・UI統合と技術承認を同時に実施する。
if (records.length) throw new Error('P0には品番データを同梱できません。照合機構と公開承認の統合が必要です');
console.log('比較機能の公開データ検査：承認データ0件、手入力・不明・説明例のみ');
