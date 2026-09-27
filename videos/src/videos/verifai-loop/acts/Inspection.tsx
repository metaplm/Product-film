import { Easing } from "remotion";

import { camera, type CameraKey } from "../../../kit/camera";
import { step } from "../../../kit/spring";
import { clamp01, progress } from "../../../kit/time";
import { agentColor, color, font, pop, ui } from "../../../tokens";
import { cue } from "../cues";
import { swap } from "../ui/Button";
import { Drawing, SHEET } from "../ui/Drawing";
import { Spinner } from "../ui/Spinner";

/**
 * Bars 5 to 7: VerifAI reads drawing 1011548. Rules from checklist.yaml
 * (English names as written there) resolve one per beat, printed like a test
 * run. Findings are marked on the sheet the way annotator.py does (numbered
 * circle, green PASS, red FAIL, red frame on a failure), and the camera pushes
 * in on each failure while the mark's corner blocks lock onto it.
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
/** The viewport the sheet is filmed in, left of the read-out. */
const VIEW = { x: 60, y: 110, w: 1180, h: 860 };
const VC = { x: VIEW.x + VIEW.w / 2, y: VIEW.y + VIEW.h / 2 };
const FOCUS = [
  { rule: 3, from: cue.inspect.focusNotes, to: cue.inspect.focusTitle, label: "General tolerance standard: not specified" },
  { rule: 5, from: cue.inspect.focusTitle, to: cue.inspect.back, label: "Title block: APPROVED is empty" },
];
const KEYS: CameraKey[] = [
  [cue.inspect.in, SHEET.w / 2, SHEET.h / 2, 1.06],
  [cue.inspect.focusNotes - 0.35, 290, 532, 2.1],
  [cue.inspect.focusTitle - 0.35, 824, 577, 2.3],
  [cue.inspect.back - 0.2, SHEET.w / 2, SHEET.h / 2, 1.06],
];
const lens = { stiffness: 170, damping: 28, mass: 1 };
const panel = { x: 1290, y: 120, w: 580 };
const COMMAND = "$ verifai inspect 1011548 --rev A";

export function Inspection({ t }: { t: number }) {
  const { inspect } = cue;
  if (t < inspect.in || t > inspect.out + 0.14) return null;
  const enter = clamp01(step(t - inspect.in, ui));
  const leave = clamp01((t - inspect.out) / 0.12);
  const u = enter * (1 - leave);
  const cam = camera(t, KEYS, lens);
  const toScreen = (x: number, y: number) => ({ x: VC.x + (x - cam.x) * cam.zoom, y: VC.y + (y - cam.y) * cam.zoom });
  const scan = Easing.inOut(Easing.quad)(progress(t, inspect.scan, 1.0));
  const states = RULES.map((rule, index) => {
    const at = inspect.rules[index];
    if (t >= at) return { state: rule.pass ? ("pass" as const) : ("fail" as const), since: at };
    if (t >= at - 0.5 && t >= inspect.scan + 0.5) return { state: "checking" as const, since: 0 };
    return { state: "idle" as const, since: 0 };
  });
  const done = states.filter((s) => s.state === "pass" || s.state === "fail").length;
  const failed = states.filter((s) => s.state === "fail").length;
  const typed = Math.floor(clamp01((t - inspect.in - 0.1) / 0.7) * COMMAND.length);
  const origin = toScreen(0, 0);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: u, filter: u < 0.98 ? `blur(${(1 - u) * 12}px)` : undefined, fontFamily: font.sans }}>
      <div style={{ position: "absolute", left: VIEW.x, top: VIEW.y, width: VIEW.w, height: VIEW.h, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: origin.x - VIEW.x, top: origin.y - VIEW.y, width: SHEET.w, height: SHEET.h, scale: String(cam.zoom), transformOrigin: "0 0" }}>
          <Drawing />
          {scan > 0 && scan < 1 ? <div style={{ position: "absolute", left: 0, right: 0, top: scan * SHEET.h - 60, height: 60, background: "linear-gradient(180deg, #1F93CE00, #1F93CE38)", borderBottom: `2px solid ${color.sky}` }} /> : null}
          {RULES.map((rule, index) => {
            if (!rule.box || t < inspect.rules[index]) return null;
            const [x, y, w, h] = rule.box;
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
                    background: rule.pass ? color.pass : color.fail,
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
      </div>
      {/* Viewport marks: the logo's corner blocks, at the frame of the lens. */}
      <ViewCorners box={VIEW} size={34} tint="#2A4A66" />

      {/* Target lock on each failure, in screen space so it follows the camera exactly. */}
      {FOCUS.map((focus) => {
        if (t < focus.from || t >= focus.to) return null;
        const [x, y, w, h] = RULES[focus.rule].box!;
        const a = toScreen(x - 10, y - 10);
        const b = toScreen(x + w + 10, y + h + 10);
        const lock = step(t - focus.from, { stiffness: 260, damping: 24 });
        const pad = (1 - lock) * 60;
        const box = { x: a.x - pad, y: a.y - pad, w: b.x - a.x + 2 * pad, h: b.y - a.y + 2 * pad };
        const failed = t >= inspect.rules[focus.rule];
        return (
          <div key={focus.rule} style={{ position: "absolute", inset: 0, opacity: clamp01(lock * 2) * (1 - clamp01((t - (focus.to - 0.12)) / 0.12)) }}>
            <ViewCorners box={box} size={30} tint={failed ? color.fail : color.sky} weight={6} />
            <div style={{ position: "absolute", left: box.x, top: box.y + box.h + 16, display: "flex", gap: 12, alignItems: "center", fontFamily: font.mono, fontSize: 22, ...(failed ? swap(t, inspect.rules[focus.rule]) : { opacity: 0 }) }}>
              <span style={{ background: color.fail, color: "#FFFFFF", padding: "4px 12px", fontWeight: 500 }}>FAIL · MAJOR</span>
              <span style={{ background: color.bg, color: color.onBg, padding: "4px 12px" }}>{focus.label}</span>
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.w, color: color.onBg, fontFamily: font.mono }}>
        <div style={{ fontSize: 24, height: 34, color: color.sky }}>
          {COMMAND.slice(0, typed)}
          <span style={{ opacity: typed < COMMAND.length || Math.floor(t * 4) % 2 ? 1 : 0 }}>▍</span>
        </div>
        <div style={{ fontSize: 20, color: color.onBgMuted, marginTop: 10 }}>drawing · 3D model · PLM card</div>
        <div style={{ display: "flex", gap: 6, marginTop: 24, alignItems: "center" }}>
          {RULES.map((_, index) => {
            const s = states[index].state;
            return <span key={index} style={{ width: 44, height: 14, background: s === "pass" ? color.pass : s === "fail" ? color.fail : "#1C2C3B" }} />;
          })}
          <span style={{ marginLeft: 14, fontSize: 22 }}>
            {String(done).padStart(2, "0")}/08
          </span>
        </div>
        <div style={{ marginTop: 20 }}>
          {RULES.map((rule, index) => {
            const { state } = states[index];
            return (
              <div key={rule.name} style={{ height: 72, display: "flex", alignItems: "center", gap: 14, borderTop: "1px solid #1C2C3B" }}>
                <span style={{ fontSize: 18, color: color.onBgMuted, width: 26 }}>{String(index + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: font.sans, fontSize: 21, lineHeight: 1.2, flex: 1, color: state === "idle" ? color.onBgMuted : color.onBg }}>{rule.name}</span>
                <span style={{ fontSize: 14, color: agentColor[rule.agent] === agentColor.CROSS ? "#F29A4A" : "#8FA6BC", width: 58, textAlign: "right" }}>{rule.agent}</span>
                <span style={{ width: 66, textAlign: "right", fontSize: 21, fontWeight: 500 }}>
                  {state === "checking" ? (
                    <Spinner t={t} size={24} tint={color.sky} track="#1C2C3B" />
                  ) : state === "idle" ? (
                    <span style={{ color: "#2A3B4C" }}>····</span>
                  ) : (
                    <span style={{ color: state === "pass" ? color.pass : "#E5675A", display: "inline-block", scale: String(0.7 + 0.3 * step(t - states[index].since, pop)) }}>{state === "pass" ? "PASS" : "FAIL"}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, fontSize: 20, color: color.onBgMuted, ...swap(t, inspect.authority) }}>
          <span style={{ color: color.onBg }}>AUTHORITY ›</span> {8 - failed} pass · {failed} major · report
        </div>
      </div>
    </div>
  );
}

/** Four L corners around a box: the VerifAI mark's crop marks as a lens or a target lock. */
function ViewCorners({ box, size, tint, weight = 4 }: { box: { x: number; y: number; w: number; h: number }; size: number; tint: string; weight?: number }) {
  const { x, y, w, h } = box;
  const d = [
    `M${x} ${y + size} V${y} H${x + size}`,
    `M${x + w - size} ${y} H${x + w} V${y + size}`,
    `M${x} ${y + h - size} V${y + h} H${x + size}`,
    `M${x + w - size} ${y + h} H${x + w} V${y + h - size}`,
  ].join(" ");
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={d} fill="none" stroke={tint} strokeWidth={weight} strokeLinecap="square" />
    </svg>
  );
}
