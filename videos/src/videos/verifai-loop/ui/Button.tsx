import type { ReactNode } from "react";

import { step } from "../../../kit/spring";
import { color, font, radius } from "../../../tokens";

/**
 * A button at a fixed box, so its width never changes while it loads.
 * `press` is the click time: a short dip in scale, like the cursor's squash.
 */
export function Button({ box, kind = "primary", t, press, children, target }: { box: { x: number; y: number; w: number; h: number }; kind?: "primary" | "ghost"; t: number; press?: number; children: ReactNode; target?: string }) {
  const dip = press !== undefined && t >= press && t < press + 0.2 ? Math.sin((Math.PI * (t - press)) / 0.2) * 0.05 : 0;
  const primary = kind === "primary";
  return (
    <div
      data-target={target}
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderRadius: radius.control,
        background: primary ? color.accent : color.raised,
        border: primary ? undefined : `1px solid ${color.border}`,
        boxSizing: "border-box",
        color: primary ? color.accentInk : color.fg,
        fontFamily: font.sans,
        fontWeight: 600,
        fontSize: 24,
        scale: String(1 - dip),
      }}
    >
      {children}
    </div>
  );
}

/** Blur-swaps a label in at `at` (for button labels and counters). */
export function swap(t: number, at: number) {
  const u = step(t - at, { stiffness: 300, damping: 30 });
  return { opacity: u, filter: u < 0.98 ? `blur(${(1 - u) * 8}px)` : undefined } as const;
}
