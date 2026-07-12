# OTAエキスパートモード裏取り・受入報告書 (Antigravity acceptance)

**作成日**: 2026-07-12  
**検証担当**: Antigravity  
**検証ステータス**: ⏳ **検証・検算完了（実機受入待ち）**

---

## 1. 干渉源ハンター（高調波マップ）の物理検算

基板クロック高調波の該当 Band 受信（FDD DL / TDD）帯へのヒットロジックを独立に手計算し、物理仕様の妥当性を確認しました。

### 検算一覧 (5件)

1.  **クロック 26MHz (TCXO) x 36次**
    *   **高調波周波数**: $26 \times 36 = 936 \text{ MHz}$
    *   **対象 Band**: LTE Band 8 DL ($925 \sim 960 \text{ MHz}$)
    *   **判定**: $936 \text{ MHz}$ は Band 8 DL 帯域内。下限からのオフセット $+11 \text{ MHz}$。
    *   **結論**: 🟢 **ヒット (Band 8 DL 内)** - 妥当。
2.  **クロック 26MHz (TCXO) x 35次**
    *   **高調波周波数**: $26 \times 35 = 910 \text{ MHz}$
    *   **対象 Band**: LTE Band 8 DL ($925 \sim 960 \text{ MHz}$)
    *   **判定**: $910 \text{ MHz}$ は Band 8 UL ($880 \sim 915 \text{ MHz}$) 内であるが、受信帯 (DL) ではないため対象外。
    *   **結論**: 🟢 **ヒットなし (DL帯域外)** - 妥当。
3.  **クロック 48MHz (USB) x 45次**
    *   **高調波周波数**: $48 \times 45 = 2160 \text{ MHz}$
    *   **対象 Band**: LTE Band 1 DL ($2110 \sim 2170 \text{ MHz}$)
    *   **判定**: $2160 \text{ MHz}$ は Band 1 DL 帯域内。上限からのオフセット $-10 \text{ MHz}$。
    *   **結論**: 🟢 **ヒット (Band 1 DL 内)** - 妥当。
4.  **クロック 48MHz (USB) x 41次**
    *   **高調波周波数**: $48 \times 41 = 1968 \text{ MHz}$
    *   **対象 Band**: LTE Band 1 DL ($2110 \sim 2170 \text{ MHz}$)
    *   **判定**: $1968 \text{ MHz}$ は Band 1 UL ($1920 \sim 1980 \text{ MHz}$) 内であるが、受信帯 (DL) ではないため対象外。
    *   **結論**: 🟢 **ヒットなし (DL帯域外)** - 妥当。
5.  **クロック 133MHz (DDR) x 7次**
    *   **高調波周波数**: $133 \times 7 = 931 \text{ MHz}$
    *   **対象 Band**: LTE Band 8 DL ($925 \sim 960 \text{ MHz}$)
    *   **判定**: $931 \text{ MHz}$ は Band 8 DL 帯域内。下限からのオフセット $+6 \text{ MHz}$。
    *   **結論**: 🟢 **ヒット (Band 8 DL 内)** - 妥当。

---

## 2. 実機受入テスト ( acceptance )

※ Codex による機能実装完了後、E2E検証および実機キャプチャを行って追記します。
