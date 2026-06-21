import { describe, expect, it } from "vitest";
import { questModes, rfQuestLessons } from "@/data/rfLearningQuestLessons";

describe("RF learning quest lessons", () => {
  it("contains exactly 100 lessons for each mode", () => {
    expect(rfQuestLessons).toHaveLength(500);

    for (const mode of questModes) {
      const lessons = rfQuestLessons.filter((lesson) => lesson.mode === mode.id);
      expect(lessons).toHaveLength(100);
      expect(lessons.map((lesson) => lesson.stage)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
    }
  });

  it("has unique ids and valid answer indexes", () => {
    const ids = new Set(rfQuestLessons.map((lesson) => lesson.id));
    expect(ids.size).toBe(rfQuestLessons.length);

    for (const lesson of rfQuestLessons) {
      expect(lesson.choices.length).toBeGreaterThanOrEqual(3);
      expect(lesson.correctIndex).toBeGreaterThanOrEqual(0);
      expect(lesson.correctIndex).toBeLessThan(lesson.choices.length);
      expect(lesson.appLink.href).toMatch(/^\/tools\//);
    }
  });

  it("adds source links to the researcher mode lessons", () => {
    const researcherLessons = rfQuestLessons.filter((lesson) => lesson.mode === "researcher");
    expect(researcherLessons.every((lesson) => lesson.sources?.length)).toBe(true);
  });
});
