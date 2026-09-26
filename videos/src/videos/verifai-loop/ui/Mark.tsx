import { color } from "../../../tokens";

/**
 * The VerifAI mark (logo direction 1b, "Denetim mührü"): four solid corner
 * blocks, like a drawing's crop marks, around a check. Paths are the logo
 * page's own (64x64). `corners` brings the blocks in from outside (0..1),
 * `check` draws the check (0..1). `tone` picks the logo page's dark or light variant.
 */
const CORNERS = [
  { d: "M2 22 V2 H22 V9 H9 V22 Z", dx: -1, dy: -1 },
  { d: "M62 22 V2 H42 V9 H55 V22 Z", dx: 1, dy: -1 },
  { d: "M2 42 V62 H22 V55 H9 V42 Z", dx: -1, dy: 1 },
  { d: "M62 42 V62 H42 V55 H55 V42 Z", dx: 1, dy: 1 },
];
const CHECK = "M17 33 L27 43 L47 21";
const CHECK_LENGTH = 14.2 + 29.8;

export function Mark({ size, corners = [1, 1, 1, 1], check = 1, tone = "dark" }: { size: number; corners?: number[]; check?: number; tone?: "dark" | "light" }) {
  const block = tone === "dark" ? color.brandLight : color.brand;
  const tick = tone === "dark" ? color.onBg : color.text;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible", flex: "none" }}>
      {CORNERS.map((corner, index) => {
        const u = corners[index];
        return <path key={index} d={corner.d} fill={block} opacity={u > 0 ? Math.min(1, u * 3) : 0} transform={`translate(${corner.dx * 14 * (1 - u)} ${corner.dy * 14 * (1 - u)})`} />;
      })}
      <path d={CHECK} fill="none" stroke={tick} strokeWidth={7.5} strokeLinejoin="miter" strokeDasharray={CHECK_LENGTH} strokeDashoffset={CHECK_LENGTH * (1 - check)} opacity={check > 0 ? 1 : 0} />
    </svg>
  );
}

/** "Verif" + "AI" (logo 2A: Inter 600, tracking -0.04em). `shown(i)` gives each letter's 0..1 landing; slots never move. */
export function Wordmark({ size, shown, tone = "dark" }: { size: number; shown: (index: number) => number; tone?: "dark" | "light" }) {
  const ink = tone === "dark" ? color.onBg : color.text;
  const accent = tone === "dark" ? color.brandLight : color.brand;
  return (
    <div style={{ display: "flex", fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1 }}>
      {"VerifAI".split("").map((letter, index) => {
        const u = shown(index);
        return (
          <span key={index} style={{ color: index >= 5 ? accent : ink, opacity: u, filter: u < 1 ? `blur(${(1 - u) * 14}px)` : undefined, translate: `0 ${(1 - u) * 28}px` }}>
            {letter}
          </span>
        );
      })}
    </div>
  );
}
