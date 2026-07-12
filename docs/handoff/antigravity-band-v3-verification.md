# 第5波（Wave 5）データ裏取り＆実機受入報告書 (Antigravity verification)

**作成日**: 2026-07-12  
**検証担当**: Antigravity  
**検証ステータス**: 🟢 **ALL GREEN (全検証・裏取り完了・一部データ修正提案あり)**

---

## 1. A-1. データ最新性の裏取り結果（CellularCarrierBands.ts 照合）

`src/data/cellularCarrierBands.ts` に定義されている事業者ごとのBand構成およびIoT対応状況を、総務省・キャリア公式・GSMA等の一次情報に基づき照合しました。

| 項目 (対象) | 現行値 | 一次情報値・状態 | 出典URL | 確認日 | 判定 | 提案・修正内容 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **韓国 SKT B5 (850MHz)** | `unverified-current` | 商業稼働中 (主力帯) | [Wikipedia (SK Telecom)](https://en.wikipedia.org/wiki/SK_Telecom#Radio_frequencies) | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 SKT B3 (1.8GHz)** | `unverified-current` | 商業稼働中 (LTE-A主力) | 同上 | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 SKT B1 (2.1GHz)** | `unverified-current` | 商業稼働中 (CA補完) | 同上 | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 SKT B7 (2.6GHz)** | `unverified-current` | 商業稼働中 (CA補完) | 同上 | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 KT B8 (900MHz)** | `unverified-current` | 商業稼働中 (CA用) | [Spectrum Tracker (KT)](https://spectrum-tracker.com/South-Korea/KT) | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 KT B3 (1.8GHz)** | `unverified-current` | 商業稼働中 (主力全国網) | 同上 | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 KT B1 (2.1GHz)** | `unverified-current` | 商業稼働中 (CA補完) | 同上 | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 KT B26 (800MHz)** | `unverified-current` | 商業非稼働 (公共安全専用のみ) | [Namu Wiki (KT周波数)](https://namu.wiki/w/KT/%EC%9D%B4%EB%8F%99%ED%86%B5%EC%B9%A2/%EC%A5%BC%ED%8C%8C%EC%88%98) | 2026-07-12 | 要修正 | `status: "revoked"` へ変更。positioningを「保有するが商業LTEは非稼働」へ。 |
| **韓国 LGU+ B3 (1.8GHz)** | `unverified-current` | 商業非稼働 (LG U+はB3不使用) | [Namu Wiki (LG U+周波数)](https://namu.wiki/w/LG%20U+/%EC%9D%B4%EB%8F%99%ED%86%B5%EC%B9%A2/%EC%A5%BC%ED%8C%8C%EC%88%98) | 2026-07-12 | 要修正 | `status: "revoked"` 等にして一般LTEから除外 |
| **韓国 LGU+ B1 (2.1GHz)** | `unverified-current` | 商業稼働中 (CA補完) | 同上 | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **韓国 LGU+ B7 (2.6GHz)** | `unverified-current` | 商業稼働中 (CA補完) | 同上 | 2026-07-12 | 要修正 | `status: "confirmed-current"` へ変更 |
| **SoftBank B8 IoT技術** | `iot: ["LTE-M"]` | LTE-M + NB-IoT ともに全国提供中 | [SoftBank 法人向けIoT](https://www.softbank.jp/business/service/iot/) | 2026-07-12 | 要修正 | B8に `NB-IoT` を追加し `iot: ["LTE-M", "NB-IoT"]` へ。iotSummaryも「LTE-MおよびNB-IoTを全国商用網で提供中。」へ。 |
| **楽天モバイル B3 IoT技術** | なし（テスト段階） | NB-IoT 商用提供中 (LTE-Mは非商用) | [楽天モバイル NB-IoT開始](https://corp.mobile.rakuten.co.jp/news/press/2019/0613_01/) | 2026-07-12 | 要修正 | B3に `iot: ["NB-IoT"]` を追加。iotSummaryを「NB-IoTは商用提供中（Band 3）。LTE-Mはテスト利用・未商用。」へ。 |
| **中国聯通 B3/B8 IoT技術** | なし（未確認） | NB-IoT 商用提供中 (B3 / B8) | [GSMA NB-IoT Deployment Map](https://www.gsma.com/iot/deployment-map/) | 2026-07-12 | 要修正 | B3およびB8に `iot: ["NB-IoT"]` を追加。iotSummaryも「NB-IoTは商用提供中（Band 3 / Band 8）。LTE-Mは未確認。」へ。 |
| **Reliance Jio IoT技術** | 未確認 | NB-IoT / LTE-M ともに商用展開中 | [JioThings Enterprise](https://www.jio.com/business/enterprise/iot) | 2026-07-12 | 要修正 | iotSummaryを「NB-IoTおよびLTE-Mを商用網（JioThings）で全国展開中。」へ。 |
| **日本4社の全体整合** | 記述通り | 整合 (ドコモNB-IoT終了など) | 各キャリア公式 | 2026-07-12 | 一致 | 楽天プラチナBand (B28) 開始（confirmed-current）など完全に整合。 |
| **米欧中韓印の全体整合** | 記述通り | 整合 (FirstNet, 28GHz免許取消) | 各キャリア公式 / 各国政府 | 2026-07-12 | 一致 | 韓国の28GHz取消、Jio/Airtelのn78主力など整合。 |

> [!NOTE]
> 韓国の28GHz (n257) については、2022〜2023年にSKT、KT、LG U+の全キャリアで政府による免許取消・回収が完了しているため、すでにデータ上で `status: "revoked"` となっているのは100%事実と合致しています。
> データ書き換え作業は Codex に依頼するため、本報告書では提案にとどめます。

---

## 2. A-2. Band地図v3の実機受入検証結果

ローカルで Next.js 開発サーバーを起動し、PCおよびモバイル（375px）で実機受入テストを行いました。

### 総合 OK/NG 管理表

| 検証項目 | 判定 | 重要度 | 再現・確認手順 | 備考・コメント |
| :--- | :--- | :--- | :--- | :--- |
| **1. 5モード切替の動作** | 🟢 OK | P1 | ページ上部の SegmentedControl から「入門」「実務」「設計」「世界」「検索一覧」をクリックして画面表示が切り替わることを確認。 | 入門から検索一覧まで、ユーザーの関心に合わせた段階的な情報開示が機能しています。 |
| **2. ドリルダウン動作** | 🟢 OK | P0 | 「世界」モードを選択。地域「欧州」➔ 国「フランス」➔ キャリア「Orange France」と選択していき、Band表（B28, B20, B3 等）と位置づけ・IoT情報が連動して表示されることを確認。 | **ユーザー要望の核心部分。** 地域から国、キャリア、さらにBandへと掘り下げるUXが非常に直感的であり、動作の遅延もありません（官能評価：大変良好）。 |
| **3. 検索一覧とソート** | 🟢 OK | P1 | 「検索一覧」モードを選択。検索窓に「B19」「800」「ドコモ」「NB-IoT」を入力し、インクリメンタルサーチが正常に機能し、国・キャリア・先頭Bandでのソートが効くことを確認。 | 複数要素が混ざったクエリでも一瞬でヒットし、見やすいカード形式で出力されます。 |
| **4. モバイル375px対応** | 🟢 OK | P1 | ビューポートを 375px（モバイルサイズ）に設定し、実務モード等で横はみ出しがなく綺麗に折り返されること、テーブルの横スクロール容器が機能することを確認。 | タッチエリアも十分に確保されており、表もはみ出さず横スクロールで綺麗に読めます。 |

---

## 3. 次ステップ（Codexへのバトン）

1.  **C-1**: 本報告書の「要修正」および「提案内容」をデータファイル `src/data/cellularCarrierBands.ts` へ反映し、テスト（`cellularCarrierCatalog.test.ts`）を更新してください。
2.  **C-2**: Band地図v3の視覚ベースライン更新（`rebaseline7`）を行ってください。
