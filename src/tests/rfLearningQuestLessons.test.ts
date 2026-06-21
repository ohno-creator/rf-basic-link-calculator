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

  it("adds explanatory term notes to the intro mode lessons", () => {
    const introLessons = rfQuestLessons.filter((lesson) => lesson.mode === "intro");
    expect(introLessons.every((lesson) => lesson.question.includes("用語メモ："))).toBe(true);
  });

  it("adds source links to the researcher mode lessons", () => {
    const researcherLessons = rfQuestLessons.filter((lesson) => lesson.mode === "researcher");
    expect(researcherLessons.every((lesson) => lesson.sources?.length)).toBe(true);
  });
});
