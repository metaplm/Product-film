import { AbsoluteFill } from "remotion";

import { cursorAt, UserCursor, type CursorKey } from "../../kit/cursor";
import { TargetLog } from "../../kit/debug";
import { Punchlines, type Card } from "../../kit/punchlines";
import { clamp01, useTime } from "../../kit/time";
import { color, font } from "../../tokens";
import { Inspection } from "./acts/Inspection";
import { Lockup } from "./acts/Lockup";
import { Model3D } from "./acts/Model3D";
import { Report } from "./acts/Report";
import { RouteTask, reject, taskBox } from "./acts/RouteTask";
import { b, cue } from "./cues";
import { Blueprint, Hud } from "./ui/Blueprint";
import { Dimension, type Annotation } from "./ui/Dimension";

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

const notes: Annotation[] = [
  { at: cue.punch1.words[0], out: cue.punch1.out, spec: "SCOPE · CHANGE ACTION · 3 PRODUCTS · 2 DRAWINGS", specY: 318, value: "CA-00001445", y: 760, x1: 375, x2: 1543 },
  { at: cue.punch2.words[0], out: cue.punch2.out, spec: "BENCHMARK · 4 DRAWINGS · 76 CHECKS", specY: 398, value: "140 s / CHANGE ACTION", y: 668, x1: 227, x2: 1687 },
  { at: cue.punch3.words[0], out: cue.punch3.out, spec: "REPORT → ROUTE TASK · THE ENGINEER DECIDES", specY: 318, value: "BEFORE RELEASE", y: 760, x1: 375, x2: 1543 },
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
      <Blueprint />
      <Hud
        t={t}
        from={cue.model.in}
        to={cue.task.out}
        sections={[
          [cue.model.in, "01 / INTAKE · 3D MODEL"],
          [cue.inspect.in, "02 / 2D DRAWING"],
          [cue.punch2.words[0], "—"],
          [cue.report.in, "03 / REPORT"],
          [cue.task.comment, "04 / DECISION"],
        ]}
      />
      <Model3D t={t} />
      <Inspection t={t} />
      <RouteTask t={t} />
      <Report t={t} />
      <Lockup t={t} />
      {notes.map((note) => (
        <Dimension key={note.spec} t={t} a={note} />
      ))}
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
