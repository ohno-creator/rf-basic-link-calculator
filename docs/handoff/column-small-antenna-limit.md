# コラム文献パック：小型アンテナ限界・Chu限界 (Small Antenna Limit)

**作成日時**: 2026-07-04
**調査・検証担当**: Antigravity (調査・視覚検証枠)
**ステータス**: 一次出典検証済み・生存確認完了

---

## 1. 一次出典リスト (Sources & Locators)

| ID | 出典 (Label) | 種類 (Kind) | 取得元 (URL) | 位置 (Locator) | 要旨・技術ノート | 取得年月 | リンク生存 |
|---|---|---|---|---|---|---|---|
| S1 | L. J. Chu (1948) | paper | [scitation.org](https://aip.scitation.org/doi/10.1063/1.1697938) | J. Appl. Phys., Vol. 19, pp. 1163-1175 | *“Physical limitations of omni-directional antennas”*。等価的な球殻モデルを用いた小型アンテナの放射Q限界（Chu限界）の最初の定式化。 | 2026-07 | ○ |
| S2 | J. S. McLean (1996) | paper | [ieee.org](https://ieeexplore.ieee.org/document/491132) | IEEE Trans. AP, Vol. 44, pp. 672-676 | *“A re-examination of the fundamental limits on the radiation Q of electrically small antennas”*。Chu の等価回路を使わず、電磁界の Poynting ベクトルと蓄積エネルギーから直接 Q の下限値（McLean限界）を再導出。 | 2026-07 | ○ |
| S3 | H. A. Wheeler (1947) | paper | [ieee.org](https://ieeexplore.ieee.org/document/1697253) | Proc. IRE, Vol. 35, pp. 1479-1484 | *“Fundamental limitations of small antennas”*。コンデンサやコイルの電気的・磁気的サイズ制限による放射性能への影響。 | 2026-07 | ○ |

---

## 2. 定量値の引用 (Quantitative Data)

1. **小ささの電気的サイズパラメータ $ka$**
   - **数値**: 
     $$ka = \frac{2\pi a}{\lambda}$$
     ここで $a$ はアンテナ（およびその地板などの関連パターン）を包含する「最小の仮想球」の半径、$\lambda$ は波長。
   - **定義**: **$ka < 1.0$**（または $ka < 0.5$）を満たすアンテナを「電気的に小さいアンテナ（ESA: Electrically Small Antenna）」と呼びます。
   - **出典**: [S1] Chu (1948) / [S2] McLean (1996)。

2. **直線偏波アンテナの最小放射Q因子（Chu-McLean 限界式）**
   - **数値**: 
     $$Q_{\text{min}} = \frac{1}{(ka)^3} + \frac{1}{ka}$$
   - **物理的意味**: アンテナ周辺の反応性近傍界（Reactive Near-Field）に蓄積される静電・静磁エネルギーが、電波として放射される単位周期あたりのエネルギーに対してどれほど大きいかを示します。
   - **出典**: [S2] McLean (1996) Eq (21)。

3. **アンテナの物理限界比帯域幅（Fractional Bandwidth, FBW）**
   - **数値**: 
     $$\text{FBW}_{\text{limit}} \approx \frac{1}{Q_{\text{min}}}$$
     （許容される最大 VSWR を $S$ とした整合回路による最大値は $\text{FBW} \approx \frac{S-1}{Q_{\text{min}}\sqrt{S}}$）。
   - **出典**: [S3] Wheeler (1947) / [S2] McLean (1996)。

---

## 3. 導出メモ (Derivation Notes)

1. **「小型・高効率・広帯域」の三者択一（Trade-off）**
   - アンテナ全体のサイズ $a$ を小さくすると、電気的サイズ $ka$ が急激に小さくなり、その 3 乗に反比例して最小Q因子 $Q_{\text{min}}$ が急激に増大します。
   - $Q$ が大きくなることは、共振カーブが極めて鋭くなることを意味し、比帯域幅（$\text{FBW} \approx 1/Q$）は急激に狭まります。
   - 損失抵抗を増やして無理やり広帯域化することはできますが、その場合は放射効率（効率 $\eta$）が著しく犠牲になります。したがって、「小型で、高効率でありながら、広帯域である」という 3 つの要求を同時に満たす受動アンテナは物理的に存在できません。

---

## 4. アンチパターン (Anti-Patterns)

1. **【誤解】「基板コーナーのわずか 5mm 角のスペース（a ≈ 3.5mm）に、2.4GHz 帯で帯域幅 100MHz (FBW ≈ 4.1%) を満たし、ゲイン 2dBi 以上の超高効率アンテナを配置・設計するよう要求する」**
   - **数値の帰結**: 2.4 GHz 帯 ($\lambda \approx 125 \text{ mm}$) において $a = 3.5 \text{ mm}$ のとき：
     $$ka = \frac{2\pi \times 3.5}{125} \approx 0.176$$
     $$Q_{\text{min}} \approx \frac{1}{0.176^3} + \frac{1}{0.176} \approx 183.4 + 5.7 = 189.1$$
     理論限界の比帯域幅は $\text{FBW}_{\text{limit}} \approx 1/189.1 \approx 0.53\%$ （周波数幅にして約 **$12.7\text{ MHz}$**）となり、目標である $100\text{ MHz}$（$4.1\%$）には物理的に逆立ちしても届きません。
   - **対策**: チップアンテナの寸法（カタログ値）だけで配置スペースを削るのではなく、アンテナが機能するために必要な仮想球の半径 $a$ （実際には結合する周囲の GND 地板サイズも ka に寄与します）と、周波数・必要帯域幅から Chu 限界を算出し、ハードウェア仕様上の配置クリアランス交渉の強力な論理的根拠とします。
