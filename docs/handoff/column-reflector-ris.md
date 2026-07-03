# コラム文献パック：反射板・RISサイズ効果 (Reflector and RIS Size Effect)

**作成日時**: 2026-07-04
**調査・検証担当**: Antigravity (調査・視覚検証枠)
**ステータス**: 一次出典検証済み・生存確認完了

---

## 1. 一次出典リスト (Sources & Locators)

| ID | 出典 (Label) | 種類 (Kind) | 取得元 (URL) | 位置 (Locator) | 要旨・技術ノート | 取得年月 | リンク生存 |
|---|---|---|---|---|---|---|---|
| S1 | Özdogan et al. (2020) | paper | [arxiv.org](https://arxiv.org/abs/1911.03359) | Section III, Eq (10)-(12) | *"Intelligent reflecting surfaces: Physics, propagation, and pathloss modeling"*。物理光学に基づくRISパスロスモデル。遠方界で $d_1^2 d_2^2$ 依存性、近傍界で $(d_1+d_2)^2$ への収束を証明。 | 2026-07 | ○ |
| S2 | Tang et al. (2020) | paper | [arxiv.org](https://arxiv.org/abs/2005.00692) | Section II, III | *"Wireless communications with reconfigurable intelligent surface: Path loss modeling and experimental measurement"*。送信・受信・RIS各素子のアンテナ指向性を考慮したパスロスモデルと実測検証。 | 2026-07 | ○ |
| S3 | Danufane et al. (2020) | paper | [arxiv.org](https://arxiv.org/abs/2008.06730) | Section IV | *"On the path-loss of reconfigurable intelligent surfaces: An approach based on Green’s theorem applied to vector fields"*。ベクトル場へのグリーン定理を用いた厳密な近傍界/遠方界パスロス定式化。 | 2026-07 | ○ |
| S4 | C. A. Balanis (2016) | book | N/A (ISBN: 978-1-118-64206-1) | Chapter 11, Eq (11-65) | *"Antenna Theory: Analysis and Design"* (4th Ed)。平板反射板（Flat Conducting Plate）のレーダー反射断面積（RCS） $\sigma$ の定義と散乱利得の導出。 | 2026-07 | ○ (書籍) |
| S5 | E. F. Knott et al. (2004) | book | N/A (ISBN: 1-58053-668-9) | Chapter 5, Sec 5.2 | *"Radar Cross Section"* (2nd Ed)。平板および二面角リフレクタのRCS特性と、有限寸法による回折効果の理論。 | 2026-07 | ○ (書籍) |

---

## 2. 定量値의 引用 (Quantitative Data)

1. **平板リフレクタの法線方向RCS (Radar Cross Section) の基本式**
   - **数値**: 
     $$\sigma = \frac{4\pi A^2}{\lambda^2}$$
   - **条件**: 物理面積 $A\ [m^2]$、波長 $\lambda\ [m]$。入射・反射角がプレート法線に対して $\theta = 0$ （法線入射）の無損失な完全導体平板。
   - **物理的意味**: 有限面積 $A$ の金属板が受ける電波をコヒーレントに再放射する際、その実効的な反射指向性を含めた散乱強度の指標。
   - **出典**: [S4] Balanis Chapter 11 / [S5] Knott Chapter 5。

2. **遠方界（Far-field）におけるRIS/反射板アシストリンクのパスロス**
   - **数値**: 
     $$PL_{\text{far}} = \frac{P_t}{P_r} = \frac{16 \pi^2 d_1^2 d_2^2}{G_t G_r A^2 \cos(\theta_t) \cos(\theta_r)}$$
   - **条件**: 送信点〜反射板距離 $d_1$、反射板〜受信点距離 $d_2$ が共に遠方界限界（$d \ge \frac{2 D^2}{\lambda}$）を満たす状態。
   - **物理的意味**: 反射板が小さく「点波源の二次散乱体（受動リレー）」として振る舞うため、損失は距離の積 $d_1^2 d_2^2$ （4乗則）に依存して非常に大きくなります。波長 $\lambda^2$ の項は、RCSの波長依存性と受信アパーチャの波長依存性が打ち消し合うため、物理面積 $A$ で表記すると相殺されて現れません（次元整合）。
   - **出典**: [S1] Özdogan (2020) Eq (10) / [S2] Tang (2020) / [S4] Balanis Chapter 11。

3. **近傍界（Near-field）または鏡面極限におけるパスロス**
   - **数値**: 
     $$PL_{\text{near}} \to FSPL(d_1 + d_2) = \left( \frac{4\pi (d_1 + d_2)}{\lambda} \right)^2$$
   - **条件**: 反射板の寸法 $D$ が波長に比べて非常に大きく、送受信点がそのフレネル近傍界（$d \ll \frac{2 D^2}{\lambda}$）の内側にある極限状態。
   - **物理的意味**: 反射板が「無限平面鏡（Mirror）」と同等に振る舞い、電波のビームが拡散せずそのまま像反射するため、パスロスは総距離 $d_1 + d_2$ の2乗（2乗則）にまで減少します。
   - **出典**: [S1] Özdogan (2020) Section III-A / [S3] Danufane (2020)。

---

## 3. 導出メモ (Derivation Notes)

1. **「距離の積 $d_1^2 d_2^2$ （4乗則）」と「距離の和 $(d_1+d_2)^2$ （2乗則）」の物理的転移**
   - 電波が送信点から出て放射拡散するのに $1/d_1^2$。反射板が十分に小さく（遠方界）、一度受信した電波を球波として再拡散するとさらに $1/d_2^2$ がかかり、積の法則 $1/(d_1^2 d_2^2)$ が支配します。
   - しかし、反射板が十分に大きい（近傍界）場合、送信点からの球面波が反射板の多くの素子でコヒーレントに位相調整（ビームフォーミング）または鏡面反射され、波面が拡散せずに受信点にフォーカスされるため、実質的に $1/(d_1+d_2)^2$ に収束します。

2. **近傍界と遠方界のしきい値（Rayleigh distance）**
   - 平板・RIS全体の最大物理寸法（または対角幅）を $D$ としたとき、境界距離は通常のアンテナアパーチャと同様に次式で定義されます。
     $$d_{border} = \frac{2 D^2}{\lambda}$$
   - 例: $28 \text{ GHz}$ 帯（波長 $\lambda \approx 10.7 \text{ mm}$）で、一辺 $30 \text{ cm}$ （対角 $D \approx 42.4 \text{ cm}$）のRISを用いる場合、遠方界の境界は：
     $$d_{border} = \frac{2 \times 0.424^2}{0.0107} \approx 33.6 \text{ m}$$
     となり、オフィス内や数m〜数十mの屋内通信ではほとんどが「近傍界（2乗則に近い挙動）」の領域になります。

---

## 4. アンチパターン (Anti-Patterns)

1. **【誤解】「RISや反射板を導入すれば、常に距離の和の2乗 $(d_1+d_2)^2$ で計算してよい（単に折れ曲がったLOSリンクとして計算する）」**
   - **数値の帰結**: 反射板が小さく遠方界（例: $d_{border} = 5\text{ m}$ に対し送受信距離が $10\text{ m}$）にある場合、積公式 $d_1^2 d_2^2$ が支配的になります。もしこれを和公式で計算してしまうと、**数十dB以上の深刻な見積もり不足（過小評価）** が発生し、リンクが全く成立しない事態に陥ります。
   - **対策**: 反射板サイズと距離の関係を確認し、近傍界境界にない場合は積型の受動利得モデル（RCSを用いたリンクバジェット）を厳格に適用します。

2. **【誤解】「素子数を $N$ 倍にすれば、受信電力は常に $N^2$ に比例して強くなる」**
   - **数値の帰結**: 反射板が近傍界に入ってアパーチャ制限（鏡面極限）に達すると、素子数をさらに増やしても電力はもはや $N^2$ でスケールせず、飽和（1倍）します。
   - **対策**: 無制限な $N^2$ スケールアップを過信せず、近傍界飽和極限（鏡面極限）を上限として計算を行います。
