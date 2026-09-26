import { Easing, Img, staticFile } from "remotion";

import { progress } from "../../../kit/time";
import { cue } from "../cues";
import { Mark, Wordmark } from "../ui/Mark";

const ease = Easing.inOut(Easing.cubic);
const land = Easing.bezier(0.22, 1, 0.36, 1);
const snap = Easing.bezier(0.3, 0, 0.1, 1);

/** The logo lockup: builds in bar 1, again in bar 14 with "by MetaPLM", and folds away in bar 15 so the loop returns to an empty frame. */
export function Lockup({ t }: { t: number }) {
  const { open, close, fold } = cue;
  let corners = [0, 0, 0, 0];
  let check = 0;
  let shown = (_: number) => 0;
  let by = 0;
  let blurOut = 0;

  if (t < open.out + 0.2) {
    corners = open.corners.map((at) => snap(progress(t, at, 0.3)));
    check = ease(progress(t, open.check, 0.3));
    shown = (i) => land(progress(t, open.word + i * 0.125, 0.3));
    blurOut = progress(t, open.out, 0.2);
  } else if (t >= close.corners[0]) {
    const cornersOut = ease(progress(t, fold.corners, 0.4));
    corners = close.corners.map((at) => snap(progress(t, at, 0.3)) * (1 - cornersOut));
    check = ease(progress(t, close.check, 0.3)) - ease(progress(t, fold.check, 0.3));
    const gone = (i: number) => progress(t, fold.word + (6 - i) * 0.0625, 0.18);
    shown = (i) => land(progress(t, close.word + i * 0.125, 0.3)) * (1 - gone(i));
    by = land(progress(t, close.by, 0.35)) * (1 - progress(t, fold.by, 0.2));
  } else return null;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, opacity: 1 - blurOut, filter: blurOut > 0 ? `blur(${blurOut * 12}px)` : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
        <Mark size={150} corners={corners} check={check} />
        <Wordmark size={164} shown={shown} />
      </div>
      {/* Reserved height in bar 1 too, so the lockup sits in the same place both times. */}
      <div style={{ height: 64, display: "flex", alignItems: "center", gap: 18, opacity: by, filter: by < 1 ? `blur(${(1 - by) * 10}px)` : undefined, translate: `0 ${(1 - by) * 16}px` }}>
        <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 30, color: "#98A1AE" }}>by</span>
        <Img src={staticFile("brand/metaplm_logo_white.png")} style={{ height: 64 }} />
      </div>
    </div>
  );
}
