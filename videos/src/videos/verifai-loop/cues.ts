import { at, type Grid } from "../../kit/time";

/**
 * The beat sheet as data. Silent film, so the grid is chosen, not measured:
 * 120 BPM, 4/4, 15 bars. A beat is 0.5 s, a bar 2 s, the film 30 s.
 * Scene code only reads times from here.
 */
export const grid: Grid = { bpm: 120, firstBeat: 0, pickupBeats: 0, beatsPerBar: 4 };
export const b = (bar: number, beat = 1, fraction = 0) => at(grid, bar, beat, fraction);
export const BARS = 15;
export const DURATION = b(BARS + 1);

export const cue = {
  // Bar 1: the corner blocks close in from the frame's corners onto the mark, the check draws, the wordmark lands.
  open: { corners: [b(1, 1, 0.1), b(1, 1, 0.1)], check: b(1, 2, 0.2), word: b(1, 2, 0.5), step: 0.08, out: b(2) - 0.2 },
  // Bar 2: punchline.
  punch1: { words: [b(2, 1), b(2, 2), b(2, 3), b(2, 3, 0.5)], out: b(3) - 0.12 },
  // Bars 3 and 4: the route task is picked up; the CATIA worker opens the 3D model.
  model: { in: b(3), lines: [b(3, 1, 0.25), b(3, 1, 0.75), b(3, 2, 0.25), b(3, 3), b(3, 4), b(4, 1), b(4, 2), b(4, 3), b(4, 4)], scan: b(4, 1), scanEnd: b(4, 3, 0.5), out: b(5) - 0.12 },
  // Bars 5 to 7: the drawing is read, the camera locks on each finding, the rules resolve one per beat.
  inspect: { in: b(5), scan: b(5, 1, 0.5), rules: [b(5, 3), b(5, 4), b(6, 1), b(6, 2), b(6, 3), b(6, 4), b(7, 1), b(7, 2)], focusNotes: b(6, 1, 0.4), focusTitle: b(6, 3, 0.4), back: b(7, 1, 0.2), authority: b(7, 3), out: b(8) - 0.12 },
  // Bar 8: punchline.
  punch2: { words: [b(8, 1), b(8, 2), b(8, 3)], out: b(9) - 0.12 },
  // Bars 9 and 10: the report.
  report: { in: b(9), count: b(9, 2), countEnd: b(9, 4), verdict: b(10, 1), actions: b(10, 2), shrink: b(10, 4) },
  // Bars 11 and 12: the engineer decides on the route task.
  task: { in: b(10, 4), comment: b(11, 1), decide: b(11, 4), reject: b(12, 1), returned: b(12, 2), out: b(13) - 0.12 },
  // Bar 13: the promise.
  punch3: { words: [b(13, 1), b(13, 2), b(13, 3)], out: b(14) - 0.12 },
  // Bar 14: the lockup, then "by MetaPLM".
  close: { corners: [b(14, 1), b(14, 1, 0.2)], check: b(14, 2, 0.5), word: b(14, 2), step: 0.125, by: b(14, 4) },
  // Bar 15: the loop folds back to the bare grid of the first frame.
  fold: { by: b(15, 1), word: b(15, 1, 0.5), check: b(15, 3), corners: b(15, 3, 0.5), end: DURATION - 0.1 },
} as const;
