# コラム文献パック：パッチアンテナ寸法 (Patch Antenna Dimensions)

**作成日時**: 2026-07-04
**調査・検証担当**: Antigravity (調査・視覚検証枠)
**ステータス**: ✅一次出典検証済み・生存確認完了 (Antigravity検証済)

---

## 1. 一次出典リスト (Sources & Locators)

| ID | 出典 (Label) | 種類 (Kind) | 取得元 (URL) | 位置 (Locator) | 要旨・技術ノート | 取得年月 | リンク生存 |
|---|---|---|---|---|---|---|---|
| S1 | C. A. Balanis (2016) | book | N/A (ISBN: 978-1-118-64206-1) | Chapter 14, Sec 14.2 | *"Antenna Theory: Analysis and Design"* (4th Ed)。矩形マイクロストリップパッチアンテナの伝送線路モデル（Transmission-Line Model）による寸法設計式。 | 2026-07 | ○ (書籍) |
| S2 | E. O. Hammerstad (1975) | paper | [ieee.org](https://ieeexplore.ieee.org/document/1622204) | pp. 268-272 | *“Equations for Microstrip Circuit Design”* (IEEE MTTS)。実効比誘電率およびフリンジ延長長（$\Delta L$）の業界標準的な高精度近似式。 | 2026-07 | ✅確認済 |
| S3 | Bahl & Bhartia (1980) | book | N/A (ISBN: 978-0890060919) | Chapter 2 | *"Microstrip Antennas"* (Artech House)。パッチの誘電体等価モデルと端部等価サセプタンスによる周波数シフト補正。 | 2026-07 | ○ (書籍) |

---

## 2. 定量値の引用 (Quantitative Data)

1. **矩形パッチアンテナ幅 $W$ の設計公式**
   - **数値**: 
     $$W = \frac{c_0}{2 f_0} \sqrt{\frac{2}{\epsilon_r + 1}}$$
     ここで $c_0$ は真空中の光速、$f_0$ は設計周波数、$\epsilon_r$ は基板の比誘電率。
   - **出典**: [S1] Balanis Chapter 14.2.1。

2. **空気と基板にまたがる実効比誘電率 $\epsilon_{\text{eff}}$**
   - **数値**: 
     $$\epsilon_{\text{eff}} = \frac{\epsilon_r + 1}{2} + \frac{\epsilon_r - 1}{2} \left( 1 + 12 \frac{h}{W} \right)^{-1/2}$$
     ここで $h$ は基板の厚み（高さ）。
   - **出典**: [S1] Balanis Chapter 14.2 / [S2] Hammerstad。

3. **フリンジ効果によるパッチ端部電気長伸び $\Delta L$**
   - **数値**: 
     $$\Delta L = 0.412 h \frac{(\epsilon_{\text{eff}} + 0.3) (W/h + 0.264)}{(\epsilon_{\text{eff}} - 0.258) (W/h + 0.8)}$$
   - **物理寸法長 $L$ の決定**: 
     $$L = \frac{c_0}{2 f_0 \sqrt{\epsilon_{\text{eff}}}} - 2 \Delta L$$
   - **出典**: [S1] Balanis Chapter 14.2.2 / [S2] Hammerstad。

---

## 3. 導出メモ (Derivation Notes)

1. **「フリンジ電界」による短縮補正の物理的意味**
   - パッチの両端部では、電磁界が基板の外（空気中）に染み出す「フリンジ効果（Fringing Effect）」が発生します。
   - この染み出しにより、電波から見たパッチアンテナの電気的な長さは、物理的な金属パターンサイズよりも両端合わせて約 **$2 \Delta L$** 分（基板厚さ $h$ の約 0.8倍 程度）長く感じられます。
   - そのため、共振させるための物理長 $L$ は、フリンジの伸びを見越してあらかじめ $2 \Delta L$ だけ**短く切り詰めて設計**する必要があります。

---

## 4. アンチパターン (Anti-Patterns)

1. **【誤解】「パッチ長 $L$ を、単純に基板誘電率での短縮波長の半分（$\frac{c_0}{2 f_0 \sqrt{\epsilon_r}}$）としてそのまま設計パターンを描く」**
   - **数値の帰結**: フリンジ効果による電気的な長さの伸び（$2\Delta L$）と、空気への電界染み出しによる比誘電率低下（$\epsilon_r \to \epsilon_{\text{eff}}$）の 2 点を考慮しないと、共振周波数が設計目標値から **数%〜10%以上低くシフト（ズレ）** します。
   - **対策**: 初期設計時には必ず実効誘電率 $\epsilon_{\text{eff}}$ を用いた波長短縮を行い、かつ $2 \Delta L$ の切り詰め補正を適用した物理パターン寸法を算出して CAD への当たりとします。
