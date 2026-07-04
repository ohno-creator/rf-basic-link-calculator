// UIの意味トーンを、Reactコンポーネントへ依存しない下位層で共有する。
// src/lib/** から src/components/** への逆向き依存を作らないための型定義。
export type CalloutTone = "success" | "info" | "caution" | "warning" | "danger" | "neutral";

export type StatTone = "staf" | "sky" | "emerald" | "rose" | "amber" | "neutral";
