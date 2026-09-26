import type { ReactNode } from "react";

import { step } from "../../../kit/spring";
import { clamp01 } from "../../../kit/time";
import { color, font, radius, ui } from "../../../tokens";
import { win } from "../layout";
import { Mark } from "../ui/Mark";

const parts = [
  ["BRK-2041", "Bracket, rear mount"],
  ["BRK-2042", "Bracket, front mount"],
  ["PLT-1107", "Base plate"],
  ["SHF-0310", "Drive shaft"],
  ["HSG-5520", "Gear housing"],
] as const;

/** The Verifai app window: header with the part breadcrumb, a parts sidebar, and the main area as children. */
export function Window({ t, from, to, children }: { t: number; from: number; to: number; children: ReactNode }) {
  if (t < from || t > to + 0.14) return null;
  const enter = step(t - from, ui);
  const leave = clamp01((t - to) / 0.12);
  const u = clamp01(enter) * (1 - leave);
  return (
    <div
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        borderRadius: radius.window,
        background: color.surface,
        border: `1px solid ${color.border}`,
        boxSizing: "border-box",
        overflow: "hidden",
        opacity: u,
        scale: String(0.965 + 0.035 * enter + 0.02 * leave),
        filter: u < 0.98 ? `blur(${(1 - u) * 12}px)` : undefined,
        fontFamily: font.sans,
        color: color.fg,
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: win.header, borderBottom: `1px solid ${color.border}`, display: "flex", alignItems: "center", gap: 14, paddingLeft: 28 }}>
        <Mark size={34} />
        <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Verif<span style={{ color: color.accent }}>ai</span>
        </span>
        <span style={{ marginLeft: 36, fontFamily: font.mono, fontSize: 20, color: color.muted }}>Parts / BRK-2041 / Rev B</span>
      </div>
      <div style={{ position: "absolute", left: 0, top: win.header, bottom: 0, width: win.sidebar, borderRight: `1px solid ${color.border}`, padding: "28px 16px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 20, color: color.muted, padding: "0 16px 14px" }}>Parts</div>
        {parts.map(([id, name], index) => (
          <div key={id} style={{ padding: "14px 16px", borderRadius: radius.control, background: index === 0 ? color.raised : undefined }}>
            <div style={{ fontFamily: font.mono, fontSize: 22, color: index === 0 ? color.fg : color.muted }}>{id}</div>
            <div style={{ fontSize: 20, color: color.muted, marginTop: 4 }}>{name}</div>
          </div>
        ))}
      </div>
      {/* Children are laid out in screen coordinates; this layer undoes the window offset. */}
      <div style={{ position: "absolute", left: -win.x, top: -win.y, width: 1920, height: 1080 }}>{children}</div>
    </div>
  );
}
