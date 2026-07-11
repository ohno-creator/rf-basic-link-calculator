# モバイル表示における横はみ出し（overflow）の不具合報告と修正申し送り

## 概要
`track/rebaseline3` の CI（GitHub Actions）実行において、E2Eテストジョブが失敗しました。
原因は、モバイル表示（幅375px）のテストにおいて、アンテナ研究コラム（`Research Columns`）のテキストが横にはみ出し、横スクロールが発生したためです。

*   **失敗したテスト**: `e2e/tools.spec.ts` ➔ `research columns fit mobile and expose their sources`
*   **発生プラットフォーム**: Linux（GitHub Actions CI環境）。※macOSローカルでは標準フォントの文字幅の違いにより、たまたまはみ出さずにパスすることがあります。

---

## 原因箇所と詳細
以下の 3 つのコラムコンポーネント内にある長い数式、および英語の出典リンク・書籍タイトルにおいて、自動改行が行われず親要素（幅375px）を突き抜けて右側へはみ出しています。

### 1. `PatchAntennaColumn.tsx`
*   **ファイル**: `src/app/tools/_components/PatchAntennaColumn.tsx`
*   **はみ出し要素**:
    *   L47-49 の `details` 内の数式テキスト：
        `W = c₀/(2f₀)√(2/(εr+1))、εeff = (εr+1)/2 + (εr-1)/2·(1+12h/W)-1/2` や `ΔL = 0.412h·((εeff+0.3)(W/h+0.264))/((εeff-0.258)(W/h+0.8))`
    *   L56-59 の英語書籍タイトルおよび IEEE リンク：
        `C. A. Balanis, Antenna Theory: Analysis and Design, 4th ed., Sec. 14.2` や `Equations for Microstrip Circuit Design` など。

### 2. `RadiationResistanceColumn.tsx`
*   **ファイル**: `src/app/tools/_components/RadiationResistanceColumn.tsx`
*   **はみ出し要素**:
    *   L47-49 の `details` 内の数式テキスト：
        `Rr ≈ 20π²(l/λ)²、完全導体の無限地板上に立つモノポール高さ h に対して Rr ≈ 40π²(h/λ)²` などの長い1行。
    *   L56-60 の書籍タイトル等：
        `W. L. Stutzman & G. A. Thiele, Antenna Theory and Design, 3rd ed., Sec. 2.6`

### 3. `SmallAntennaLimitColumn.tsx`
*   **ファイル**: `src/app/tools/_components/SmallAntennaLimitColumn.tsx`
*   **はみ出し要素**:
    *   L53-56 の `details` 内の数式：
        `Qmin = 1/(ka)³ + 1/(ka)、粗い比帯域上限を FBW ≈ 1/Qmin とする。`
    *   L63-65 の長い外部リンクおよび書籍名。

---

## 修正内容
各コラムコンポーネントの `details` 内のテキスト要素、および数式テキストを含む親 `div` に対して、折り返しを強制する Tailwind CSS クラス `break-words` を追加し、テストがパスすることを確認しました。

### 修正箇所例
```diff
- <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
+ <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80 break-words">
```
