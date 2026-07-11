# 学習クエスト問題パック60問 実装レポート

学習クエスト用の追加問題60問を、指定された3つのファイルに各20問ずつ実装しました。すべての問題は、指定された確定パラメータのみに基づき、現場シナリオ起点の実践的な設問として設計されています。

## 1. 作成ファイルおよびエクスポート変数一覧

1.  **実装設計編 (Apprentice)**:
    *   **ファイル名**: [src/data/rfQuestImplementationSeeds.ts](file:///Users/pc141/Documents/rf-codex/src/data/rfQuestImplementationSeeds.ts)
    *   **エクスポート名**: `implementationSeeds` (`QuestExpansionSeed[]` 型)
    *   **内訳 (計20問)**:
        *   アンテナ・キープアウト領域チェック (`antenna-keepout`): 4問
        *   GNDプレーン寸法と効率 (`ground-plane-size`): 4問
        *   筐体・近接物の離調推定 (`detuning-estimator`): 4問
        *   人体・手の影響ボディロス (`body-loss`): 4問
        *   金属面近接の利得変化 (`metal-plane-effect`): 2問
        *   逆F・IFA初期寸法 (`ifa-initial-dimensions`): 2問
2.  **実地計測・受信品質編 (Practitioner)**:
    *   **ファイル名**: [src/data/rfQuestFieldSeeds.ts](file:///Users/pc141/Documents/rf-codex/src/data/rfQuestFieldSeeds.ts)
    *   **エクスポート名**: `fieldSeeds` (`QuestExpansionSeed[]` 型)
    *   **内訳 (計20問)**:
        *   壁・建材の透過損失 (`wall-penetration`): 4問
        *   OTA測定・TRP/TIS設計 (`desense` 等への結線): 4問
        *   デセンス（感度劣化） (`desense`): 3問
        *   電測サンプリング設計 (`measurement-sampling`): 4問
        *   LTE電波指標の換算 (`lte-signal-metrics`): 3問
        *   GNSS C/N0バジェット (`gnss-cn0`): 2問
3.  **法規・規格・応用知識編 (Expert)**:
    *   **ファイル名**: [src/data/rfQuestRegulationSeeds.ts](file:///Users/pc141/Documents/rf-codex/src/data/rfQuestRegulationSeeds.ts)
    *   **エクスポート名**: `regulationSeeds` (`QuestExpansionSeed[]` 型)
    *   **内訳 (計20問)**:
        *   LoRa/ARIB STD-T108規格制限 (`lora-airtime`): 5問
        *   EIRP法規チェック (`eirp-compliance`): 3問
        *   dB・dBm・dBi・dBdの違い/計算 (`db-family`): 5問
        *   ダイバーシティ利得 (`diversity-gain`): 3問
        *   VSWR帯域幅とQ (`vswr-bandwidth-q`): 2問
        *   電池寿命（自己放電・パルス） (`battery-life`): 2問

## 2. 確定値パラメータの適用検証

各設問および解説・コラムにおいて、以下の指定確定値が正確に引用されていることを検証済みです。

*   **キープアウト**: 不足率20%が注意/NGの境界、2.4GHzチップの10×4mm
*   **GNDプレーン最長辺 Lg**: λ/4未満で効率急落、λ/10で-6dB（電力1/4）、λ/20で-12dB
*   **離調**: 樹脂密着で-3〜-5%シフト、3mm離隔でほぼ収束、帯域判定条件 |シフト量| ≦ BW/2
*   **ボディロス**: 920MHz手持ちで3〜6dB、2.4GHz体表密着で15〜25dB
*   **金属面距離 d**: d=λ/4で利得最大+6dB、d→0（密着）で打消し（ヌル）
*   **壁透過**: 単層石膏1〜2dB、コンクリート内壁8〜15dB、Low-E複層ガラス20〜30dB
*   **デセンス**: I=Nでフロア+3dB（感度半分）、I=N-10dBで+0.4dB、3dBデセンス時に自由空間到達距離が約29%減少（理想の約71%に縮退）
*   **電測測定数 n**: σ=8dB、許容誤差E=±2dB、信頼度95%でn=62点、Lee窓長は40λ、窓内サンプリングは50点（約0.8λ間隔）
*   **LTE品質**: RSSI/RSRP換算式 $RSRP \approx RSSI - 10\log_{10}(12 \cdot N_{RB})$、10MHz（50RB）時の理論差27.78dB、フルロード時のRSRQ理論上限値 約-10.8dB
*   **ARIB STD-T108**: 連続送信4秒、休止時間10倍、累積送信360秒/時間、キャリアセンス閾値 -80dBm。SF12/125kHz/100B時のToA約3.94秒、SF+1でToA約2倍
*   **dBファミリー**: dBd = dBi - 2.15、無相関信号 10dBm + 10dBm = 13dBm
*   **ダイバーシティ**: 1%アウテージ無相関2ブランチで約10.2dB改善、0.5λ間隔で相関係数 ρe ≒ 0.09
*   **Qと比帯域幅 FBW**: $FBW = \frac{s - 1}{Q\sqrt{s}}$、Q=20/s=2でFBW 3.54%
*   **電池寿命**: コイン形CR2032大パルス（15mA超など）で実効容量約25%へ低下、自己放電による長期時間税
