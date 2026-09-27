import { Easing } from "remotion";

import { move, type Rect } from "../../../kit/move";
import { step } from "../../../kit/spring";
import { clamp01, progress } from "../../../kit/time";
import { color, font, radius, ui } from "../../../tokens";
import { cue } from "../cues";
import { swap } from "../ui/Button";

/**
 * Bars 9 and 10: the grouped PDF report, laid out like ca_reporter.py (navy
 * banners, PASSED / FAILED score boxes, "~ ISSUES FOUND", the Change Action
 * contents, action items). Numbers are the live run's: CA-00001445,
 * PASS 35 / FAIL 12. On bar 10 beat 4 the page folds into an attachment on
 * the route task (a magic move).
 */
export const page: Rect = { x: 250, y: 96, w: 620, h: 888 };
export const attachment: Rect = { x: 200, y: 468, w: 600, h: 72 };
const PARTS = [
  { id: "1011548", type: "Part + Drawing", pass: 14, fail: 7 },
  { id: "1011549", type: "Part + Drawing", pass: 13, fail: 5 },
  { id: "1006311", type: "Part", pass: 8, fail: 0 },
] as const;
const count = Easing.bezier(0.25, 0.1, 0.25, 1);

function Banner({ y, children }: { y: number; children: string }) {
  return <div style={{ position: "absolute", left: 28, right: 28, top: y, height: 34, background: color.reportNavy, color: "#FFFFFF", fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", display: "flex", alignItems: "center", paddingLeft: 14 }}>{children}</div>;
}

export function Report({ t }: { t: number }) {
  const { report } = cue;
  if (t < report.in || t > report.shrink + 1.2) return null;
  const enter = clamp01(step(t - report.in, ui));
  const rect = move(t, report.shrink, page, attachment);
  const folding = clamp01((t - report.shrink) / 0.2);
  const k = count(progress(t, report.count, report.countEnd - report.count));
  // Once it has landed, the route task's own attachment row takes over.
  if (t > report.shrink + 0.5) return null;
  // The page prints: it slides up out of a slot while its top edge wipes open.
  const print = Easing.out(Easing.cubic)(progress(t, report.in, 0.45));
  const callout = clamp01((t - report.count) / 0.25) * (1 - folding);
  return (
    <>
    <Callout t={t} k={k} u={callout} />
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: 4 + 8 * folding, background: color.paper, overflow: "hidden", translate: `0 ${(1 - print) * 220}px`, clipPath: `inset(0 0 ${(1 - print) * 100}% 0)`, fontFamily: font.sans, color: color.text }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: page.w, height: page.h, opacity: 1 - folding }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, background: color.reportNavy, color: "#FFFFFF", padding: "20px 28px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 25, fontWeight: 700 }}>VerifAI Automated Inspection Report</div>
          <div style={{ fontFamily: font.mono, fontSize: 15, color: "#C9D3E3", marginTop: 8 }}>CA-00001445 · 3 parts · 2 drawings</div>
        </div>
        <Banner y={122}>GENERAL ASSESSMENT</Banner>
        {[
          { label: "PASSED", value: 35, ink: color.pass, fill: color.passBg, x: 28 },
          { label: "FAILED", value: 12, ink: color.fail, fill: color.failBg, x: 318 },
        ].map((box) => (
          <div key={box.label} style={{ position: "absolute", left: box.x, top: 172, width: 274, height: 140, background: box.fill, display: "grid", placeItems: "center", alignContent: "center", gap: 2 }}>
            <div style={{ fontSize: 76, fontWeight: 700, color: box.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.round(box.value * k)}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: box.ink, letterSpacing: "0.08em" }}>{box.label}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 28, top: 334, ...swap(t, report.verdict) }}>
          <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: radius.pill, background: color.partial, color: "#FFFFFF", fontSize: 20, fontWeight: 700 }}>~ ISSUES FOUND</span>
        </div>
        <Banner y={400}>CHANGE ACTION CONTENTS</Banner>
        <div style={{ position: "absolute", left: 28, right: 28, top: 446, fontSize: 15 }}>
          <div style={{ display: "flex", color: color.textMuted, fontWeight: 600, paddingBottom: 8, borderBottom: `1px solid ${color.line}` }}>
            <span style={{ width: 150 }}>Part</span>
            <span style={{ width: 170 }}>Type</span>
            <span style={{ width: 70 }}>Pass</span>
            <span style={{ width: 70 }}>Fail</span>
            <span>Result</span>
          </div>
          {PARTS.map((part, index) => (
            <div key={part.id} style={{ display: "flex", alignItems: "center", height: 44, borderBottom: `1px solid ${color.lineSoft}`, fontSize: 17, ...swap(t, report.count + index * 0.25) }}>
              <span style={{ width: 150, fontFamily: font.mono }}>{part.id}</span>
              <span style={{ width: 170, color: color.textMuted }}>{part.type}</span>
              <span style={{ width: 70, color: color.pass, fontWeight: 600 }}>{part.pass}</span>
              <span style={{ width: 70, color: part.fail ? color.fail : color.textMuted, fontWeight: 600 }}>{part.fail}</span>
              <span style={{ fontWeight: 700, color: part.fail ? color.fail : color.pass }}>{part.fail ? "FAIL" : "PASS"}</span>
            </div>
          ))}
        </div>
        <Banner y={640}>ACTION ITEMS</Banner>
        <div style={{ position: "absolute", left: 28, right: 28, top: 690, fontSize: 17, display: "grid", gap: 14, ...swap(t, report.actions) }}>
          <div>
            <span style={{ fontFamily: font.mono }}>1011548</span> · Title Block Approvals <span style={{ color: color.fail, fontWeight: 700 }}>Major</span>
          </div>
          <div>
            <span style={{ fontFamily: font.mono }}>1011548</span> · General Tolerance Standard <span style={{ color: color.fail, fontWeight: 700 }}>Major</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 28, bottom: 22, fontSize: 13, color: color.textMuted }}>VerifAI · CA-00001445 · Auto-generated report.</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: folding }}>
        <AttachmentRow />
      </div>
    </div>
    </>
  );
}

/**
 * The report's two numbers, called out at full size on the film ground with
 * leader lines back to their score boxes, so they read on a phone.
 */
function Callout({ t, k, u }: { t: number; k: number; u: number }) {
  if (u <= 0) return null;
  const rows = [
    { value: 35, label: "PASSED", ink: color.pass, y: 150, from: { x: page.x + 28 + 274, y: page.y + 172 + 70 } },
    { value: 12, label: "FAILED", ink: "#E5675A", y: 560, from: { x: page.x + 318 + 274, y: page.y + 172 + 70 } },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: u }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {rows.map((row) => (
          <path key={row.label} d={`M${row.from.x} ${row.from.y} H${1020} L${1060} ${row.y + 150}`} fill="none" stroke={color.accent} strokeWidth={2} strokeDasharray={`${1000 * clamp01((t - cue.report.count) / 0.4)} 2000`} />
        ))}
      </svg>
      {rows.map((row) => (
        <div key={row.label} style={{ position: "absolute", left: 1080, top: row.y, fontFamily: font.mono, color: row.ink, lineHeight: 1 }}>
          <div style={{ fontSize: 260, fontWeight: 500, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{String(Math.round(row.value * k)).padStart(2, "0")}</div>
          <div style={{ fontSize: 40, letterSpacing: "0.2em", marginTop: 8 }}>{row.label}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 1500, top: 440, fontFamily: font.mono, fontSize: 30, color: color.onBgMuted, lineHeight: 1.5, ...swap(t, cue.report.verdict) }}>
        CA-00001445
        <br />
        <span style={{ color: color.partial }}>~ ISSUES FOUND</span>
      </div>
    </div>
  );
}

/** The report as a route-task attachment. Also rendered by the task card once the move lands. */
export function AttachmentRow() {
  return (
    <div style={{ width: attachment.w, height: attachment.h, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", boxSizing: "border-box", borderRadius: 12, border: `2px solid ${color.line}`, background: color.paperAlt }}>
      <span style={{ width: 40, height: 48, borderRadius: 4, background: color.fail, color: "#FFFFFF", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center" }}>PDF</span>
      <span style={{ fontFamily: font.mono, fontSize: 20, color: color.text }}>VerifAI_Report_CA-00001445.pdf</span>
    </div>
  );
}
