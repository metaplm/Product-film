import { Easing } from "remotion";

import { step } from "../../../kit/spring";
import { clamp01, progress } from "../../../kit/time";
import { color, font, ui } from "../../../tokens";
import { cue } from "../cues";
import { action, main } from "../layout";
import { Button, swap } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

/** Category scores for BRK-2041, consistent with the rule check (one drawing warning). */
const CATEGORIES = [
  { name: "Geometry", value: 100 },
  { name: "Metadata", value: 100 },
  { name: "Drawing", value: 83 },
  { name: "Naming", value: 100 },
] as const;
const SCORE = 96;
export const exportButton = action(240);
const ring = { cx: main.x + 250, cy: main.y + 400, r: 170, stroke: 22 };
const count = Easing.bezier(0.25, 0.1, 0.25, 1);

/** Bars 9 and 10: the compliance score counts up, category bars fill on the beat, the report exports. */
export function Report({ t, to }: { t: number; to: number }) {
  if (t > to + 0.14) return null;
  const leave = clamp01((t - to) / 0.12);
  const u = count(progress(t, cue.score.from, cue.score.to - cue.score.from));
  const score = Math.round(SCORE * u);
  const circumference = 2 * Math.PI * ring.r;
  const exporting = t >= cue.score.export && t < cue.score.exported;
  const barsX = main.x + 620;
  const barsW = main.w - 620;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - leave, filter: leave > 0 ? `blur(${leave * 10}px)` : undefined }}>
      <div style={{ position: "absolute", left: main.x, top: main.y, fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>Compliance report</div>
      <div style={{ position: "absolute", left: main.x, top: main.y + 56, fontFamily: font.mono, fontSize: 22, color: color.muted }}>BRK-2041 · Rev B · 6 design rules</div>
      <Button box={exportButton} t={t} press={cue.score.export} target="export">
        {exporting ? (
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Spinner t={t} size={26} tint={color.accentInk} /> Exporting
          </span>
        ) : t >= cue.score.exported ? (
          <span style={swap(t, cue.score.exported)}>Exported</span>
        ) : (
          "Export PDF"
        )}
      </Button>

      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <circle cx={ring.cx} cy={ring.cy} r={ring.r} fill="none" stroke={color.border} strokeWidth={ring.stroke} />
        <circle
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill="none"
          stroke={color.accent}
          strokeWidth={ring.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (SCORE / 100) * u)}
          transform={`rotate(-90 ${ring.cx} ${ring.cy})`}
          opacity={u > 0 ? 1 : 0}
        />
      </svg>
      <div style={{ position: "absolute", left: ring.cx - 200, top: ring.cy - 70, width: 400, display: "flex", justifyContent: "center", alignItems: "baseline", fontVariantNumeric: "tabular-nums" }}>
        <span style={{ fontSize: 112, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 48, color: color.muted, marginLeft: 4 }}>%</span>
      </div>
      <div style={{ position: "absolute", left: ring.cx - 200, top: ring.cy + 58, width: 400, textAlign: "center", fontSize: 24, color: color.muted }}>Compliance score</div>

      {CATEGORIES.map((category, index) => {
        const at = cue.score.bars[index];
        const fill = clamp01(step(t - at, ui));
        const tint = category.value < 100 ? color.warn : color.accent;
        const y = main.y + 190 + index * 118;
        return (
          <div key={category.name} style={{ position: "absolute", left: barsX, top: y, width: barsW, opacity: swap(t, at - 0.25).opacity }}>
            <div style={{ display: "flex", fontSize: 26 }}>
              <span>{category.name}</span>
              <span style={{ marginLeft: "auto", fontFamily: font.mono, fontSize: 24, color: fill > 0.02 ? tint : color.muted, fontVariantNumeric: "tabular-nums" }}>
                {Math.round(category.value * fill)}%
              </span>
            </div>
            <div style={{ marginTop: 16, height: 10, borderRadius: 5, background: color.border }}>
              <div style={{ height: 10, borderRadius: 5, background: tint, width: `${category.value * fill}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
