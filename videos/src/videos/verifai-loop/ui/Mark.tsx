import { interpolateColors } from "remotion";

import { color } from "../../../tokens";

/**
 * The Verifai mark: a hex part outline with a check inside. Drawn by `t`:
 * `hex` and `check` draw the strokes (0..1), `fill` floods the hex with the
 * accent and turns the check dark.
 */
const HEX = "M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z";
const CHECK = "M31 51 L44 64 L70 37";
const HEX_LENGTH = 6 * 45;
const CHECK_LENGTH = 18.4 + 37.5;

export function Mark({ size, hex = 1, check = 1, fill = 1 }: { size: number; hex?: number; check?: number; fill?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", flex: "none" }}>
      <path d={HEX} fill={color.accent} fillOpacity={fill} />
      <path
        d={HEX}
        fill="none"
        stroke={interpolateColors(fill, [0, 1], [color.fg, color.accent])}
        strokeWidth={7}
        strokeLinejoin="round"
        strokeDasharray={HEX_LENGTH}
        strokeDashoffset={HEX_LENGTH * (1 - hex)}
        opacity={hex > 0 ? 1 : 0}
      />
      <path
        d={CHECK}
        fill="none"
        stroke={interpolateColors(fill, [0, 1], [color.accent, color.accentInk])}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={CHECK_LENGTH}
        strokeDashoffset={CHECK_LENGTH * (1 - check)}
        opacity={check > 0 ? 1 : 0}
      />
    </svg>
  );
}

/** "Verif" + "ai" in the accent. `shown(i)` gives each letter's 0..1 landing; slots never move. */
export function Wordmark({ size, shown }: { size: number; shown: (index: number) => number }) {
  return (
    <div style={{ display: "flex", fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1 }}>
      {"Verifai".split("").map((letter, index) => {
        const u = shown(index);
        return (
          <span
            key={index}
            style={{
              color: index >= 5 ? color.accent : color.fg,
              opacity: u,
              filter: u < 1 ? `blur(${(1 - u) * 14}px)` : undefined,
              translate: `0 ${(1 - u) * 28}px`,
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}
