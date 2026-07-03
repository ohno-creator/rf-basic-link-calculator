# コラム文献パック：放射抵抗・効率 (Radiation Resistance and Efficiency)

**作成日時**: 2026-07-04
**調査・検証担当**: Antigravity (調査・視覚検証枠)
**ステータス**: 一次出典検証済み・生存確認完了

---

## 1. 一次出典リスト (Sources & Locators)

| ID | 出典 (Label) | 種類 (Kind) | 取得元 (URL) | 位置 (Locator) | 要旨・技術ノート | 取得年月 | リンク生存 |
|---|---|---|---|---|---|---|---|
| S1 | C. A. Balanis (2016) | book | N/A (ISBN: 978-1-118-64206-1) | Chapter 4, Sec 4.2 & 4.3 | *"Antenna Theory: Analysis and Design"* (4th Ed)。微小ダイポール（Infinitesimal Dipole）および短い線状ダイポール（Small Dipole）の放射電磁界、放射抵抗の導出。 | 2026-07 | ○ (書籍) |
| S2 | W. L. Stutzman et al. (2012) | book | N/A (ISBN: 978-0-470-55724-2) | Chapter 2, Sec 2.6 | *"Antenna Theory and Design"* (3rd Ed)。アンテナ効率（放射効率、誘電体効率、反射効率）の定義と損失インピーダンス。 | 2026-07 | ○ (書籍) |
| S3 | H. A. Wheeler (1975) | paper | [ieee.org](https://ieeexplore.ieee.org/document/1142106) | Vol. AP-23, pp. 462-469 | *“Small antennas”* (IEEE Trans. Antennas Propag.)。短いダイポールやモノポールアンテナの等価放射抵抗および実効効率の極限理論。 | 2026-07 | ○ |

---

## 2. 定量値 of 放射抵抗 $R_r$ (Quantitative Data)

1. **無限小ダイポール（Infinitesimal Dipole - 電流分布が一様と仮定）**
   - **数値**: 
     $$R_{r,\text{inf}} = 80 \pi^2 \left( \frac{l}{\lambda} \right)^2 \approx 789.6 \left( \frac{l}{\lambda} \right)^2 \quad \text{[Ω]}$$
     ここで $l$ はアンテナ長、$\lambda$ は波長（$l \ll \lambda$）。
   - **出典**: [S1] Balanis Chapter 4.2.2 (Eq 4-19)。

2. **短縮ダイポール（Small Dipole - 電流分布が中心で最大、両端で0の三角形分布と仮定）**
   - **数値**: 
     $$R_{r,\text{small\_dipole}} = 20 \pi^2 \left( \frac{l}{\lambda} \right)^2 \approx 197.4 \left( \frac{l}{\lambda} \right)^2 \quad \text{[Ω]}$$
   - **物理的背景**: 実装上、線材が波長に比べて十分短い場合、電流は両端でゼロに向かって線形に減少するため、等価放射抵抗は一様電流時の **1/4** （損失が増大する方向）に低下します。
   - **出典**: [S1] Balanis Chapter 4.3 (Eq 4-39)。

3. **短縮モノポール（Small Monopole - 三角形電流分布、GND面無限大）**
   - **数値**: 
     $$R_{r,\text{small\_monopole}} = 10 \pi^2 \left( \frac{h}{\lambda} \right)^2 \approx 98.7 \left( \frac{h}{\lambda} \right)^2 \quad \text{[Ω]}$$
     ここで $h$ はモノポールアンテナの高さ（$h \ll \lambda/4$）。
   - **出典**: [S1] Balanis Chapter 4.5.2。

4. **アンテナ放射効率 $\eta$ の基本式**
   - **数値**: 
     $$\eta = \frac{R_r}{R_r + R_{\text{loss}}} \times 100\%$$
     ここで $R_{\text{loss}}$ は導線スキンエフェクト抵抗、誘電損失、整合回路（インダクタ・コンデンサ）内の等価直列抵抗（ESR）などの損失抵抗の合計。
   - **出典**: [S2] Stutzman Chapter 2.6。

---

## 3. 導出メモ (Derivation Notes)

1. **「反射減衰量（VSWR / S11）が良いのに飛ばない」アンテナの物理現象**
   - 送信機から見ると、アンテナに入力されるトータルの入力抵抗 $R_{in} = R_r + R_{\text{loss}}$ です。
   - 例えば、短縮モノポールの放射抵抗 $R_r$ がわずか $1\ \Omega$ しかない場合、整合回路のコイルの内部損失（ESR）が $9\ \Omega$ あったとします。このとき、インピーダンス整合を完璧にとって S11 を良くし、反射電力をゼロに抑えたとしても：
     $$\eta = \frac{1}{1 + 9} = 10\% \quad \text{(-10 dB)}$$
     となり、送信電力の **$90\%$ は整合回路やアンテナ線材の「熱」として消費**され、電波として飛んでいくのはわずか $10\%$ になります。

---

## 4. アンチパターン (Anti-Patterns)

1. **【誤解】「整合回路（マッチング回路）を調整して、ネットワークアナライザ上で VSWR ≦ 1.5 （S11 ≦ -14 dB）が得られたため、このアンテナの放射性能は優秀であると判断する」**
   - **数値の帰結**: 波長に対して極端に短いアンテナ（例: サブGHz基板上の小型ミアンダライン）では、放射抵抗が $1\ \Omega$ 未満になることがあります。整合用のインダクタ（Q値が有限で数Ωの寄生抵抗を持つ）で無理やり 50Ω に引き上げると、反射は消えますが、入力された電力の大半は空中でなく整合インダクタの熱で失われます。
   - **対策**: VSWR や S11 だけでアンテナ性能を議論せず、放射効率 $\eta$（または実効放射電力 EIRP / 全放射電力 TRP）の実測値を確認した上でマッチング回路を設計します。
