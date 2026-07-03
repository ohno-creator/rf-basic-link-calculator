# アクセシビリティ基準線 (UX-0 Axe Baseline)

**作成日時**: 2026-07-03T14:23:55.884Z

重大(serious/critical)なアクセシビリティ違反の一覧です。現状の違反を記録し、今後の改善の基準線とします。

### 統計情報
- 調査ページ数: 25
- 違反ありページ数: 25
- 重大違反(種類数)の総和: 27

## 違反詳細

### [home](file:///tools/home/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <span class="text-white/80">24</span>
  ```
  - セレクタ: `[".text-white\\/80"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 3.86 (foreground color: #cce3f2, background color: #0071bd, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".mt-10"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [rf-basic-link-calculator](file:///tools/rf-basic-link-calculator/) (3件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <span class="mt-1 block text-xs text-white/85">現在の距離で通信成立の余裕を見る</span>
  ```
  - セレクタ: `[".text-white\\/85"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.15 (foreground color: #d9eaf5, background color: #0071bd, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

#### 🔴 [SERIOUS] nested-interactive: Interactive controls must not be nested
- **説明**: Ensure interactive controls are not nested as they are not always announced by screen readers or can cause focus problems for assistive technologies
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/nested-interactive?application=playwright](https://dequeuniversity.com/rules/axe/4.12/nested-interactive?application=playwright)
- **対象要素**:
  ```html
  <svg role="img" aria-label="送信電力から受信電力までのリンクバジェット滝グラフ" viewBox="0 0 860 380" class="h-auto w-full">
  ```
  - セレクタ: `["svg[aria-label=\"送信電力から受信電力までのリンクバジェット滝グラフ\"]"]`
  - 修正要約: Fix any of the following:
  Element has focusable descendants

#### 🔴 [CRITICAL] select-name: Select element must have an accessible name
- **説明**: Ensure select element has an accessible name
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/select-name?application=playwright](https://dequeuniversity.com/rules/axe/4.12/select-name?application=playwright)
- **対象要素**:
  ```html
  <select class="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"><option value="m">m</option><option value="km" selected="">km</option></select>
  ```
  - セレクタ: `[".sm\\:grid-cols-\\[1fr_120px\\].grid.gap-3 > select"]`
  - 修正要約: Fix any of the following:
  Element does not have an implicit (wrapped) <label>
  Element does not have an explicit <label>
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Element has no title attribute
  Element's default semantics were not overridden with role="none" or role="presentation"

---

### [simple-link-budget](file:///tools/simple-link-budget/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <p class="text-xs font-semibold text-slate-500">リンク余裕</p>
  ```
  - セレクタ: `[".bg-staf-light.p-4.rounded-lg > .text-left > .text-slate-500:nth-child(1)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.25 (foreground color: #64748b, background color: #e8f4fc, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <p class="mt-1 text-xs leading-relaxed text-slate-500">0dBを上回るほど余裕あり</p>
  ```
  - セレクタ: `[".bg-staf-light.p-4.rounded-lg > .text-left > .mt-1.text-slate-500.leading-relaxed"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.25 (foreground color: #64748b, background color: #e8f4fc, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [free-space-loss](file:///tools/free-space-loss/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [fresnel-zone](file:///tools/fresnel-zone/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <p class="mt-1 text-[11px] leading-relaxed text-slate-400">※横方向（距離）と縦方向（高さ）の縮尺は異なります（路線断面図と同様）。回折損失はナイフエッジ近似による目安で、樹木・建物の透過・反射や地形の細部は含みません。</p>
  ```
  - セレクタ: `[".text-\\[11px\\].text-slate-400.mt-1"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [propagation-loss](file:///tools/propagation-loss/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <button type="button" aria-pressed="false" class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600">
  ```
  - セレクタ: `[".hover\\:text-slate-600"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-xs font-medium text-slate-400">MHz</span>
  ```
  - セレクタ: `[".p-3.rounded-lg.border-slate-200:nth-child(1) > .flex-wrap.justify-between.gap-2 > .gap-2.flex.items-center > .font-medium.text-slate-400.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-xs font-medium text-slate-400">km</span>
  ```
  - セレクタ: `[".p-3.rounded-lg.border-slate-200:nth-child(2) > .flex-wrap.justify-between.gap-2 > .gap-2.flex.items-center > .font-medium.text-slate-400.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="ml-2 text-xs font-medium text-slate-400">+<!-- -->30.0</span>
  ```
  - セレクタ: `[".p-3.rounded-lg.border-slate-200:nth-child(3) > .gap-3.justify-between.flex > .text-right.shrink-0 > .ml-2.font-medium.text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="ml-2 text-xs font-medium text-slate-400">+<!-- -->34.9</span>
  ```
  - セレクタ: `[".p-3.rounded-lg.border-slate-200:nth-child(4) > .gap-3.justify-between.flex > .text-right.shrink-0 > .ml-2.font-medium.text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="w-6 shrink-0 text-xs font-semibold text-slate-400">#<!-- -->1</span>
  ```
  - セレクタ: `[".w-6"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="ml-0.5 text-xs font-medium text-slate-400">MHz</span>
  ```
  - セレクタ: `[".p-3.rounded-md.border-slate-200:nth-child(1) > .justify-between.gap-2.flex > .text-staf-dark.font-bold.text-sm > .ml-0\\.5.font-medium.text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [ncu-below-ground](file:///tools/ncu-below-ground/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <span class="mt-1 block text-sm leading-relaxed text-white/85">写真・図面・距離から、危険因子と通信余裕レンジを先に見る。</span>
  ```
  - セレクタ: `[".text-white\\/85"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.15 (foreground color: #d9eaf5, background color: #0071bd, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".pt-6"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [nami-gate-window](file:///tools/nami-gate-window/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <button type="button" role="radio" aria-checked="false" tabindex="-1" class="rounded-md px-4 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 text-slate-500 hover:text-slate-700">設置なし</button>
  ```
  - セレクタ: `[".hover\\:text-slate-700.py-1\\.5[role=\"radio\"]:nth-child(1)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.34 (foreground color: #64748b, background color: #f1f5f9, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" role="radio" aria-checked="false" tabindex="-1" class="rounded-md px-4 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 text-slate-500 hover:text-slate-700">改善量</button>
  ```
  - セレクタ: `[".hover\\:text-slate-700.py-1\\.5[role=\"radio\"]:nth-child(3)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.34 (foreground color: #64748b, background color: #f1f5f9, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-slate-400">セルにカーソル／タップで、その位置のOFF・ON・改善量を表示します。</span>
  ```
  - セレクタ: `[".min-h-\\[1\\.5rem\\] > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [rf-learning-quest](file:///tools/rf-learning-quest/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <span class="text-xs font-bold text-slate-400">STEP <!-- -->1</span>
  ```
  - セレクタ: `["article:nth-child(1) > .gap-3.justify-between.flex > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-xs font-bold text-slate-400">STEP <!-- -->2</span>
  ```
  - セレクタ: `["article:nth-child(2) > .gap-3.justify-between.flex > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-xs font-bold text-slate-400">STEP <!-- -->3</span>
  ```
  - セレクタ: `["article:nth-child(3) > .gap-3.justify-between.flex > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-xs font-bold text-slate-400">STEP <!-- -->4</span>
  ```
  - セレクタ: `["article:nth-child(4) > .gap-3.justify-between.flex > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="rounded-full px-2 py-0.5 text-[11px] font-bold bg-white/20">200問</span>
  ```
  - セレクタ: `[".bg-white\\/20"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 3.61 (foreground color: #ffffff, background color: #338dca, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="mt-2 block text-xs leading-relaxed text-white/85">波長、利得、VSWR、放射効率、GND、筐体影響など、アンテナメーカーの現場で最初に押さえたい言葉を固めます。</span>
  ```
  - セレクタ: `[".text-white\\/85"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.15 (foreground color: #d9eaf5, background color: #0071bd, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span title="λ/2・λ/4のサイズ感が見えてきます。" class="rounded-full border px-2.5 py-1 text-xs font-bold border-slate-200 bg-white text-slate-400">未解放 <!-- -->波長の羅針盤</span>
  ```
  - セレクタ: `["span[title=\"λ/2・λ/4のサイズ感が見えてきます。\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span title="整合だけでなく効率を見る目が育ちます。" class="rounded-full border px-2.5 py-1 text-xs font-bold border-slate-200 bg-white text-slate-400">未解放 <!-- -->VSWRゲージ</span>
  ```
  - セレクタ: `["span[title=\"整合だけでなく効率を見る目が育ちます。\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span title="筐体、GND、ケーブルの影響を疑える段階です。" class="rounded-full border px-2.5 py-1 text-xs font-bold border-slate-200 bg-white text-slate-400">未解放 <!-- -->実装ルーペ</span>
  ```
  - セレクタ: `["span[title=\"筐体、GND、ケーブルの影響を疑える段階です。\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span title="地面・人体・金属近接をリンク余裕へ落とし込めます。" class="rounded-full border px-2.5 py-1 text-xs font-bold border-slate-200 bg-white text-slate-400">未解放 <!-- -->近傍損失ハンター</span>
  ```
  - セレクタ: `["span[title=\"地面・人体・金属近接をリンク余裕へ落とし込めます。\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span title="モデル選択と実測補正を組み合わせて説明できます。" class="rounded-full border px-2.5 py-1 text-xs font-bold border-slate-200 bg-white text-slate-400">未解放 <!-- -->アンテナ設計士</span>
  ```
  - セレクタ: `["span[title=\"モデル選択と実測補正を組み合わせて説明できます。\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span title="チルト、方位、干渉、GISの前提を意識できます。" class="rounded-full border px-2.5 py-1 text-xs font-bold border-slate-200 bg-white text-slate-400">未解放 <!-- -->基地局配置マスター</span>
  ```
  - セレクタ: `["span[title=\"チルト、方位、干渉、GISの前提を意識できます。\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-white/90">0<!-- -->/<!-- -->200</span>
  ```
  - セレクタ: `[".text-white\\/90"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.46 (foreground color: #e6f1f8, background color: #0071bd, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-slate-400">0<!-- -->/<!-- -->100</span>
  ```
  - セレクタ: `[".py-1\\.5.px-3.gap-1\\.5:nth-child(2) > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-slate-400">0<!-- -->/<!-- -->100</span>
  ```
  - セレクタ: `[".py-1\\.5.px-3.gap-1\\.5:nth-child(3) > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-slate-400">0<!-- -->/<!-- -->100</span>
  ```
  - セレクタ: `[".py-1\\.5.px-3.gap-1\\.5:nth-child(4) > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-slate-400">0<!-- -->/<!-- -->100</span>
  ```
  - セレクタ: `[".py-1\\.5.px-3.gap-1\\.5:nth-child(5) > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-slate-400">0<!-- -->/<!-- -->100</span>
  ```
  - セレクタ: `[".py-1\\.5.px-3.gap-1\\.5:nth-child(6) > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-slate-400">0<!-- -->/<!-- -->300</span>
  ```
  - セレクタ: `[".py-1\\.5.px-3.gap-1\\.5:nth-child(7) > .text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(1) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：RF（クリアで獲得）" aria-label="未獲得カード（RF）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：RF（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：電波（クリアで獲得）" aria-label="未獲得カード（電波）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：電波（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：周波数（クリアで獲得）" aria-label="未獲得カード（周波数）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：周波数（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：波長（クリアで獲得）" aria-label="未獲得カード（波長）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：波長（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：MHz（クリアで獲得）" aria-label="未獲得カード（MHz）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：MHz（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：GHz（クリアで獲得）" aria-label="未獲得カード（GHz）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：GHz（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：dB（クリアで獲得）" aria-label="未獲得カード（dB）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：dB（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：dBm（クリアで獲得）" aria-label="未獲得カード（dBm）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：dBm（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：dBi（クリアで獲得）" aria-label="未獲得カード（dBi）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：dBi（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：dBd（クリアで獲得）" aria-label="未獲得カード（dBd）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：dBd（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(2) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：利得（クリアで獲得）" aria-label="未獲得カード（利得）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：利得（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：損失（クリアで獲得）" aria-label="未獲得カード（損失）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：EIRP（クリアで獲得）" aria-label="未獲得カード（EIRP）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：EIRP（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ERP（クリアで獲得）" aria-label="未獲得カード（ERP）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ERP（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：送信電力（クリアで獲得）" aria-label="未獲得カード（送信電力）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：送信電力（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：受信電力（クリアで獲得）" aria-label="未獲得カード（受信電力）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：受信電力（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：受信感度（クリアで獲得）" aria-label="未獲得カード（受信感度）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：受信感度（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：リンクバジェット（クリアで獲得）" aria-label="未獲得カード（リンクバジェット）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：リンクバジェット（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：リンクマージン（クリアで獲得）" aria-label="未獲得カード（リンクマージン）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：リンクマージン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：フェードマージン（クリアで獲得）" aria-label="未獲得カード（フェードマージン）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：フェードマージン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(3) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：伝搬損失（クリアで獲得）" aria-label="未獲得カード（伝搬損失）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：伝搬損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：自由空間損失（クリアで獲得）" aria-label="未獲得カード（自由空間損失）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：自由空間損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：Friis式（クリアで獲得）" aria-label="未獲得カード（Friis式）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：Friis式（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：遠方界（クリアで獲得）" aria-label="未獲得カード（遠方界）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：遠方界（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：近傍界（クリアで獲得）" aria-label="未獲得カード（近傍界）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：近傍界（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナ（クリアで獲得）" aria-label="未獲得カード（アンテナ）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：等方性アンテナ（クリアで獲得）" aria-label="未獲得カード（等方性アンテナ）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：等方性アンテナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ダイポールアンテナ（クリアで獲得..." aria-label="未獲得カード（ダイポールアンテナ）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ダイポールアンテナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：モノポールアンテナ（クリアで獲得..." aria-label="未獲得カード（モノポールアンテナ）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：モノポールアンテナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：グランドプレーン（クリアで獲得）" aria-label="未獲得カード（グランドプレーン）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：グランドプレーン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(4) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：カウンターポイズ（クリアで獲得）" aria-label="未獲得カード（カウンターポイズ）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：カウンターポイズ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：放射パターン（クリアで獲得）" aria-label="未獲得カード（放射パターン）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：放射パターン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ビーム幅（クリアで獲得）" aria-label="未獲得カード（ビーム幅）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ビーム幅（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ヌル（クリアで獲得）" aria-label="未獲得カード（ヌル）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ヌル（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：偏波（クリアで獲得）" aria-label="未獲得カード（偏波）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：偏波（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：直線偏波（クリアで獲得）" aria-label="未獲得カード（直線偏波）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：直線偏波（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：円偏波（クリアで獲得）" aria-label="未獲得カード（円偏波）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：円偏波（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：インピーダンス（クリアで獲得）" aria-label="未獲得カード（インピーダンス）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：インピーダンス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：整合（クリアで獲得）" aria-label="未獲得カード（整合）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：整合（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：SWR（クリアで獲得）" aria-label="未獲得カード（SWR）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：SWR（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(5) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：リターンロス（クリアで獲得）" aria-label="未獲得カード（リターンロス）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：リターンロス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：反射係数（クリアで獲得）" aria-label="未獲得カード（反射係数）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：反射係数（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：同軸ケーブル（クリアで獲得）" aria-label="未獲得カード（同軸ケーブル）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：同軸ケーブル（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：挿入損失（クリアで獲得）" aria-label="未獲得カード（挿入損失）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：挿入損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：RFコネクタ（クリアで獲得）" aria-label="未獲得カード（RFコネクタ）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：RFコネクタ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：SMA（クリアで獲得）" aria-label="未獲得カード（SMA）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：SMA（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：U.FL/I-PEX（クリアで獲..." aria-label="未獲得カード（U.FL/I-PEX）。問..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：U.FL/I-PEX（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：給電線（クリアで獲得）" aria-label="未獲得カード（給電線）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：給電線（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：コモンモード（クリアで獲得）" aria-label="未獲得カード（コモンモード）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：コモンモード（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：チョーク（クリアで獲得）" aria-label="未獲得カード（チョーク）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：チョーク（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(6) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：バラン（クリアで獲得）" aria-label="未獲得カード（バラン）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：バラン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：フィルタ（クリアで獲得）" aria-label="未獲得カード（フィルタ）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：フィルタ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LNA（クリアで獲得）" aria-label="未獲得カード（LNA）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LNA（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：PA（クリアで獲得）" aria-label="未獲得カード（PA）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：PA（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ノイズフロア（クリアで獲得）" aria-label="未獲得カード（ノイズフロア）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ノイズフロア（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：SNR（クリアで獲得）" aria-label="未獲得カード（SNR）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：SNR（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：SINR（クリアで獲得）" aria-label="未獲得カード（SINR）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：SINR（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：RSSI（クリアで獲得）" aria-label="未獲得カード（RSSI）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：RSSI（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：RSRP（クリアで獲得）" aria-label="未獲得カード（RSRP）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：RSRP（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：RSRQ（クリアで獲得）" aria-label="未獲得カード（RSRQ）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：RSRQ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(7) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：BER（クリアで獲得）" aria-label="未獲得カード（BER）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：BER（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：PER（クリアで獲得）" aria-label="未獲得カード（PER）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：PER（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：遅延（クリアで獲得）" aria-label="未獲得カード（遅延）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：遅延（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：スループット（クリアで獲得）" aria-label="未獲得カード（スループット）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：スループット（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：帯域幅（クリアで獲得）" aria-label="未獲得カード（帯域幅）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：帯域幅（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：変調（クリアで獲得）" aria-label="未獲得カード（変調）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：変調（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：符号化（クリアで獲得）" aria-label="未獲得カード（符号化）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：符号化（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：FSK（クリアで獲得）" aria-label="未獲得カード（FSK）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：FSK（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：PSK（クリアで獲得）" aria-label="未獲得カード（PSK）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：PSK（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：QAM（クリアで獲得）" aria-label="未獲得カード（QAM）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：QAM（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(8) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：OFDM（クリアで獲得）" aria-label="未獲得カード（OFDM）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：OFDM（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：サブキャリア（クリアで獲得）" aria-label="未獲得カード（サブキャリア）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：サブキャリア（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：チャネル（クリアで獲得）" aria-label="未獲得カード（チャネル）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：チャネル（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：干渉（クリアで獲得）" aria-label="未獲得カード（干渉）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：干渉（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：同一チャネル干渉（クリアで獲得）" aria-label="未獲得カード（同一チャネル干渉）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：同一チャネル干渉（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：隣接チャネル干渉（クリアで獲得）" aria-label="未獲得カード（隣接チャネル干渉）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：隣接チャネル干渉（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：雑音（クリアで獲得）" aria-label="未獲得カード（雑音）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：雑音（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：熱雑音（クリアで獲得）" aria-label="未獲得カード（熱雑音）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：熱雑音（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：雑音指数（クリアで獲得）" aria-label="未獲得カード（雑音指数）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：雑音指数（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ダイナミックレンジ（クリアで獲得..." aria-label="未獲得カード（ダイナミックレンジ）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ダイナミックレンジ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(9) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：飽和（クリアで獲得）" aria-label="未獲得カード（飽和）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：飽和（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ブロッキング（クリアで獲得）" aria-label="未獲得カード（ブロッキング）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ブロッキング（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：デセンス（クリアで獲得）" aria-label="未獲得カード（デセンス）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：デセンス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：デュプレックス（クリアで獲得）" aria-label="未獲得カード（デュプレックス）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：デュプレックス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：TDD（クリアで獲得）" aria-label="未獲得カード（TDD）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：TDD（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：FDD（クリアで獲得）" aria-label="未獲得カード（FDD）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：FDD（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：上りリンク（クリアで獲得）" aria-label="未獲得カード（上りリンク）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：上りリンク（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：下りリンク（クリアで獲得）" aria-label="未獲得カード（下りリンク）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：下りリンク（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ゲートウェイ（クリアで獲得）" aria-label="未獲得カード（ゲートウェイ）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ゲートウェイ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：基地局（クリアで獲得）" aria-label="未獲得カード（基地局）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：基地局（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(10) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：セル（クリアで獲得）" aria-label="未獲得カード（セル）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：セル（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：セクタ（クリアで獲得）" aria-label="未獲得カード（セクタ）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：セクタ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ハンドオーバ（クリアで獲得）" aria-label="未獲得カード（ハンドオーバ）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ハンドオーバ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ローミング（クリアで獲得）" aria-label="未獲得カード（ローミング）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ローミング（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LPWA（クリアで獲得）" aria-label="未獲得カード（LPWA）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LPWA（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LoRa（クリアで獲得）" aria-label="未獲得カード（LoRa）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LoRa（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LoRaWAN（クリアで獲得）" aria-label="未獲得カード（LoRaWAN）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LoRaWAN（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：Spreading Factor..." aria-label="未獲得カード（Spreading Fac..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：Spreading Factor（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ADR（クリアで獲得）" aria-label="未獲得カード（ADR）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ADR（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：Time-on-Air（クリアで..." aria-label="未獲得カード（Time-on-Air）。..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：Time-on-Air（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(11) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：Sigfox（クリアで獲得）" aria-label="未獲得カード（Sigfox）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：Sigfox（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：NB-IoT（クリアで獲得）" aria-label="未獲得カード（NB-IoT）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：NB-IoT（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LTE-M（クリアで獲得）" aria-label="未獲得カード（LTE-M）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LTE-M（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ELTRES（クリアで獲得）" aria-label="未獲得カード（ELTRES）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ELTRES（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LTE Cat.1（クリアで獲得..." aria-label="未獲得カード（LTE Cat.1）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LTE Cat.1（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LoRa/LoRaWAN（クリア..." aria-label="未獲得カード（LoRa/LoRaWAN）..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LoRa/LoRaWAN（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：無線方式の選び方（クリアで獲得）" aria-label="未獲得カード（無線方式の選び方）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：無線方式の選び方（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：LTEのバンド（クリアで獲得）" aria-label="未獲得カード（LTEのバンド）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：LTEのバンド（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：5GのFR1とFR2（クリアで獲..." aria-label="未獲得カード（5GのFR1とFR2）。問..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：5GのFR1とFR2（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：方式と周波数の対応（クリアで獲得..." aria-label="未獲得カード（方式と周波数の対応）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：方式と周波数の対応（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(12) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：回折（クリアで獲得）" aria-label="未獲得カード（回折）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：回折（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：反射（クリアで獲得）" aria-label="未獲得カード（反射）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：反射（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：散乱（クリアで獲得）" aria-label="未獲得カード（散乱）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：散乱（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：マルチパス（クリアで獲得）" aria-label="未獲得カード（マルチパス）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：マルチパス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：フェージング（クリアで獲得）" aria-label="未獲得カード（フェージング）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：フェージング（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：シャドウイング（クリアで獲得）" aria-label="未獲得カード（シャドウイング）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：シャドウイング（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：2波モデル（クリアで獲得）" aria-label="未獲得カード（2波モデル）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：2波モデル（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ブレークポイント（クリアで獲得）" aria-label="未獲得カード（ブレークポイント）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ブレークポイント（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：Log-distanceモデル（..." aria-label="未獲得カード（Log-distanceモ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：Log-distanceモデル（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：距離損失指数（クリアで獲得）" aria-label="未獲得カード（距離損失指数）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：距離損失指数（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(13) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：奥村・秦モデル（クリアで獲得）" aria-label="未獲得カード（奥村・秦モデル）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：奥村・秦モデル（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：COST231-Hata（クリア..." aria-label="未獲得カード（COST231-Hata）..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：COST231-Hata（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：クラッタ（クリアで獲得）" aria-label="未獲得カード（クラッタ）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：クラッタ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：O2I（クリアで獲得）" aria-label="未獲得カード（O2I）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：O2I（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：建物侵入損失（クリアで獲得）" aria-label="未獲得カード（建物侵入損失）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：建物侵入損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：人体遮蔽損失（クリアで獲得）" aria-label="未獲得カード（人体遮蔽損失）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：人体遮蔽損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：車両遮蔽損失（クリアで獲得）" aria-label="未獲得カード（車両遮蔽損失）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：車両遮蔽損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：筐体損失（クリアで獲得）" aria-label="未獲得カード（筐体損失）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：筐体損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：設置ばらつきマージン（クリアで獲..." aria-label="未獲得カード（設置ばらつきマージン）。問..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：設置ばらつきマージン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：実測補正値（クリアで獲得）" aria-label="未獲得カード（実測補正値）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：実測補正値（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(14) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：IoTの基本構成（クリアで獲得）" aria-label="未獲得カード（IoTの基本構成）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：IoTの基本構成（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：IoTの電池寿命（クリアで獲得）" aria-label="未獲得カード（IoTの電池寿命）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：IoTの電池寿命（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：データ量と通信頻度（クリアで獲得..." aria-label="未獲得カード（データ量と通信頻度）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：データ量と通信頻度（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：設置場所の実務（クリアで獲得）" aria-label="未獲得カード（設置場所の実務）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：設置場所の実務（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナの向き（クリアで獲得）" aria-label="未獲得カード（アンテナの向き）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナの向き（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：技適マーク（クリアで獲得）" aria-label="未獲得カード（技適マーク）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：技適マーク（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：外部アンテナの活用（クリアで獲得..." aria-label="未獲得カード（外部アンテナの活用）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：外部アンテナの活用（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ゲートウェイの置き場所（クリアで..." aria-label="未獲得カード（ゲートウェイの置き場所）。..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ゲートウェイの置き場所（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：IoTの切り分け（クリアで獲得）" aria-label="未獲得カード（IoTの切り分け）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：IoTの切り分け（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：IoTの総コスト（クリアで獲得）" aria-label="未獲得カード（IoTの総コスト）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：IoTの総コスト（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(15) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：可用率（クリアで獲得）" aria-label="未獲得カード（可用率）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：可用率（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：SLA（クリアで獲得）" aria-label="未獲得カード（SLA）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：SLA（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：マージン（クリアで獲得）" aria-label="未獲得カード（マージン）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：マージン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：プリセット（クリアで獲得）" aria-label="未獲得カード（プリセット）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：プリセット（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：警告バナー（クリアで獲得）" aria-label="未獲得カード（警告バナー）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：警告バナー（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：共有リンク（クリアで獲得）" aria-label="未獲得カード（共有リンク）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：共有リンク（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：滝グラフ（クリアで獲得）" aria-label="未獲得カード（滝グラフ）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：滝グラフ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ゲージ（クリアで獲得）" aria-label="未獲得カード（ゲージ）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ゲージ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナ高（クリアで獲得）" aria-label="未獲得カード（アンテナ高）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナ高（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：送信側アンテナ高（クリアで獲得）" aria-label="未獲得カード（送信側アンテナ高）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：送信側アンテナ高（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(16) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：受信側アンテナ高（クリアで獲得）" aria-label="未獲得カード（受信側アンテナ高）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：受信側アンテナ高（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：地面近接損失（クリアで獲得）" aria-label="未獲得カード（地面近接損失）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：地面近接損失（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：筐体（クリアで獲得）" aria-label="未獲得カード（筐体）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：筐体（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：レドーム（クリアで獲得）" aria-label="未獲得カード（レドーム）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：レドーム（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：誘電体（クリアで獲得）" aria-label="未獲得カード（誘電体）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：誘電体（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：誘電率（クリアで獲得）" aria-label="未獲得カード（誘電率）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：誘電率（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：マイクロストリップ線路（クリアで..." aria-label="未獲得カード（マイクロストリップ線路）。..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：マイクロストリップ線路（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：特性インピーダンス（クリアで獲得..." aria-label="未獲得カード（特性インピーダンス）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：特性インピーダンス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：電気長（クリアで獲得）" aria-label="未獲得カード（電気長）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：電気長（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：短縮率（クリアで獲得）" aria-label="未獲得カード（短縮率）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：短縮率（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(17) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ビア（クリアで獲得）" aria-label="未獲得カード（ビア）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ビア（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ビアフェンス（クリアで獲得）" aria-label="未獲得カード（ビアフェンス）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ビアフェンス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：シールド（クリアで獲得）" aria-label="未獲得カード（シールド）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：シールド（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：EMC（クリアで獲得）" aria-label="未獲得カード（EMC）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：EMC（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：EMI（クリアで獲得）" aria-label="未獲得カード（EMI）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：EMI（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：不要放射（クリアで獲得）" aria-label="未獲得カード（不要放射）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：不要放射（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：スプリアス（クリアで獲得）" aria-label="未獲得カード（スプリアス）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：スプリアス（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：高調波（クリアで獲得）" aria-label="未獲得カード（高調波）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：高調波（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：相互変調（クリアで獲得）" aria-label="未獲得カード（相互変調）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：相互変調（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：PIM（クリアで獲得）" aria-label="未獲得カード（PIM）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：PIM（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(18) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナチューナ（クリアで獲得）" aria-label="未獲得カード（アンテナチューナ）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナチューナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：共振（クリアで獲得）" aria-label="未獲得カード（共振）。問題へ進んで獲得す..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：共振（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナ帯域（クリアで獲得）" aria-label="未獲得カード（アンテナ帯域）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナ帯域（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナ効率（クリアで獲得）" aria-label="未獲得カード（アンテナ効率）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナ効率（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナ材料（クリアで獲得）" aria-label="未獲得カード（アンテナ材料）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナ材料（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：周波数とサイズ（クリアで獲得）" aria-label="未獲得カード（周波数とサイズ）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：周波数とサイズ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：920MHzのサイズ感（クリアで..." aria-label="未獲得カード（920MHzのサイズ感）。..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：920MHzのサイズ感（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：IoTアンテナ種類（クリアで獲得..." aria-label="未獲得カード（IoTアンテナ種類）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：IoTアンテナ種類（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：FPCアンテナ（クリアで獲得）" aria-label="未獲得カード（FPCアンテナ）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：FPCアンテナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：PCBアンテナ（クリアで獲得）" aria-label="未獲得カード（PCBアンテナ）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：PCBアンテナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(19) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：板金アンテナ（クリアで獲得）" aria-label="未獲得カード（板金アンテナ）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：板金アンテナ（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：アンテナ小型化（クリアで獲得）" aria-label="未獲得カード（アンテナ小型化）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：アンテナ小型化（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：GND活用（クリアで獲得）" aria-label="未獲得カード（GND活用）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：GND活用（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：放射効率と利得（クリアで獲得）" aria-label="未獲得カード（放射効率と利得）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：放射効率と利得（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：放射効率dB（クリアで獲得）" aria-label="未獲得カード（放射効率dB）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：放射効率dB（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：VSWRの単位（クリアで獲得）" aria-label="未獲得カード（VSWRの単位）。問題へ進..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：VSWRの単位（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ケーブルとVSWR（クリアで獲得..." aria-label="未獲得カード（ケーブルとVSWR）。問題..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ケーブルとVSWR（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ケーブル付きアンテナ設置（クリア..." aria-label="未獲得カード（ケーブル付きアンテナ設置）..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ケーブル付きアンテナ設置（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：金属筐体近接（クリアで獲得）" aria-label="未獲得カード（金属筐体近接）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：金属筐体近接（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：IP67（クリアで獲得）" aria-label="未獲得カード（IP67）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：IP67（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/<!-- -->10</p>
  ```
  - セレクタ: `[".p-3.border-slate-100:nth-child(20) > .justify-between.gap-2.flex > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：ホイップλ/2・λ/4（クリアで..." aria-label="未獲得カード（ホイップλ/2・λ/4）。..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：ホイップλ/2・λ/4（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：平面型反射板（クリアで獲得）" aria-label="未獲得カード（平面型反射板）。問題へ進ん..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：平面型反射板（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：実現利得（クリアで獲得）" aria-label="未獲得カード（実現利得）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：実現利得（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：OTA評価（クリアで獲得）" aria-label="未獲得カード（OTA評価）。問題へ進んで..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：OTA評価（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：電波暗室（クリアで獲得）" aria-label="未獲得カード（電波暗室）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：電波暗室（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：伝導試験（クリアで獲得）" aria-label="未獲得カード（伝導試験）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：伝導試験（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：放射試験（クリアで獲得）" aria-label="未獲得カード（放射試験）。問題へ進んで獲..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：放射試験（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：TRP（クリアで獲得）" aria-label="未獲得カード（TRP）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：TRP（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：TIS（クリアで獲得）" aria-label="未獲得カード（TIS）。問題へ進んで獲得..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：TIS（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <button type="button" title="未獲得：3D放射パターン（クリアで獲得）" aria-label="未獲得カード（3D放射パターン）。問題へ..." class="inline-flex items-ce...">
  ```
  - セレクタ: `["button[title=\"未獲得：3D放射パターン（クリアで獲得）\"]"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">学ぶ領域</p>
  ```
  - セレクタ: `[".mt-4.grid.gap-2 > .p-3:nth-child(1) > p:nth-child(1)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">メーカー視点</p>
  ```
  - セレクタ: `[".mt-4.grid.gap-2 > .p-3:nth-child(2) > p:nth-child(1)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">確認資料</p>
  ```
  - セレクタ: `[".mt-4.grid.gap-2 > .p-3:nth-child(3) > p:nth-child(1)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">到達点</p>
  ```
  - セレクタ: `[".p-3:nth-child(4) > p:nth-child(1)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <span class="text-xs font-semibold text-slate-400">20<!-- -->章×10問</span>
  ```
  - セレクタ: `[".font-semibold.text-slate-400"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(1) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(2) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(3) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(4) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(5) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(6) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(7) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(8) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(9) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(10) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(11) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(12) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(13) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(14) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(15) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(16) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(17) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(18) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(19) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-[11px] font-bold text-slate-400">0<!-- -->/10</p>
  ```
  - セレクタ: `[".p-2.border-slate-100:nth-child(20) > .px-1.justify-between.gap-2 > p:nth-child(2)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.45 (foreground color: #94a3b8, background color: #f8fafc, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <p class="text-xs font-bold text-slate-400">第<!-- -->1<!-- -->章 <!-- -->電波と単位の基礎<!-- --> / STAGE <!-- -->1<!-- --> <!-- -->・通常戦</p>
  ```
  - セレクタ: `[".items-start.gap-3.flex-wrap > div:nth-child(1) > p:nth-child(1)"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".mt-10"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [frequency-wavelength](file:///tools/frequency-wavelength/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <span class="block text-xs text-slate-400">基準（短縮なし）</span>
  ```
  - セレクタ: `[".align-top:nth-child(1) > .pr-3 > .text-slate-400.block.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="block text-xs text-slate-400">低損失・ケーブル誘電体</span>
  ```
  - セレクタ: `[".align-top:nth-child(2) > .pr-3 > .text-slate-400.block.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="block text-xs text-slate-400">一般的なプリント基板</span>
  ```
  - セレクタ: `[".align-top:nth-child(3) > .pr-3 > .text-slate-400.block.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="block text-xs text-slate-400">セラミック基板</span>
  ```
  - セレクタ: `[".align-top:nth-child(4) > .pr-3 > .text-slate-400.block.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="block text-xs text-slate-400">チップアンテナ材</span>
  ```
  - セレクタ: `[".align-top:nth-child(5) > .pr-3 > .text-slate-400.block.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <span class="block text-xs text-slate-400">小型チップアンテナ材</span>
  ```
  - セレクタ: `[".align-top:nth-child(6) > .pr-3 > .text-slate-400.block.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".pt-6"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [dbm-converter](file:///tools/dbm-converter/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <p class="mt-2 text-xs text-slate-500">次は +10dB = 10倍</p>
  ```
  - セレクタ: `[".border-staf > .mt-2.text-slate-500.text-xs"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.14 (foreground color: #64748b, background color: #e6f1f8, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [db-feel](file:///tools/db-feel/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <p class="mt-1 text-xs leading-relaxed text-slate-500">+10dBで10倍、+3dBで約2倍</p>
  ```
  - セレクタ: `[".bg-staf-light.p-4.rounded-lg > .mt-1.text-left > .mt-1.text-slate-500.leading-relaxed"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 4.25 (foreground color: #64748b, background color: #e8f4fc, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".pt-6"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [vswr-return-loss](file:///tools/vswr-return-loss/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [coaxial-cable-loss](file:///tools/coaxial-cable-loss/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [microstrip-line](file:///tools/microstrip-line/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [effective-aperture](file:///tools/effective-aperture/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [aperture-gain-beamwidth](file:///tools/aperture-gain-beamwidth/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [antenna-spacing](file:///tools/antenna-spacing/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [array-grating-lobe](file:///tools/array-grating-lobe/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [patch-antenna-dimensions](file:///tools/patch-antenna-dimensions/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [small-loop-resonance](file:///tools/small-loop-resonance/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [radiation-resistance](file:///tools/radiation-resistance/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [small-antenna-limit](file:///tools/small-antenna-limit/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [large-array-near-field](file:///tools/large-array-near-field/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

### [reflector-ris-size-effect](file:///tools/reflector-ris-size-effect/) (1件の重大違反)

#### 🔴 [SERIOUS] color-contrast: Elements must meet minimum color contrast ratio thresholds
- **説明**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **詳細リンク**: [https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright](https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright)
- **対象要素**:
  ```html
  <div class="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</div>
  ```
  - セレクタ: `[".border-slate-100"]`
  - 修正要約: Fix any of the following:
  Element has insufficient color contrast of 2.56 (foreground color: #94a3b8, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

---

