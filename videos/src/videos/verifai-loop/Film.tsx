import { AbsoluteFill } from "remotion";

import { cursorAt, UserCursor, type CursorKey } from "../../kit/cursor";
import { TargetLog } from "../../kit/debug";
import { Punchlines, type Card } from "../../kit/punchlines";
import { clamp01, useTime } from "../../kit/time";
import { color, font } from "../../tokens";
import { ChangeAction } from "./acts/ChangeAction";
import { Inspection } from "./acts/Inspection";
import { Lockup } from "./acts/Lockup";
import { Report } from "./acts/Report";
import { RouteTask, reject, taskBox } from "./acts/RouteTask";
import { b, cue } from "./cues";

export type FilmProps = { fps: number; debug: boolean };

const cards: Card[] = [
  {
    lines: [
      [{ text: "Every", at: cue.punch1.words[0] }, { text: "drawing.", at: cue.punch1.words[1] }],
      [{ text: "Every", at: cue.punch1.words[2] }, { text: "3D model.", at: cue.punch1.words[3], accent: true }],
    ],
    out: cue.punch1.out,
    y: 540,
    size: 150,
  },
  {
    lines: [[{ text: "Checked", at: cue.punch2.words[0] }, { text: "in", at: cue.punch2.words[1] }, { text: "minutes.", at: cue.punch2.words[2], accent: true }]],
    out: cue.punch2.out,
    y: 540,
    size: 150,
  },
  {
    lines: [
      [{ text: "Caught", at: cue.punch3.words[0] }, { text: "before", at: cue.punch3.words[1] }],
      [{ text: "production.", at: cue.punch3.words[2], accent: true }],
    ],
    out: cue.punch3.out,
    y: 540,
    size: 150,
  },
];

// The user's cursor appears once: the engineer's decision. VerifAI itself needs no cursor.
const cursorKeys: CursorKey[] = [
  { t: b(11, 2), x: 1560, y: 1000 },
  // Click the button's right end, so its label stays readable.
  { t: cue.task.reject, x: reject.x + reject.w - 34, y: reject.y + reject.h / 2 + 6, click: true },
  { t: b(12, 3), x: taskBox.x + 700, y: taskBox.y + 740 },
];
const cursorShown = (t: number) => Math.min(clamp01((t - b(11, 2)) / 0.2), 1 - clamp01((t - cue.task.out) / 0.12));

export function VerifaiLoop({ debug }: FilmProps) {
  const t = useTime();
  const cursor = cursorAt(t, cursorKeys, (x, y) => ({ x, y }));
  const shown = cursorShown(t);
  return (
    <AbsoluteFill style={{ background: color.bg, fontFamily: font.sans, color: color.onBg }}>
      <ChangeAction t={t} />
      <Inspection t={t} />
      <RouteTask t={t} />
      <Report t={t} />
      <Lockup t={t} />
      <Punchlines t={t} cards={cards} theme={{ font: font.sans, color: color.onBg, accent: color.brandLight, weight: 600 }} />
      {shown > 0 ? (
        <div style={{ opacity: shown }}>
          <UserCursor x={cursor.x} y={cursor.y} squash={cursor.squash} />
        </div>
      ) : null}
      {debug ? <TargetLog /> : null}
    </AbsoluteFill>
  );
}
