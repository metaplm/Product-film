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
  // Bar 1: the mark draws itself, the wordmark lands on sixteenths.
  open: { hex: b(1, 1, 0.1), check: b(1, 2), fill: b(1, 3), word: b(1, 2), out: b(2) - 0.2 },
  // Bar 2: punchline.
  punch1: { words: [b(2, 1), b(2, 2), b(2, 3), b(2, 4)], out: b(3) - 0.12 },
  // Bars 3 to 5: automated rule check.
  window1: { in: b(3), out: b(8) - 0.12 },
  run: { click: b(3, 4), done: b(5, 3) },
  rules: [b(4, 1), b(4, 2), b(4, 3), b(4, 4), b(5, 1), b(5, 2)],
  openIssue: b(5, 4),
  // Bars 6 and 7: the issue in detail, the suggested fix.
  detail: { in: b(6), facts: b(6, 2), fixWords: b(6, 3), apply: b(7, 2), fixed: b(7, 3) },
  // Bar 8: punchline.
  punch2: { words: [b(8, 1), b(8, 2), b(8, 3)], out: b(9) - 0.12 },
  // Bars 9 and 10: compliance report.
  window2: { in: b(9), out: b(13) - 0.12 },
  score: { from: b(9, 1, 0.5), to: b(9, 4), bars: [b(9, 3), b(9, 4), b(10, 1), b(10, 2)], export: b(10, 3), exported: b(10, 4) },
  // Bars 11 and 12: release route, human approval, released on the strongest beat.
  route: { in: b(11), send: b(11, 2), sent: b(11, 3), approved: b(12, 1), released: b(12, 3) },
  // Bars 13 and 14: the promise, then the lockup.
  punch3: { words: [b(13, 1), b(13, 2), b(13, 3)], out: b(14) - 0.12 },
  close: { hex: b(14, 1), check: b(14, 2), fill: b(14, 3), word: b(14, 1, 0.5) },
  // Bar 15: the loop folds back to the empty first frame.
  fold: { word: b(15, 1), fill: b(15, 2), check: b(15, 3), hex: b(15, 3, 0.5), end: DURATION - 0.1 },
} as const;
