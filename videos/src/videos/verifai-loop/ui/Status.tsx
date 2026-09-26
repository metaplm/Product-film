import { step } from "../../../kit/spring";
import { color, pop } from "../../../tokens";
import { Spinner } from "./Spinner";

export type State = "idle" | "checking" | "pass" | "fail" | "warn";

const tone = { pass: color.accent, fail: color.fail, warn: color.warn } as const;
const glyph = {
  pass: "M9 16.5 L14 21.5 L23 11.5",
  fail: "M11 11 L21 21 M21 11 L11 21",
  warn: "M16 9 L16 18 M16 22.5 L16 23",
} as const;

/** A rule's status: a ring while idle, a spinner while checking, a filled tone that pops in on its result. */
export function Status({ state, since, t, size = 34 }: { state: State; since: number; t: number; size?: number }) {
  if (state === "idle") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ flex: "none" }}>
        <circle cx={16} cy={16} r={13} fill="none" stroke={color.border} strokeWidth={2.5} />
      </svg>
    );
  }
  if (state === "checking") return <Spinner t={t} size={size} />;
  const s = 0.55 + 0.45 * step(t - since, pop);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flex: "none", scale: String(s) }}>
      <circle cx={16} cy={16} r={15} fill={tone[state]} />
      <path d={glyph[state]} fill="none" stroke={color.accentInk} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
