# E4/E5 規格data・大気ガス減衰 完了記録

Track E の計算エンジンと規格由来データは一次資料照合を完了し、E4/E5とも実装・テスト済み。
本書は未完部分の申し送りから完了証跡へ更新した。

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

## 完了①: E4 の ARIB STD-T108 規格値テーブル

- `src/data/aribT108PowerClasses.ts` に一次確認済みの20mW/250mW区分を実装済み。
- 出典・確度は `docs/handoff/E4-aribT108-values.md` に記録し、全値を `confirmed` とした。
- `src/tests/aribT108PowerClasses.test.ts` で区分、EIRP換算、出典・確度を検証済み。

## 完了②: E5 の大気ガス減衰（P.676-13）

- `src/data/gaseousAttenuationSpectroscopy.ts` に Annex 1 Table 1/2 の酸素44線・水蒸気35線を一次転記。
- `src/lib/rf/rainAttenuation.ts` に `gaseousSpecificAttenuationDbPerKm` を実装。標準条件は全気圧1013.25hPa、15℃、水蒸気密度7.5g/m³。
- 使用式は P.676-13 Annex 1 式(1)〜(9)。周波数域は1〜1000GHz。結果は特性減衰[dB/km]で、斜め経路の高度積分は対象外。
- node実測固定値: 2.4GHz=0.007066309dB/km、22.23508GHz=0.193462247dB/km、60GHz=14.655556404dB/km。
- `src/tests/rainAttenuation.test.ts` で上記3点、乾燥大気、水蒸気密度・適用域ガードを検証済み。

---

## 補足（設計判断の記録）
- E2: `researchDistance.ts` の丸め `RELIABILITY_Z` テーブルとの完全一致は不可能（σ=8dBで最大0.0036dB差）。
  統一するなら researchDistance を新 `inverseStandardNormalCdf` へ差し替える別Work Order（後方互換の数値差につきユーザー合意要）。
- E6: roadmap A3a の「10km中点で約2.9m過大」は**誤り**。正しい曲率降下は k=4/3 で **1.4715m**（反証検証で確定）。roadmap 修正推奨。
