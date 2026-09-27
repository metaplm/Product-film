import { clamp01 } from "../../../kit/time";
import { font } from "../../../tokens";

/**
 * The film ground as a drafting sheet: a fine 24 px grid, a 120 px major grid
 * with small crosses at its nodes, and edge rulers. Static, so frame 0 and the
 * last frame match.
 */
const MINOR = "#0F1E2B";
const MAJOR = "#15293A";

export function Blueprint() {
  const ticks = [];
  for (let x = 0; x <= 1920; x += 24) ticks.push(<line key={`t${x}`} x1={x} y1={0} x2={x} y2={x % 120 === 0 ? 14 : 7} />);
  for (let y = 0; y <= 1080; y += 24) ticks.push(<line key={`l${y}`} x1={0} y1={y} x2={y % 120 === 0 ? 14 : 7} y2={y} />);
  const crosses = [];
  for (let x = 120; x < 1920; x += 120) for (let y = 120; y < 1080; y += 120) crosses.push(<path key={`${x}-${y}`} d={`M${x - 5} ${y} H${x + 5} M${x} ${y - 5} V${y + 5}`} />);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="minor" width={24} height={24} patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" fill="none" stroke={MINOR} strokeWidth={1} />
        </pattern>
        <pattern id="major" width={120} height={120} patternUnits="userSpaceOnUse">
          <path d="M120 0 H0 V120" fill="none" stroke={MAJOR} strokeWidth={1} />
        </pattern>
      </defs>
      <rect width={1920} height={1080} fill="url(#minor)" />
      <rect width={1920} height={1080} fill="url(#major)" />
      <g stroke="#23405A" strokeWidth={1.2}>{crosses}</g>
      <g stroke="#2A4A66" strokeWidth={1}>{ticks}</g>
    </svg>
  );
}

/**
 * Frame HUD during the product scenes: the section (a real sequence, so it is
 * numbered), the Change Action, and a running timecode. Fades in and out so
 * the loop's first and last frames stay clean.
 */
export function Hud({ t, from, to, sections }: { t: number; from: number; to: number; sections: readonly (readonly [number, string])[] }) {
  if (t < from || t > to + 0.3) return null;
  const u = clamp01((t - from) / 0.3) * (1 - clamp01((t - to) / 0.3));
  const current = [...sections].reverse().find(([at]) => t >= at);
  const seconds = t - from;
  const tc = `T+${String(Math.floor(seconds / 60)).padStart(2, "0")}:${seconds.toFixed(2).padStart(5, "0")}`;
  const style = { position: "absolute", fontFamily: font.mono, fontSize: 18, letterSpacing: "0.08em", color: "#6F8499" } as const;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: u }}>
      <div style={{ ...style, left: 40, top: 36, color: "#9FB6CB" }}>{current?.[1]}</div>
      <div style={{ ...style, right: 40, top: 36 }}>VERIFAI · CA-00001445</div>
      <div style={{ ...style, left: 40, bottom: 30 }}>{tc}</div>
      <div style={{ ...style, right: 40, bottom: 30 }}>120 BPM · 1920×1080 · 60 FPS</div>
    </div>
  );
}
