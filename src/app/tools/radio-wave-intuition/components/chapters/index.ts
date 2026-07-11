import type { IntuitionChapter } from "./types";
import { Chapter1Wave, chapter1WaveMeta } from "./Chapter1Wave";
import { Chapter2Decibel, chapter2DecibelMeta } from "./Chapter2Decibel";
import { Chapter3Spread, chapter3SpreadMeta } from "./Chapter3Spread";
import { Chapter4Antenna, chapter4AntennaMeta } from "./Chapter4Antenna";
import { Chapter5Obstacle, chapter5ObstacleMeta } from "./Chapter5Obstacle";
import { Chapter6Noise, chapter6NoiseMeta } from "./Chapter6Noise";

/** 「感覚でわかる電波」全章。orderの昇順で表示される。 */
export const chapters: IntuitionChapter[] = [
  { meta: chapter1WaveMeta, Component: Chapter1Wave },
  { meta: chapter2DecibelMeta, Component: Chapter2Decibel },
  { meta: chapter3SpreadMeta, Component: Chapter3Spread },
  { meta: chapter4AntennaMeta, Component: Chapter4Antenna },
  { meta: chapter5ObstacleMeta, Component: Chapter5Obstacle },
  { meta: chapter6NoiseMeta, Component: Chapter6Noise }
];
