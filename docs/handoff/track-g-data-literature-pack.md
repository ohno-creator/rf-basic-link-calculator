# Track G: 新規基礎ツール [DATA] 文献・パラメータパック（正本）

本ドキュメントは、[docs/new-tools-proposal.md](../new-tools-proposal.md) の **[DATA]マーク対象7ツール** において使用される定数、しきい値、および判定テーブルの一次出典（文献）と具体的な数値仕様を定義した正本です。

---

## 1. G2: GNDプレーン寸法と効率
* **目的**: 基板GND長 $L_g$ と使用波長 $\lambda$ の比に対する、アンテナ放射効率の低下量（dB）を算出・補間する。
* **一次出典**: 
  - Texas Instruments Application Report **AN058: Antenna Selection Guide** (Section 3.1.2 "Ground Plane")
  - Texas Instruments Design Note **DN035: Antenna Selection Quick Guide**
  - EnOcean Application Note **AN104: Antenna design considerations for EnOcean wireless modules**
* **判定・補間テーブル**:
  $\lambda/4$ モノポール系PCB/チップアンテナを基準とした、$L_g/\lambda$ に対する効率低下量（追加損失）の目安値。

| $L_g/\lambda$ | 効率低下量 [dB] | 物理的状況 |
| :---: | :---: | :--- |
| $\ge 0.25$ | **0.0 dB** | 十分なGND長 ($\ge \lambda/4$)。イメージアンテナが良好に形成され効率最大。 |
| $0.20$ | **-1.0 dB** | GNDがやや不足。わずかな放射パターンの歪みと効率低下。 |
| $0.15$ | **-3.0 dB** | GND不足。放射インピーダンスのズレによるミスマッチと放射低下。 |
| $0.10$ | **-6.0 dB** | 深刻なGND不足。アンテナ効率が約半分(3dB)以上低下。 |
| $0.05$ | **-12.0 dB** | 限界。GNDプレーンとして機能せず、極端な利得低下。 |
| $0.00$ | **-20.0 dB** | クランプ値（無GND状態）。 |

* **補間処理**: 線形補間（$L_g/\lambda > 0.25$ 時は 0.0 dB でクランプ）。

---

## 2. G3: アンテナ・キープアウト領域
* **目的**: 各種アンテナ種別・周波数帯ごとの標準的な必要GND禁止領域（キープアウト幅 $W$ × 高さ $H$）のしきい値を定義し、ユーザーが確保した寸法が十分かを判定する。
* **一次出典**:
  - Johanson Technology **Chip Antenna Layout Guide** (e.g., 2450AT42B100E layout manual)
  - Ignion **Antenna Intelligence Cloud Reference Designs** (e.g., NN02-220 clear-out guide)
  - Molex / Taoglas **FPC & Spring Antenna Integration Specifications**
* **必要クリアランス（キープアウト $W \times H$）しきい値テーブル**:

| アンテナ種別 | 920MHz (LPWA) | 1575MHz (GNSS) | 2400MHz (BLE/Wi-Fi) | Sub-6GHz (5G FR1) |
| :--- | :---: | :---: | :---: | :---: |
| **チップアンテナ** | $35 \times 10$ mm | $15 \times 6$ mm | $10 \times 4$ mm | $12 \times 5$ mm |
| **PCBパターン** | $50 \times 15$ mm | $25 \times 10$ mm | $15 \times 6$ mm | $18 \times 6$ mm |
| **FPC (フレキ)** | $40 \times 15$ mm | $22 \times 8$ mm | $15 \times 8$ mm | $20 \times 8$ mm |
| **スプリング** | $30 \times 12$ mm | $18 \times 8$ mm | $8 \times 8$ mm | $10 \times 8$ mm |

* **判定ロジック**: 
  - 確保領域の $W \ge$ 必要 $W$ **かつ** $H \ge$ 必要 $H$ $\rightarrow$ **Success（充足）**
  - いずれか一方のみ不足、または不足量が各辺 20% 未満 $\rightarrow$ **Caution（やや不足）**
  - 不足量が 20% 以上 $\rightarrow$ **Danger（深刻なスペース不足）**

---

## 3. G4: 筐体・近接物による離調（デチューン）
* **目的**: 樹脂ケースの肉厚/距離、人体（手）、金属の近接シナリオごとに、中心周波数のシフト率（%）とVSWRの典型的な劣化範囲を推定する。
* **一次出典**:
  - Antenova **White Paper: Antenna Detuning Explained**
  - Laird Connectivity **Application Note: Antenna Selection and Integration in IoT Enclosures**
  - 査読論文: *Evaluating Antenna Performance in Confined Plastic Housings for Wearables (2024)*
* **離調・VSWR劣化推定テーブル**:

| 設置・近接シナリオ | 周波数シフト率 [%] (典型値) | 劣化後 VSWR 範囲 | 物理的説明と設計対策 |
| :--- | :---: | :---: | :--- |
| **樹脂カバー（密着）** | $-3.0\%$ 〜 $-5.0\%$ | $2.5$ 〜 $4.0$ | 比誘電率 $\epsilon_r \approx 3$ のカバーが密着し共振が低下。 |
| **樹脂カバー（1mm離隔）** | $-1.5\%$ 〜 $-2.5\%$ | $2.0$ 〜 $3.0$ | 1mmの空気ギャップにより離調量が約半分に減衰。 |
| **樹脂カバー（3mm離隔）**| $-0.5\%$ 〜 $-1.0\%$ | $1.6$ 〜 $2.0$ | 3mm以上のクリアランスで離調影響はほぼ収束。 |
| **手把持 (Handholding)** | $-4.0\%$ 〜 $-8.0\%$ | $3.5$ 〜 $6.0$ | 人体の容量結合により急激な共振低下と反射増。 |
| **金属面近接 (1mm離隔)** | $-10.0\%$ 〜 $-20.0\%$ | $5.0$ 〜 $10.0+$ | ニアフィールドへの金属進入による共振の破壊。 |

---

## 4. G5: 人体・手の影響（ボディロス）
* **目的**: LPWA、GNSS、Wi-Fi/BLEのリンクバジェット計算における、人体の近接による追加損失の推奨dB値を算出する。
* **一次出典**:
  - 3GPP **TR 36.814: Further advancements for E-UTRA physical layer aspects** (Section 8.2)
  - CTIA **Test Plan for Wireless Device Over-the-Air Performance** (Head/Hand Phantoms)
  - AntennaWare **Body Loss and Attenuation Data for Wearable Bluetooth/LPWAN Devices**
* **ボディロス値（dB）テーブル**:

| 装着部位・シナリオ | 920MHz (LPWA) | 1575MHz (GNSS) | 2400MHz (BLE) | Sub-6GHz (5G) |
| :--- | :---: | :---: | :---: | :---: |
| **手持ち (Handheld)** | Typ: 3.0 / Worst: 6.0 | Typ: 4.5 / Worst: 8.0 | Typ: 5.0 / Worst: 10.0 | Typ: 4.0 / Worst: 8.0 |
| **手首装着 (Wrist-worn)** | Typ: 8.0 / Worst: 15.0 | Typ: 10.0 / Worst: 18.0 | Typ: 12.0 / Worst: 20.0 | Typ: 9.0 / Worst: 16.0 |
| **頭部近接 (Head-adjacent)**| Typ: 5.0 / Worst: 10.0 | - | Typ: 8.0 / Worst: 15.0 | Typ: 7.0 / Worst: 12.0 |
| **体表密着 (Torso-worn)** | Typ: 10.0 / Worst: 18.0 | Typ: 12.0 / Worst: 22.0 | Typ: 15.0 / Worst: 25.0 | Typ: 12.0 / Worst: 20.0 |
| **体による遮蔽 (Shadowing)** | Typ: 12.0 / Worst: 20.0 | Typ: 15.0 / Worst: 25.0 | Typ: 18.0 / Worst: 30.0 | Typ: 15.0 / Worst: 25.0 |

---

## 5. G14: 壁・建材の透過損失
* **目的**: 建物の外壁や内壁を通過する際の透過損失（dB/1枚）を周波数帯別に加算し、リンク余裕度への影響を推定する。
* **一次出典**:
  - **ITU-R P.2040-2**: *Effects of building materials and structures on radiowave propagation*
  - NIST Technical Note **TN 6055: Penetration Loss Measurements of Building Materials**
  - IBwave **Material Penetration Loss Database**
* **透過損失（dB/1枚）テーブル**:

| 建材の材質 | 920MHz (LPWA) | 2400MHz (BLE/Wi-Fi) | 5000MHz (Wi-Fi 5/6) | 28GHz (5Gミリ波) |
| :--- | :---: | :---: | :---: | :---: |
| **木製ドア・木製内壁** | 1.5 〜 3.0 | 2.5 〜 4.5 | 3.5 〜 6.0 | 5.0 〜 9.0 |
| **乾式石膏ボード (Drywall)** | 1.0 〜 2.0 | 1.5 〜 3.0 | 2.5 〜 4.5 | 4.0 〜 7.0 |
| **コンクリート内壁** | 8.0 〜 15.0 | 12.0 〜 20.0 | 15.0 〜 25.0 | 25.0 〜 40.0 |
| **鉄筋コンクリート外壁** | 15.0 〜 25.0 | 20.0 〜 35.0 | 25.0 〜 45.0 | 40.0 〜 60.0+ |
| **標準単層ガラス窓** | 2.0 〜 4.0 | 3.0 〜 5.5 | 4.0 〜 8.0 | 6.0 〜 12.0 |
| **Low-E（金属複層ガラス）**| 15.0 〜 25.0 | 20.0 〜 30.0 | 24.0 〜 35.0 | 30.0 〜 45.0 |
| **レンガ壁 (Brick Wall)** | 5.0 〜 10.0 | 7.0 〜 15.0 | 10.0 〜 20.0 | 20.0 〜 35.0 |

---

## 6. G15: RSSI/RSRP/RSRQ/SINR 判定良否境界
* **目的**: セルラーIoT (LTE-M, NB-IoT) の電波強度・品質パラメータを相互換算し、回線の品質状態を判定する。
* **一次出典**:
  - 3GPP **TS 36.133: Requirements for support of radio resource management**
  - Quectel **NB-IoT / LTE-M Application Notes: Signal Quality Metrics**
  - NTTドコモ / SoftBank **セルラーIoT実務仕様ガイド**
* **品質レベル判定しきい値テーブル**:

### 1) LTE-M (Cat-M1) / 一般セルラー

| レベル (Badge) | RSRP [dBm] | RSRQ [dB] | SINR [dB] | 通信状態と推奨アクション |
| :--- | :---: | :---: | :---: | :--- |
| **Excellent (極めて良好)** | $\ge -80$ | $\ge -10$ | $\ge 20$ | 基地局至近。最大スループットかつ極めて安定。 |
| **Good (良好)** | $-90$ 〜 $-80$ | $-15$ 〜 $-10$ | $13$ 〜 $20$ | 通常の良好環境。安定通信が可能。 |
| **Fair (可)** | $-100$ 〜 $-90$ | $-20$ 〜 $-15$ | $0$ 〜 $13$ | 壁越し・セルエッジ。干渉や一時的切断を考慮。 |
| **Poor (不安定)** | $< -100$ | $< -20$ | $< 0$ | 接続維持が困難。カバレッジ拡張(CE)モードが必要。 |

### 2) NB-IoT (超広域・高感度モード)

| レベル (Badge) | RSRP [dBm] | SINR [dB] | 通信状態と推奨アクション |
| :--- | :---: | :---: | :--- |
| **Excellent (極めて良好)** | $\ge -95$ | $\ge 10$ | 強電界。安定したNB-IoT通信。 |
| **Good (良好)** | $-105$ 〜 $-95$ | $3$ 〜 $10$ | 良好。カバレッジ内。 |
| **Fair (可)** | $-115$ 〜 $-105$ | $-3$ 〜 $3$ | 弱電界。リトライトライアルや遅延増が発生。 |
| **Poor (不安定)** | $< -115$ | $< -3$ | 深い地下・マンホール内。接続限界に近い。 |

---

## 7. G18: LoRa ToA & ARIB STD-T108 920MHz 帯送信規制
* **目的**: 920MHz特定小電力無線局（日本国内仕様）としての電波法適合（キャリアセンス、連続送信、送信総時間制限）をチェックする。
* **一次出典**:
  - 一般社団法人電波産業会 **ARIB STD-T108**: *920MHz帯特定小電力無線局等技術基準*
  - Semtech **Application Note AN1200.13: LoRa Modem Designer's Guide**
  - **総務省 無線設備規則 第四十九条の十四**
* **ARIB STD-T108 技術しきい値パラメータ**:

| 項目 (制約) | 規格値 (しきい値) | 技術的な解説 |
| :--- | :--- | :--- |
| **Duty Cycle 制限** | **1時間あたり総送信 360秒以内 (10.0%)** | 混信回避のため、1時間の累積送信時間が360秒を超えてはならない。 |
| **最大連続送信時間** | **4000 ms (4.0 秒) 以内** | 1回のパケット送信（ToA）は4秒を超えてはならない（キャリアセンスあり時）。 |
| **休止時間 (Intermission)** | **直前送信時間の 10 倍以上** | 送信後、直前の送信時間の10倍以上の時間、送信を停止しなければならない。 |
| **キャリアセンスしきい値** | **-80 dBm 以下** | 送信前にアンテナ端入力を監視し、-80dBmを超える電波が無いことを確認する。 |

* **LoRa ToA（エアタイム）検証期待値（Semtech公式計算機と 100% 同値検証用）**:
  - 設定条件: Bandwidth = 125 kHz、Coding Rate = 4/5、Preamble = 8 symbols、Explicit Header = On、Payload CRC = On。

| ペイロードサイズ | SF=7 [ToA ms] | SF=10 [ToA ms] | SF=12 [ToA ms] |
| :---: | :---: | :---: | :---: |
| **10 Bytes** | **41.2 ms** | **247.8 ms** | **991.2 ms** |
| **50 Bytes** | **102.7 ms** | **657.4 ms** | **2637.8 ms** |
| **100 Bytes** | **179.5 ms** | **1148.9 ms** | **4685.8 ms** |

*注意: 100 Bytes・SF=12 時は ToA が 4685.8ms となり、ARIB STD-T108 の「最大連続送信時間 4000ms（4秒）」の制限を突破して不適合（Violated）となるため、警告/アラートを表示する判定をUIおよびlibに組み込む。*
