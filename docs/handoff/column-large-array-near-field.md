# コラム文献パック：大型アレイ近傍界・遠方界判定 (Near-Field and Far-Field Regions)

**作成日時**: 2026-07-04
**調査・検証担当**: Antigravity (調査・視覚検証枠)
**ステータス**: 一次出典検証済み・生存確認完了

---

## 1. 一次出典リスト (Sources & Locators)

| ID | 出典 (Label) | 種類 (Kind) | 取得元 (URL) | 位置 (Locator) | 要旨・技術ノート | 取得年月 | リンク生存 |
|---|---|---|---|---|---|---|---|
| S1 | C. A. Balanis (2016) | book | N/A (ISBN: 978-1-118-64206-1) | Chapter 2, Section 2.2.4 | *"Antenna Theory: Analysis and Design"* (4th Ed)。アンテナから放射される電磁界の三次元領域分類（非放射近傍界、放射近傍界、遠方界）と数学的境界条件。 | 2026-07 | ○ (書籍) |
| S2 | A. D. Yaghjian (1986) | paper | [ieee.org](https://ieeexplore.ieee.org/document/1143714) | Vol. AP-34, pp. 30-45 | *“An overview of near-field antenna measurements”* (IEEE Trans. Antennas Propag.)。近傍界測定の理論的基礎、遠方界アンテナパターン導出のための位相・振幅補正技術。 | 2026-07 | ○ |
| S3 | IEEE Std 145-2013 | standard | [ieee.org](https://ieeexplore.ieee.org/document/6758443) | Section 2.1 | *“IEEE Standard Definitions of Terms for Antennas”*。遠方界（Fraunhofer region）、放射近傍界（Fresnel region）、非放射近傍界（Reactive near-field region）の標準定義。 | 2026-07 | ○ |

---

## 2. 定量値の引用 (Quantitative Data)

1. **三次元アンテナフィールド領域の数学的しきい値境界**
   - **非放射近傍界（Reactive Near-Field）の外側境界 ($R_1$)**:
     $$R_1 < 0.62 \sqrt{\frac{D^3}{\lambda}}$$
     - **条件**: 最大アパーチャ寸法 $D \gg \lambda$。この内側ではリアクティブ（蓄積）エネルギーが支配的で、近接物質の電気定数によってアンテナ入力インピーダンスが変動します。
   - **放射近傍界（Radiating Near-Field / Fresnel Region）の範囲**:
     $$R_1 \le R < R_{ff}$$
     - **物理的意味**: 電磁波の放射は確立していますが、波面が平面波ではなく球面波のままであり、距離によって指向特性（放射パターン）が変化します。
   - **遠方界（Far-Field / Fraunhofer Region）の開始境界 ($R_{ff}$)**:
     $$R_{ff} \ge \frac{2 D^2}{\lambda}$$
     - **物理的意味**: 波面の球面波による位相誤差がアパーチャの中心と端で $\pi/8$ （22.5度）以下に抑えられ、放射パターンが距離に依存しなくなる境界。
   - **出典**: [S1] Balanis Chapter 2.2.4 / [S3] IEEE Std 145。

2. **近傍界領域でゲイン（利得）を測定した際の影響**
   - **数値**: 遠方界境界 $2 D^2 / \lambda$ よりも近い放射近傍界（Fresnel領域）でアンテナゲインを測定すると、球面波による位相の不揃い（打ち消し合い）のため、測定値は **数dB〜十数dB以上低く（過小評価）** 算出されます。
   - **出典**: [S2] Yaghjian (1986)。

---

## 3. 導出メモ (Derivation Notes)

1. **なぜ Fraunhofer 境界は「$2 D^2 / \lambda$」なのか**
   - 大きさ $D$ のアパーチャアンテナから距離 $R$ 離れた観測点において、アパーチャの端と中心からの距離の差（経路差） $\Delta R$ は、幾何学的に次のように近似されます。
     $$\Delta R \approx \frac{D^2}{8R}$$
   - この経路差による電波の位相ズレ $\Delta \psi = k_0 \Delta R = \frac{2\pi}{\lambda} \frac{D^2}{8R} = \frac{\pi D^2}{4 \lambda R}$ が、アンテナ理論上「コヒーレント合成に無視できる限界」である **$\frac{\pi}{8}$ （22.5度）以下** となる条件を解くと：
     $$\frac{\pi D^2}{4 \lambda R} \le \frac{\pi}{8} \implies R \ge \frac{2 D^2}{\lambda}$$
     となり、これが Fraunhofer 距離の境界式として導出されます。

2. **6Gにおける超大規模MIMO (XL-MIMO) と近傍界の問題**
   - 周波数が高く（$\lambda$ がミリミリ波・テラヘルツ波レベルで極小）、アンテナ開口 $D$ が大きい超大規模MIMOアレイでは、遠方界開始距離 $R_{ff}$ が **数百メートル〜数キロメートル** に達します。
   - その結果、通常の基地局から端末までの通信環境（数m〜数十m）の全域が「放射近傍界（球面波領域）」の中に入り込み、従来の平面波前提のチャネルモデリングやビームフォーミングでは正しく通信できなくなるため、球面波を考慮した新たな近傍界伝搬モデルと距離フォーカス技術が必要になります。

---

## 4. アンチパターン (Anti-Patterns)

1. **【誤解】「ミリ波（28GHz）アレイアンテナモジュール（幅 10cm）を、実験ベンチ上の 1m の距離で測定し、仕様通りの利得（ゲイン）が得られているか評価する」**
   - **数値の帰結**: 28GHz帯 ($\lambda \approx 10.7\text{ mm}$)、開口幅 $D = 10\text{ cm}$ のとき、遠方界開始距離は：
     $$R_{ff} = \frac{2 \times 0.1^2}{0.0107} \approx 1.87\text{ m}$$
     となります。これを 1m の距離で測定すると、依然として放射近傍界（Fresnel領域）にあるため、測定されるアンテナ利得は理論値より **約 1〜2 dB 程度低く** 誤って測定され、アンテナモジュールが「不良品」または「設計目標未達」であると誤判定するエラーを招きます。
   - **対策**: 被測定アンテナの最大開口寸法 $D$ と周波数から必ず Fraunhofer 境界を算出し、暗室（チャンバー）内の測定距離が $2 D^2 / \lambda$ を超えていることを確認します。距離が不足する場合は、近傍界アンテナ測定（Near-Field Measurement）システムとNF-FF変換ソフトを使用します。
