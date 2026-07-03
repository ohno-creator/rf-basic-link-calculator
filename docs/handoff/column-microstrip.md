# コラム文献パック：マイクロストリップ線路 (Microstrip Line)

**作成日時**: 2026-07-04
**調査・検証担当**: Antigravity (調査・視覚検証枠)
**ステータス**: 一次出典検証済み・生存確認完了

---

## 1. 一次出典リスト (Sources & Locators)

| ID | 出典 (Label) | 種類 (Kind) | 取得元 (URL) | 位置 (Locator) | 要旨・技術ノート | 取得年月 | リンク生存 |
|---|---|---|---|---|---|---|---|
| S1 | Hammerstad & Jensen (1980) | paper | [ieee.org](https://ieeexplore.ieee.org/document/1124303) | pp. 407-409 | *"Accurate Models for Microstrip Computer-Aided Design"* (1980 IEEE MTT-S)。マイクロストリップの特性インピーダンス $Z_0$ と実効誘電率 $\varepsilon_{eff}$ の高精度 quasi-static 近似計算式の原典。 | 2026-07 | ○ |
| S2 | H. A. Wheeler (1965) | paper | [ieee.org](https://ieeexplore.ieee.org/document/1138009) | Vol. MTT-13, pp. 172-185 | *"Transmission-Line Properties of Parallel Strips by a Conformal-Mapping Approximation"*。マイクロストリップ近似式の先駆的研究だが、$W/h = 1$ を境界とする区分定義のため不連続性が生じる問題点を持つ。 | 2026-07 | ○ |
| S3 | D. M. Pozar (2011) | book | N/A (ISBN: 978-0-470-63155-3) | Chapter 3, Sec 3.8 | *"Microwave Engineering"* (4th Ed)。マイクロストリップの基本構造、特性インピーダンス、および誘電体損失 $\alpha_d$ と導体損失 $\alpha_c$ の物理的解説。 | 2026-07 | ○ (書籍) |
| S4 | IPC-2141A | standard | [ipc.org](https://www.ipc.org/) | Section 4 | *“Design Guide for High-Speed Controlled Impedance Circuit Boards”*。PCB設計におけるインピーダンス制御設計の業界標準規格。 | 2026-07 | ○ |

---

## 2. 定量値の引用 (Quantitative Data)

1. **Hammerstad & Jensen 式の計算精度と適用範囲**
   - **数値**: 
     - 静的実効誘電率 $\varepsilon_{eff}$ の誤差: **$\le \pm 0.2\ \%$** 
     - 特性インピーダンス $Z_0$ の誤差: **$\le \pm 0.03\ \%$** (一般的な比誘電率範囲において)
     - 適用幾何範囲 (アスペクト比 $u = W/h$): **$0.01 \le u \le 100$**
     - 基板比誘電率範囲: **$\varepsilon_r \le 128$**
   - **条件**: ストリップ導体の厚み $t = 0$ と仮定した quasi-static (準TEM波) 近似値。
   - **出典**: [S1] Hammerstad & Jensen (1980)。

2. **誘電正接 ($\tan \delta$) による誘電体損失 $\alpha_d$**
   - **数値**: 
     $$\alpha_d = \frac{k_0 \varepsilon_r (\varepsilon_{eff} - 1) \tan \delta}{2\sqrt{\varepsilon_{eff}}(\varepsilon_r - 1)} \quad \text{[Np/m]}$$
     これを常用単位 [dB/m] に換算すると：
     $$\alpha_d\text{ [dB/m]} = 20 \log_{10}(e) \cdot \alpha_d\text{ [Np/m]} \approx 8.686 \times \alpha_d\text{ [Np/m]}$$
   - **条件**: 自由空間の波数 $k_0 = \frac{2\pi f}{c}$ (波長 $\lambda$ に対し $k_0 = \frac{2\pi}{\lambda}$)。
   - **出典**: [S3] Pozar Chapter 3.8。

3. ** Wheeler 式の $u = W/h = 1$ における不連続性 (段差)**
   - **数値**: インピーダンス $Z_0$ の計算値において、境界 $u = 1$ の直前と直後で **数割程度の微小な不整合（ジャンプ）** または傾きの不連続性（C1連続性の喪失）が生じます。
   - **物理的意味**: 狭いストリップ用（$u \le 1$）と広いストリップ用（$u \ge 1$）の異なる conformal-mapping 近似式を無理に繋ぎ合わせたために発生します。Hammerstad & Jensen 式はこの問題を克服し、全範囲で完全に C1 連続な1つの滑らかな近似式を提供します。
   - **出典**: [S2] Wheeler (1965) / [S1] Hammerstad。

---

## 3. 導出メモ (Derivation Notes)

1. **実効誘電率 $\varepsilon_{eff}$ が $\varepsilon_r$ より小さくなる理由 (空気層との境界条件)**
   - マイクロストリップ線路では、ストリップ導体が空気層（$\varepsilon_r = 1$）に露出しており、基板（比誘電率 $\varepsilon_r$）と接しています。
   - 電界（力線）は、基板の内部だけでなく、上部の空気中にもはみ出して（Fringing Field）分布します。このため、電波が感じる平均的な比誘電率は、空気（1）と基板（$\varepsilon_r$）の間の値になり、$\varepsilon_{eff} < \varepsilon_r$ となります。
   - アスペクト比 $u = W/h$ が極めて大きい（導体が無限に広く、電界が完全に基板内に閉じ込められる）極限では $\varepsilon_{eff} \to \varepsilon_r$ に収束し、逆に $u \to 0$ （極細）の極限では $\varepsilon_{eff} \to \frac{\varepsilon_r + 1}{2}$ （半分が空気、半分が基板）に近づきます。

2. **誘電損失における実効フィリングファクタ**
   - 誘電損失の定式化において、分母・分子に含まれる $\frac{\varepsilon_r (\varepsilon_{eff} - 1)}{\varepsilon_{eff} (\varepsilon_r - 1)}$ という係数は「実効フィリングファクタ（Filling Factor）」と呼ばれます。
   - これは、全電界エネルギーのうち、どれだけの割合が実際に損失を持つ誘電体（基板）の内部に集中しているかを示す物理的な割合です。

---

## 4. アンチパターン (Anti-Patterns)

1. **【計算エラー】Wheeler などの区分定義近似式を $u=1$ 周辺で安易にブレンドせずに使用する**
   - **数値の帰結**: 回路設計ツールやインピーダンス計算シートにおいて、ストリップ幅 $W$ をスイープ（変化）させていった際、アスペクト比 $W/h = 1.0$ の前後で計算されたインピーダンスに不自然な段差（ジャンプ）や、シミュレーション収束時の微微分計算の破綻が発生します。
   - **対策**: スイープ解析や最適化アルゴリズムを走らせる計算エンジンには、全領域で滑らかに連続し、かつ誤差が極めて小さい Hammerstad & Jensen 式（またはフル電磁界ソルバー）を実装します。

2. **【実務エラー】GHz帯の伝送損失において「誘電損失のみ」または「導体損失のみ」で評価する**
   - **数値の帰結**: 2.4 GHz や 5 GHz などの周波数では、FR-4基板（$\tan \delta \approx 0.015$）を用いると、誘電正接による誘電損失 $\alpha_d$ が、銅箔の表皮効果による導体損失 $\alpha_c$ と同等かそれ以上に支配的になります。片方だけを計算して「損失は十分に低い」と誤認すると、実機で **伝送損失が想定の2倍以上になる** 設計不良が発生します。
   - **対策**: 全損失 $\alpha_{total} = \alpha_c + \alpha_d$ として、両方の寄与を必ず加算して評価します。
