# 電池寿命エキスパートモード 実装レポート

電池寿命見積もりツールに、電池の実特性（自己放電、温度、パルス負荷）を考慮した「エキスパートモード」を実装しました。

## 1. 変更・追加ファイル一覧

*   **データ定義層**:
    *   [src/data/batteryChemistry.ts](file:///Users/pc141/Documents/rf-codex/src/data/batteryChemistry.ts) (新規作成):
        *   Li-SOCl2ボビン型、Li-SOCl2スパイラル型、Li-MnO2、CR2032、アルカリAAの5種類の特性プロファイル、温度補間テーブル、パルス係数区分をデータシートに準拠して定義。
*   **ロジック層**:
    *   [src/lib/rf/batteryLifeExpert.ts](file:///Users/pc141/Documents/rf-codex/src/lib/rf/batteryLifeExpert.ts) (新規作成):
        *   温度とパルスディレーティングを加味した実効容量算出。
        *   自己放電率 $r$ に対し、一次方程式の閉形式解 $L = \frac{C_{\text{eff}}}{I_{\text{avg}} \times 8760 + C_{\text{nominal}} \times r}$ を解いて自己放電消費との連立寿命年数を計算。
        *   支配要因（`dominantFactor`）の判定（TX, RX, スリープ, 温度, パルス, 自己放電）。
        *   Li-SOCl2長期不動態化警告および10年クランプ判定フラグの付与。
*   **UI・表示層**:
    *   [src/app/tools/_components/BatteryLifePanel.tsx](file:///Users/pc141/Documents/rf-codex/src/app/tools/_components/BatteryLifePanel.tsx) (変更):
        *   「標準」「エキスパート」モード切り替え（`SegmentedControl`）の追加（トグルOFF時は従来動作と完全互換）。
        *   化学特性チップ、温度スライダー、RX電流・時間設定、保管経年設定の追加。
        *   律速要因バッジおよび化学特性別Callout表示の追加（CR2032大パルス警告、Li-SOCl2不動態化注意、アルカリ低温警告など）。
        *   TX/RX/Sleep/自己放電の4成分積み上げSVG割合チャートの追加。
    *   [src/app/tools/_components/BatteryLifeExpertColumn.tsx](file:///Users/pc141/Documents/rf-codex/src/app/tools/_components/BatteryLifeExpertColumn.tsx) (新規作成):
        *   E1様式解説コラム「10年電池の落とし穴」を追加。
*   **テスト**:
    *   [src/tests/batteryLifeExpert.test.ts](file:///Users/pc141/Documents/rf-codex/src/tests/batteryLifeExpert.test.ts) (新規作成):
        *   温度補間、自己放電支配、パルス劣化、長期保管、不動態化などの網羅的なユニットテスト。

## 2. 追加ユニットテスト数

*   **6テストケース（全テストはアサーションも含め成功）**
    *   温度係数の線形補間テスト
    *   実効容量計算と支配要因判定（`sleep` / `tx` / `pulse` / `temperature` / `self_discharge` 等）
    *   自己放電連立方程式（閉形式解）の整合性確認
    *   保管経年（`agingYears`）による自己放電減衰テスト
    *   不動態化警告および10年クランプ判定テスト
    *   ガードエラー（異常入力値）の挙動検証

## 3. E2Eテスト追加案（テキストプロポーザル）

`e2e/tools.spec.ts` などのE2Eスイートに追加するテストコード案です。

```typescript
test('電池寿命エキスパートモードのUI疎通と注意文言のE2E', async ({ page }) => {
  await page.goto('/tools/battery-life');

  // エキスパートモードへのトグル切り替え
  const expertToggle = page.locator('button:has-text("エキスパート")');
  await expect(expertToggle).toBeVisible();
  await expertToggle.click();

  // エキスパート用インプットが表示されるか検証
  await expect(page.locator('text=動作温度')).toBeVisible();
  await expect(page.locator('text=電池化学特性')).toBeVisible();

  // CR2032を選択
  await page.click('button:has-text("コイン形CR2032")');

  // パルス大電流Calloutの表示検証 (例: ピーク電流を大きく設定した場合)
  // 入力をパルス警告しきい値(15mA超)に書き換える
  const txCurrentInput = page.locator('input[aria-label="送信電流（またはピーク電流）"]');
  await txCurrentInput.fill('20');
  
  // 警告文言の出現を確認
  await expect(page.locator('text=CR2032は大パルス電流（15mA超）で実効容量が約25%まで大幅に低下します')).toBeVisible();

  // SVG積み上げチャートの表示検証
  const svgChart = page.locator('svg[aria-label="消費電力の内訳割合"]');
  await expect(svgChart).toBeVisible();
});
```
