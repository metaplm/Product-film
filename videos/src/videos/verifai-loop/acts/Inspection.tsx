import { Easing } from "remotion";

import { step } from "../../../kit/spring";
import { clamp01, progress } from "../../../kit/time";
import { agentColor, color, font, pop, radius, ui } from "../../../tokens";
import { cue } from "../cues";
import { swap } from "../ui/Button";
import { Drawing } from "../ui/Drawing";
import { Mark } from "../ui/Mark";
import { Spinner } from "../ui/Spinner";

/**
 * Bars 5 to 7: VerifAI reads drawing 1011548 and resolves rules from
 * checklist.yaml (English names as written there), one per beat. Findings are
 * marked on the sheet the way annotator.py does: a numbered circle at the
 * finding, green for PASS, red for FAIL, with a red frame around a failure.
 */
type Agent = keyof typeof agentColor;
/** `inside`: the marker sits at the right end of a title-block cell, clear of its label and value. */
type Rule = { name: string; agent: Agent; pass: boolean; box?: [number, number, number, number]; inside?: boolean };
const RULES: Rule[] = [
  { name: "Part Number Must Match PLM", agent: "CROSS", pass: true, box: [590, 612, 200, 40], inside: true },
  { name: "Revision Level Must Be Marked", agent: "2D", pass: true, box: [790, 612, 100, 40], inside: true },
  { name: "Isometric View", agent: "2D", pass: true, box: [786, 138, 206, 170] },
  { name: "General Tolerance Standard Must Be Specified", agent: "2D", pass: false, box: [58, 474, 420, 116] },
  { name: "Balloon Callouts Must Be Present", agent: "2D", pass: true, box: [482, 122, 36, 36] },
  { name: "Title Block Approvals", agent: "2D", pass: false, box: [740, 692, 308, 40], inside: true },
  { name: "No Hidden Bodies in 3D Model", agent: "3D", pass: true },
  { name: "Material Must Match PLM", agent: "CROSS", pass: true, box: [590, 652, 300, 40], inside: true },
];
export const sheetBox = { x: 100, y: 158, w: 1080, h: 764 };
const panel = { x: 1250, y: 150, w: 580 };
const ROW_H = 76;
const scanEase = Easing.inOut(Easing.quad);

function RuleIcon({ state, since, t }: { state: "idle" | "checking" | "pass" | "fail"; since: number; t: number }) {
  if (state === "idle") {
    return (
      <svg width={30} height={30} viewBox="0 0 32 32" style={{ flex: "none" }}>
        <circle cx={16} cy={16} r={13} fill="none" stroke="#2A3B4C" strokeWidth={2.5} />
      </svg>
    );
  }
  if (state === "checking") return <Spinner t={t} size={30} tint={color.sky} track="#2A3B4C" />;
  const s = 0.55 + 0.45 * step(t - since, pop);
  return (
    <svg width={30} height={30} viewBox="0 0 32 32" style={{ flex: "none", scale: String(s) }}>
      <circle cx={16} cy={16} r={15} fill={state === "pass" ? color.pass : color.fail} />
      <path d={state === "pass" ? "M9 16.5 L14 21.5 L23 11.5" : "M11 11 L21 21 M21 11 L11 21"} fill="none" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Inspection({ t }: { t: number }) {
  const { inspect } = cue;
  if (t < inspect.in || t > inspect.out + 0.14) return null;
  const enter = clamp01(step(t - inspect.in, ui));
  const leave = clamp01((t - inspect.out) / 0.12);
  const u = enter * (1 - leave);
  const scan = scanEase(progress(t, inspect.scan, 1.0));
  const states = RULES.map((rule, index) => {
    const at = inspect.rules[index];
    if (t >= at) return { state: rule.pass ? ("pass" as const) : ("fail" as const), since: at };
    if (t >= at - 0.5 && t >= inspect.scan + 0.5) return { state: "checking" as const, since: 0 };
    return { state: "idle" as const, since: 0 };
  });
  const passed = states.filter((s) => s.state === "pass").length;
  const failed = states.filter((s) => s.state === "fail").length;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: u, filter: u < 0.98 ? `blur(${(1 - u) * 12}px)` : undefined, fontFamily: font.sans }}>
      {/* The sheet, with the reading band and the findings. */}
      <div style={{ position: "absolute", left: sheetBox.x, top: sheetBox.y, width: sheetBox.w, height: sheetBox.h, borderRadius: 6, overflow: "hidden", translate: `0 ${(1 - enter) * 24}px` }}>
        <Drawing />
        {scan > 0 && scan < 1 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: scan * sheetBox.h - 60, height: 60, background: `linear-gradient(180deg, #1F93CE00, #1F93CE38)`, borderBottom: `2px solid ${color.sky}` }} />
        ) : null}
        {RULES.map((rule, index) => {
          if (!rule.box || t < inspect.rules[index]) return null;
          const [x, y, w, h] = rule.box;
          const tone = rule.pass ? color.pass : color.fail;
          const s = step(t - inspect.rules[index], pop);
          return (
            <div key={rule.name}>
              {!rule.pass ? <div style={{ position: "absolute", left: x - 6, top: y - 6, width: w + 12, height: h + 12, border: `3px solid ${color.fail}`, borderRadius: 4, opacity: clamp01(s) }} /> : null}
              <div
                style={{
                  position: "absolute",
                  left: rule.inside ? x + w - 44 : x - 18,
                  top: rule.inside ? y + h / 2 - 18 : y - 18,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: tone,
                  border: "3px solid #FFFFFF",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontFamily: font.mono,
                  fontSize: 17,
                  fontWeight: 500,
                  scale: String(0.4 + 0.6 * s),
                }}
              >
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* VerifAI's read-out, on the film ground. */}
      <div style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.w, color: color.onBg, translate: `${(1 - enter) * 30}px 0` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark size={46} check={clamp01((t - inspect.in) / 0.3)} />
          <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>Inspecting 1011548</span>
        </div>
        <div style={{ fontFamily: font.mono, fontSize: 20, color: color.onBgMuted, marginTop: 12 }}>Drawing · 3D model · PLM card</div>
        <div style={{ fontFamily: font.mono, fontSize: 22, marginTop: 22, height: 30 }}>
          <span style={{ color: passed ? color.pass : color.onBgMuted }}>{passed} passed</span>
          <span style={{ color: color.onBgMuted }}> · </span>
          <span style={{ color: failed ? "#E5675A" : color.onBgMuted }}>{failed} failed</span>
        </div>
        <div style={{ marginTop: 22 }}>
          {RULES.map((rule, index) => {
            const { state, since } = states[index];
            return (
              <div key={rule.name} style={{ height: ROW_H, display: "flex", alignItems: "center", gap: 14, borderTop: index ? "1px solid #1C2C3B" : undefined }}>
                <RuleIcon state={state} since={since} t={t} />
                <span style={{ fontFamily: font.mono, fontSize: 18, color: color.onBgMuted, width: 22 }}>{index + 1}</span>
                <span style={{ fontSize: 22, lineHeight: 1.2, flex: 1, color: state === "idle" ? color.onBgMuted : color.onBg }}>{rule.name}</span>
                <span style={{ fontFamily: font.mono, fontSize: 15, fontWeight: 500, padding: "4px 10px", borderRadius: radius.pill, background: agentColor[rule.agent], color: "#FFFFFF", flex: "none" }}>{rule.agent}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, fontSize: 21, color: color.onBgMuted, ...swap(t, inspect.authority) }}>
          <span style={{ color: color.onBg, fontWeight: 600 }}>Authority</span> · 2 major findings, report ready
        </div>
      </div>
    </div>
  );
}
