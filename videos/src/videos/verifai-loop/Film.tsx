import { AbsoluteFill } from "remotion";

import { cursorAt, UserCursor, type CursorKey } from "../../kit/cursor";
import { TargetLog } from "../../kit/debug";
import { Punchlines, type Card } from "../../kit/punchlines";
import { clamp01, useTime } from "../../kit/time";
import { color, font } from "../../tokens";
import { Lockup } from "./acts/Lockup";
import { Report, exportButton } from "./acts/Report";
import { Route, sendButton } from "./acts/Route";
import { RuleCheck, runButton } from "./acts/RuleCheck";
import { Window } from "./acts/Window";
import { b, cue } from "./cues";
import { apply, centerOf, rowY, rows } from "./layout";

export type FilmProps = { fps: number; debug: boolean };

const cards: Card[] = [
  {
    lines: [
      [{ text: "Every", at: cue.punch1.words[0] }, { text: "part.", at: cue.punch1.words[1] }],
      [{ text: "Every", at: cue.punch1.words[2] }, { text: "rule.", at: cue.punch1.words[3], accent: true }],
    ],
    out: cue.punch1.out,
    y: 540,
    size: 150,
  },
  {
    lines: [[{ text: "Compliance", at: cue.punch2.words[0] }, { text: "at a", at: cue.punch2.words[1] }, { text: "glance.", at: cue.punch2.words[2], accent: true }]],
    out: cue.punch2.out,
    y: 540,
    size: 140,
  },
  {
    lines: [[{ text: "Verified", at: cue.punch3.words[0], accent: true }, { text: "before", at: cue.punch3.words[1] }, { text: "release.", at: cue.punch3.words[2] }]],
    out: cue.punch3.out,
    y: 540,
    size: 150,
  },
];

const cursorKeys: CursorKey[] = [
  { t: b(3, 1), x: 1700, y: 640 },
  { t: cue.run.click, ...centerOf(runButton), click: true },
  { t: b(4, 3), x: 1660, y: 300 },
  // Click the failed row in its empty middle, away from its words.
  { t: cue.openIssue, x: 1180, y: rowY(3) + rows.h / 2, click: true },
  { t: b(6, 3), x: 1010, y: 930 },
  // Click the button's right end, so the label stays readable.
  { t: cue.detail.apply, x: apply.x + apply.w - 26, y: apply.y + apply.h / 2 + 4, click: true },
  { t: b(7, 4), x: 1060, y: 950 },
  { t: b(9, 3), x: 1660, y: 990 },
  { t: cue.score.export, ...centerOf(exportButton), click: true },
  { t: b(11, 1), x: 1660, y: 320 },
  { t: cue.route.send, ...centerOf(sendButton), click: true },
  { t: b(11, 4), x: 1600, y: 330 },
];
const cursorShown = (t: number) =>
  Math.min(clamp01((t - b(3, 2)) / 0.2), 1 - clamp01((t - cue.window1.out) / 0.12)) +
  Math.min(clamp01((t - b(9, 3)) / 0.2), 1 - clamp01((t - cue.window2.out) / 0.12));

export function VerifaiLoop({ debug }: FilmProps) {
  const t = useTime();
  const cursor = cursorAt(t, cursorKeys, (x, y) => ({ x, y }));
  const shown = clamp01(cursorShown(t));
  return (
    <AbsoluteFill style={{ background: color.bg, fontFamily: font.sans, color: color.fg }}>
      <Window t={t} from={cue.window1.in} to={cue.window1.out}>
        <RuleCheck t={t} />
      </Window>
      <Window t={t} from={cue.window2.in} to={cue.window2.out}>
        <Report t={t} to={cue.route.in - 0.12} />
        <Route t={t} to={cue.window2.out} />
      </Window>
      <Lockup t={t} />
      <Punchlines t={t} cards={cards} theme={{ font: font.sans, color: color.fg, accent: color.accent, weight: 600 }} />
      {shown > 0 ? (
        <div style={{ opacity: shown }}>
          <UserCursor x={cursor.x} y={cursor.y} squash={cursor.squash} />
        </div>
      ) : null}
      {debug ? <TargetLog /> : null}
    </AbsoluteFill>
  );
}
