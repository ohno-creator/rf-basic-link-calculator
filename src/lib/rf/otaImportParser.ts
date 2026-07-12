export interface ParsedBandRow {
  label: string;
  conductedPowerDbm: number;
  conductedSensitivityDbm: number;
  antennaEfficiencyDb: number;
  trpDbm: number;
  tisDbm: number;
}

export interface ParseResult {
  success: boolean;
  data: ParsedBandRow[];
  errors: string[];
}

/**
 * Excelやテキストからのコピー＆ペースト（タブまたはカンマ区切り、6列）をパースする。
 * 期待される列構成: Band, Pc, Sc, η, TRP, TIS
 *
 * @param text コピペされた文字列
 * @returns パース結果（成功フラグ、データ、行番号付きエラー一覧）
 */
export function parseOtaImport(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const data: ParsedBandRow[] = [];
  const errors: string[] = [];

  let isFirstRow = true;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 空行はスキップ
    if (trimmed === "") {
      continue;
    }

    // タブまたはカンマで分割
    const separator = trimmed.includes("\t") ? "\t" : ",";
    const parts = trimmed.split(separator).map((s) => s.trim());

    // ヘッダー行判定
    if (isFirstRow) {
      isFirstRow = false;
      const firstColLower = parts[0].toLowerCase();
      const secondColLower = parts[1]?.toLowerCase() || "";
      if (
        firstColLower.includes("band") ||
        firstColLower.includes("バンド") ||
        secondColLower.includes("pc") ||
        secondColLower.includes("power") ||
        isNaN(Number(parts[1])) ||
        isNaN(Number(parts[2]))
      ) {
        // ヘッダー行とみなしてスキップ
        continue;
      }
    } else {
      // 2行目以降でも明らかにヘッダー行のような場合はスキップ
      const firstColLower = parts[0].toLowerCase();
      if (firstColLower.includes("band") || firstColLower.includes("バンド")) {
        continue;
      }
    }

    if (parts.length !== 6) {
      errors.push(`行 ${lineNum}: 6列のデータ（Band, Pc, Sc, η, TRP, TIS）が必要です（現在 ${parts.length} 列）。`);
      continue;
    }

    const [bandLabel, pcStr, scStr, etaStr, trpStr, tisStr] = parts;

    if (!bandLabel) {
      errors.push(`行 ${lineNum}: Band名が空です。`);
      continue;
    }

    const pc = Number(pcStr);
    const sc = Number(scStr);
    const eta = Number(etaStr);
    const trp = Number(trpStr);
    const tis = Number(tisStr);

    const lineErrors: string[] = [];

    if (isNaN(pc) || !Number.isFinite(pc)) {
      lineErrors.push(`伝導出力 Pc が数値ではありません ("${pcStr}")`);
    }
    if (isNaN(sc) || !Number.isFinite(sc)) {
      lineErrors.push(`伝導感度 Sc が数値ではありません ("${scStr}")`);
    }
    if (isNaN(eta) || !Number.isFinite(eta)) {
      lineErrors.push(`放射効率 η が数値ではありません ("${etaStr}")`);
    } else if (eta > 0) {
      lineErrors.push(`放射効率 η は 0dB 以下である必要があります ("${etaStr}")`);
    }
    if (isNaN(trp) || !Number.isFinite(trp)) {
      lineErrors.push(`TRP が数値ではありません ("${trpStr}")`);
    }
    if (isNaN(tis) || !Number.isFinite(tis)) {
      lineErrors.push(`TIS が数値ではありません ("${tisStr}")`);
    }

    if (lineErrors.length > 0) {
      errors.push(`行 ${lineNum}: ${lineErrors.join(", ")}。`);
    } else {
      data.push({
        label: bandLabel,
        conductedPowerDbm: pc,
        conductedSensitivityDbm: sc,
        antennaEfficiencyDb: eta,
        trpDbm: trp,
        tisDbm: tis
      });
    }
  }

  return {
    success: errors.length === 0 && data.length > 0,
    data,
    errors
  };
}
