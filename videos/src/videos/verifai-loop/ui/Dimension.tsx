import { Easing } from "remotion";

import { clamp01, progress } from "../../../kit/time";
import { color, font } from "../../../tokens";

/**
 * A drafting dimension under a punchline: extension ticks at both ends, a line
 * with arrowheads drawn out from the middle, and its value in the gap. Plus a
 * mono spec line above the words. Both leave with the punchline.
 */
export type Annotation = { at: number; out: number; spec: string; specY: number; value: string; y: number; x1: number; x2: number };

export function Dimension({ t, a }: { t: number; a: Annotation }) {
  if (t < a.at || t > a.out + 0.25) return null;
  const leave = clamp01((t - a.out) / 0.18);
  const grow = Easing.out(Easing.cubic)(progress(t, a.at + 0.2, 0.6));
  const mid = (a.x1 + a.x2) / 2;
  const half = ((a.x2 - a.x1) / 2) * grow;
  const gap = a.value.length * 14.5 + 40;
  const label = progress(t, a.at + 0.55, 0.25);
  const spec = progress(t, a.at, 0.3);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - leave, filter: leave > 0 ? `blur(${leave * 10}px)` : undefined }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: a.specY, textAlign: "center", fontFamily: font.mono, fontSize: 22, letterSpacing: "0.14em", color: "#6F8499", opacity: spec, translate: `0 ${(1 - spec) * 10}px` }}>{a.spec}</div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g stroke={color.sky} strokeWidth={2} fill={color.sky}>
          <line x1={a.x1} y1={a.y - 22} x2={a.x1} y2={a.y + 12} opacity={grow > 0.98 ? 1 : 0} />
          <line x1={a.x2} y1={a.y - 22} x2={a.x2} y2={a.y + 12} opacity={grow > 0.98 ? 1 : 0} />
          {half > gap / 2 ? (
            <>
              <line x1={mid - half} y1={a.y} x2={mid - gap / 2} y2={a.y} />
              <line x1={mid + gap / 2} y1={a.y} x2={mid + half} y2={a.y} />
              <path d={`M${mid - half} ${a.y} l16 -6 v12 Z M${mid + half} ${a.y} l-16 -6 v12 Z`} stroke="none" />
            </>
          ) : null}
        </g>
      </svg>
      <div style={{ position: "absolute", left: mid - 300, width: 600, top: a.y - 15, textAlign: "center", fontFamily: font.mono, fontSize: 24, color: color.sky, opacity: label }}>{a.value}</div>
    </div>
  );
}
