import type { ReactNode } from "react";

import { step } from "../../../kit/spring";
import { clamp01 } from "../../../kit/time";
import { color, font, radius, ui } from "../../../tokens";

export type Box = { x: number; y: number; w: number; h: number };
export const HEADER = 84;

/**
 * A light product card with the widget's header gradient (metachecker-widget
 * app.vue). Wipes open from the left, leaves with a blur. Children are
 * placed in the card's own coordinates.
 */
export function Panel({ t, box, from, to, header, children, target }: { t: number; box: Box; from: number; to: number; header: ReactNode; children: ReactNode; target?: string }) {
  if (t < from || t > to + 0.14) return null;
  const enter = step(t - from, ui);
  const leave = clamp01((t - to) / 0.12);
  return (
    <div
      data-target={target}
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        borderRadius: radius.window,
        background: color.paper,
        overflow: "hidden",
        clipPath: `inset(0 ${(1 - clamp01(enter)) * 100}% 0 0 round ${radius.window}px)`,
        opacity: 1 - leave,
        filter: leave > 0 ? `blur(${leave * 12}px)` : undefined,
        fontFamily: font.sans,
        color: color.text,
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: HEADER, background: `linear-gradient(125deg, ${color.headerFrom}, ${color.headerMid})`, display: "flex", alignItems: "center", gap: 18, padding: "0 32px", color: color.onBg }}>
        {header}
      </div>
      {children}
    </div>
  );
}

/** A small status chip. */
export function Chip({ children, fill, ink, style }: { children: ReactNode; fill: string; ink: string; style?: React.CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 16px", borderRadius: radius.pill, background: fill, color: ink, fontSize: 20, fontWeight: 600, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}
