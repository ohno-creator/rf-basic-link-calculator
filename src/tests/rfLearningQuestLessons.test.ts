import { describe, expect, it } from "vitest";
import { questModes, rfQuestLessons } from "@/data/rfLearningQuestLessons";

describe("RF learning quest lessons", () => {
  it("contains exactly 700 lessons across the six modes", () => {
    expect(rfQuestLessons).toHaveLength(700);

    for (const mode of questModes) {
      const lessons = rfQuestLessons.filter((lesson) => lesson.mode === mode.id);
      const expectedLength = mode.id === "intro" ? 200 : 100;
      expect(lessons).toHaveLength(expectedLength);
      expect(lessons.map((lesson) => lesson.stage)).toEqual(Array.from({ length: expectedLength }, (_, index) => index + 1));
    }
  });

  it("has unique ids and valid answer indexes", () => {
    const ids = new Set(rfQuestLessons.map((lesson) => lesson.id));
    expect(ids.size).toBe(rfQuestLessons.length);

    for (const lesson of rfQuestLessons) {
      expect(lesson.choices.length).toBeGreaterThanOrEqual(4);
      expect(new Set(lesson.choices).size).toBe(lesson.choices.length);
      expect(lesson.correctIndex).toBeGreaterThanOrEqual(0);
      expect(lesson.correctIndex).toBeLessThan(lesson.choices.length);
      expect(lesson.appLink.href).toMatch(/^\/tools\//);
    }
  });

  it("keeps distractors varied and avoids unsafe absolutes in correct choices", () => {
    const unsafeAbsolutePattern = /必ず|絶対|永久|完全|無限|常に/;
    const guardedExpressionPattern = /とは限|ではない|正しくない|できない|候補|場合|参考|注意|必要|慎重/;

    for (const lesson of rfQuestLessons) {
      const correctChoice = lesson.choices[lesson.correctIndex];
      expect(unsafeAbsolutePattern.test(correctChoice) && !guardedExpressionPattern.test(correctChoice)).toBe(false);
    }

    for (const mode of questModes.filter((mode) => mode.id !== "intro")) {
      const fourthChoices = rfQuestLessons
        .filter((lesson) => lesson.mode === mode.id && lesson.choices.length === 4)
        .map((lesson) => lesson.choices[3]);
      expect(new Set(fourthChoices).size).toBeGreaterThanOrEqual(8);
    }
  });

  it("adds explanatory term notes to the intro mode lessons", () => {
    const introLessons = rfQuestLessons.filter((lesson) => lesson.mode === "intro");
    expect(introLessons.every((lesson) => lesson.question.includes("用語メモ："))).toBe(true);
  });

  it("includes STAF media backed antenna basics in the intro mode", () => {
    const stafMediaIntroLessons = rfQuestLessons.filter(
      (lesson) => lesson.mode === "intro" && lesson.sources?.some((source) => source.href.includes("staf.co.jp/media"))
    );

    expect(stafMediaIntroLessons.length).toBeGreaterThanOrEqual(12);
    expect(stafMediaIntroLessons.map((lesson) => lesson.id)).toContain("intro-staf-cable-install");
    expect(stafMediaIntroLessons.map((lesson) => lesson.id)).toContain("intro-staf-efficiency-vs-gain");
    expect(stafMediaIntroLessons.map((lesson) => lesson.id)).toContain("intro-staf-vswr-unitless");
  });

  it("adds source links to the researcher mode lessons", () => {
    const researcherLessons = rfQuestLessons.filter((lesson) => lesson.mode === "researcher");
    expect(researcherLessons.every((lesson) => lesson.sources?.length)).toBe(true);
  });
});
