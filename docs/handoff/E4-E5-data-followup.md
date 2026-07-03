# Handoff: E4/E5 の規格data 一次確認（未完部分の申し送り）

Track E の lib（計算エンジン）は Claude 枠で完了・マージ済み。**計算式は確定（一次照合／node実測済）**だが、
**規格由来の数値テーブル2件**は一次規格の直接確認が未了のため、意図的に未実装として残す。
誤った法規値・係数を「確定」としてコミットしない方針（AGENTS.md の確度規律・事業直結の安全）。

---

## 完了済み（参照）

| Track | 実装 | テスト | 確度 |
| --- | --- | --- | --- |
| E2 フェージング統計 | `src/lib/rf/shadowingMargin.ts` | `src/tests/shadowingMargin.test.ts` | 式=確定 |
| E3 偏波不整合 | `src/lib/rf/polarizationMismatch.ts` | 同 test | 確定 |
| E4 EIRP **エンジン** | `src/lib/rf/eirpCompliance.ts` | 同 test | 算術=確定 |
| E5 降雨 **rain核** | `src/lib/rf/rainAttenuation.ts` ＋ `src/data/rainAttenuationCoefficients.ts` | 同 test | P.838-3=確定 |
| E6 フレネル曲率 | `src/lib/rf/fresnel.ts` に追記 | `src/tests/fresnel.test.ts` | 確定 |

---

## 未完①: E4 の ARIB STD-T108 規格値テーブル（→ Antigravity 調査 → Codex data化）

- **現状**: `eirpCompliance.ts` は `eirpLimitDbm` を引数で受ける純エンジン。規格の上限区分は持たない。
- **必要**: `src/data/aribT108PowerClasses.ts` を新設し、920MHz帯の空中線電力区分を出典付き・確度フラグ付きで保持する。
  ```ts
  export type AribT108PowerClass = {
    id: string; label: string;
    maxAntennaPowerMw: number; maxAntennaPowerDbm: number;
    referenceAntennaGainDbi: number; eirpLimitDbm: number;
    carrierSenseThresholdDbm: number | null;
    maxTxDurationSec: number | null; dutyNote: string;
    appliesTo: string; source: string;
    confidence: "confirmed" | "needs_check";
  };
  ```
- **一次確認が必要な数値（推測値を confirmed にしない）**:
  - 250mWクラスの EIRP上限（=27dBm 相当。250mW≈23.98dBm＋基準利得3dBi。二次資料では整合するが**一次表の明示値**を確認）。
  - 20mW/1mW クラスの EIRP上限（16dBm/3dBm相当が**規格の明文か運用換算か**）。
  - キャリアセンス閾値・送信継続時間・休止/デューティ（チャネル/モードで分岐）。
  - 1mW区分の適用チャネル範囲（916.0–916.8MHz中心）。
- **一次出典**: ARIB STD-T108 公式（https://www.arib.or.jp/english/std_tr/telecommunications/desc/std-t108.html ）。
  二次: ST AN4953 / TI SWRA445 / Renesas 応用ノート。
- **完了条件**: 各値に source＋confidence。未確証は `confidence:"needs_check"` のまま保持し、UIで「要確認」を明示。確認後 confirmed へ昇格。

## 未完②: E5 の大気ガス減衰（P.676簡易 gaseous）（→ 一次抽出後に Claude/Codex）

- **現状**: `rainAttenuation.ts` は rain（P.838-3）のみ。gaseous は未実装。
- **必要**: `gaseousSpecificAttenuationDbPerKm(frequencyGHz, waterVapourDensityGPerM3?)` を追加。
  標準条件（海面・15℃・ρ=7.5 g/m³）の酸素 γ_o・水蒸気 γ_w の概算特性減衰。
- **一次確認が必要**: ITU-R P.676 Annex 2 の標準条件 γ_o, γ_w テーブル（または line-by-line 概算）を一次抽出して固定。
  適用は主に 5GHz以上。<3GHz は無視可（数値で提示）。
- **完了条件**: 一次抽出値でテスト（node実測固定）。抽出できるまで実装しない。

---

## 補足（設計判断の記録）
- E2: `researchDistance.ts` の丸め `RELIABILITY_Z` テーブルとの完全一致は不可能（σ=8dBで最大0.0036dB差）。
  統一するなら researchDistance を新 `inverseStandardNormalCdf` へ差し替える別Work Order（後方互換の数値差につきユーザー合意要）。
- E6: roadmap A3a の「10km中点で約2.9m過大」は**誤り**。正しい曲率降下は k=4/3 で **1.4715m**（反証検証で確定）。roadmap 修正推奨。
