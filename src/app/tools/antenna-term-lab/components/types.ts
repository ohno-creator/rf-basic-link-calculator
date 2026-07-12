"use client";

export type TermCategoryId = "physics" | "parameters" | "matching" | "deployment";

export type TermMeta = {
  id: string;
  title: string;
  category: TermCategoryId;
  navLabel: string;
  description: string;
};
