# 公開完了記録（2026-09-14）

ユーザーの「公開して」により、実装済みの共通UI刷新とA2比較ワークスペースを公開。

- 公開: https://ohno-creator.github.io/rf-basic-link-calculator/
- 比較: https://ohno-creator.github.io/rf-basic-link-calculator/tools/cable-position-comparison/
- アプリソース: c119439a3f0dbfe5bc88e98f430fed3cabc330f4
- gh-pages: 280d971af19dac7576a46b563f5ea995b560341c
- Actions: https://github.com/ohno-creator/rf-basic-link-calculator/actions/runs/34787426601 （success）
- Pages build: built、errorなし。

検証: lint/型（ローカル）、Vitest80ファイル768件、全体E2E130 passed + 2 flaky（再試行で合格）、Pages静的build、Production comparison E2E16/16合格。全体E2Eのflakyは radio wave intuition と patch HPBW。初回失敗の安定性課題を残すが、チェック削除/skipなしでworkflowは通過。

公開URL HTTP200、トップの比較リンク、新しいstudio/workbench/pin操作を確認。Chromeの公開版で説明例を固定し、変更後を3mから4mへ編集して基準1.8dBを保持、編集案2.4dB・追加損失1.8dBへ更新する実操作を確認した。

今回公開したのは実装済み範囲。全64ページの専門シミュレーター化、1枚資料、複数候補の永続保存等は未完了。ナミゲート販売HTMLの転用なし。元チェックアウトの未コミット作業を操作せず、独立release cloneから通常push・既存workflow_dispatchを使用した。
