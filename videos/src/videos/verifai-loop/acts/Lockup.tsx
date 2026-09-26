import { Easing } from "remotion";

import { progress } from "../../../kit/time";
import { cue } from "../cues";
import { Mark, Wordmark } from "../ui/Mark";

const ease = Easing.inOut(Easing.cubic);
const land = Easing.bezier(0.22, 1, 0.36, 1);

/** The logo lockup: draws itself in bar 1, again in bar 14, and un-draws in bar 15 so the loop folds to an empty frame. */
export function Lockup({ t }: { t: number }) {
  const { open, close, fold } = cue;
  let hex = 0, check = 0, fill = 0;
  let shown = (_: number) => 0;
  let blurOut = 0;

  if (t < open.out + 0.2) {
    hex = ease(progress(t, open.hex, 0.42));
    check = ease(progress(t, open.check, 0.3));
    fill = ease(progress(t, open.fill, 0.25));
    shown = (i) => land(progress(t, open.word + i * 0.125, 0.3));
    blurOut = progress(t, open.out, 0.2);
  } else if (t >= close.hex) {
    const gone = (i: number) => progress(t, fold.word + (6 - i) * 0.0625, 0.18);
    hex = ease(progress(t, close.hex, 0.42)) - ease(progress(t, fold.hex, 0.55));
    check = ease(progress(t, close.check, 0.3)) - ease(progress(t, fold.check, 0.3));
    fill = ease(progress(t, close.fill, 0.25)) - ease(progress(t, fold.fill, 0.3));
    shown = (i) => land(progress(t, close.word + i * 0.125, 0.3)) * (1 - gone(i));
  } else return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 44,
        opacity: 1 - blurOut,
        filter: blurOut > 0 ? `blur(${blurOut * 12}px)` : undefined,
      }}
    >
      <Mark size={156} hex={hex} check={check} fill={fill} />
      <Wordmark size={156} shown={shown} />
    </div>
  );
}
