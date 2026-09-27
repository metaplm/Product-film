import { Easing, Img, staticFile } from "remotion";

import { progress } from "../../../kit/time";
import { color } from "../../../tokens";
import { cue } from "../cues";
import { Mark, Wordmark } from "../ui/Mark";

const ease = Easing.inOut(Easing.cubic);
const land = Easing.bezier(0.22, 1, 0.36, 1);
const slam = Easing.bezier(0.2, 0.6, 0.35, 1);

/** The mark's box in the lockup, measured from a still (mark 150 px, left of the wordmark). */
const MARK = { x: 0, y: 0, size: 190 }; // measured below, see MARK_AT
const S = MARK.size / 64;
/** Where the flex layout puts the mark (top-left), measured with a --debug still. */
const MARK_AT = { x: 516, y: 385 };
/** The four corner blocks (logo paths, 64 units) with the anchor that flies to a frame corner. */
const BLOCKS = [
  { d: "M2 22 V2 H22 V9 H9 V22 Z", ax: 2, ay: 2, fx: -60, fy: -60 },
  { d: "M62 22 V2 H42 V9 H55 V22 Z", ax: 62, ay: 2, fx: 1980, fy: -60 },
  { d: "M2 42 V62 H22 V55 H9 V42 Z", ax: 2, ay: 62, fx: -60, fy: 1140 },
  { d: "M62 42 V62 H42 V55 H55 V42 Z", ax: 62, ay: 62, fx: 1980, fy: 1140 },
];

/**
 * The lockup. The mark's corner blocks fly in from outside the frame, large,
 * and slam onto the mark (the hook, with a hit on the score); the check draws;
 * the wordmark lands. In bar 15 they fly back out, so the loop ends on the bare grid.
 */
export function Lockup({ t }: { t: number }) {
  const { open, close, fold } = cue;
  let appear = 0; // blocks visible
  let travel = 0; // 0 at the frame corners, 1 on the mark
  let check = 0;
  let shown = (_: number) => 0;
  let by = 0;
  let blurOut = 0;

  if (t < open.out + 0.2) {
    appear = progress(t, open.corners[0], 0.12);
    travel = slam(progress(t, open.corners[0], 0.45));
    check = ease(progress(t, open.check, 0.3));
    shown = (i) => land(progress(t, open.word + i * open.step, 0.3));
    blurOut = progress(t, open.out, 0.2);
  } else if (t >= close.corners[0]) {
    appear = progress(t, close.corners[0], 0.12) * (1 - progress(t, fold.corners + 0.25, 0.12));
    travel = slam(progress(t, close.corners[0], 0.5)) * (1 - Easing.in(Easing.cubic)(progress(t, fold.corners, 0.35)));
    check = ease(progress(t, close.check, 0.3)) - ease(progress(t, fold.check, 0.3));
    const gone = (i: number) => progress(t, fold.word + (6 - i) * 0.0625, 0.18);
    shown = (i) => land(progress(t, close.word + i * close.step, 0.3)) * (1 - gone(i));
    by = land(progress(t, close.by, 0.35)) * (1 - progress(t, fold.by, 0.2));
  } else return null;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - blurOut, filter: blurOut > 0 ? `blur(${blurOut * 12}px)` : undefined }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div data-target="mark">
            <Mark size={MARK.size} corners={[0, 0, 0, 0]} check={check} />
          </div>
          <Wordmark size={214} shown={shown} />
        </div>
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 18, opacity: by, filter: by < 1 ? `blur(${(1 - by) * 10}px)` : undefined, translate: `0 ${(1 - by) * 16}px` }}>
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 30, color: color.onBgMuted }}>by</span>
          <Img src={staticFile("brand/metaplm_logo_white.png")} style={{ height: 64 }} />
        </div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {BLOCKS.map((block, index) => {
          const tx = MARK_AT.x + block.ax * S;
          const ty = MARK_AT.y + block.ay * S;
          const x = block.fx + (tx - block.fx) * travel;
          const y = block.fy + (ty - block.fy) * travel;
          const k = S * (1 + 2.2 * (1 - travel));
          return <path key={index} d={block.d} fill={color.brandLight} opacity={appear} transform={`translate(${x - block.ax * k} ${y - block.ay * k}) scale(${k})`} />;
        })}
      </svg>
    </div>
  );
}
