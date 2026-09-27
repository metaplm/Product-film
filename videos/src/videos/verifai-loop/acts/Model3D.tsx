import { Easing } from "remotion";

import { step } from "../../../kit/spring";
import { clamp01, progress } from "../../../kit/time";
import { color, font, ui } from "../../../tokens";
import { cue } from "../cues";
import { Mark } from "../ui/Mark";

/**
 * Bars 3 and 4: the route task is picked up and the CATIA worker opens part
 * 1011548 (the flow in enovia_poller.py and CATIA_INTEGRATION.md). The part is
 * a wireframe projected per frame from its dimensions (the drawing's: 360 x 240
 * plate, 2x Ø40 holes, a slot, a bent flange), turning slowly while a section
 * plane passes through it. The 3D rules are checklist.yaml's own.
 */
type P = readonly [number, number, number];
type Edge = readonly [P, P];

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Edge[] {
  const c = (x: number, y: number, z: number): P => [x, y, z];
  const v = [c(x0, y0, z0), c(x1, y0, z0), c(x1, y1, z0), c(x0, y1, z0), c(x0, y0, z1), c(x1, y0, z1), c(x1, y1, z1), c(x0, y1, z1)];
  const pairs = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return pairs.map(([a, b]) => [v[a], v[b]] as const);
}
function ring(cx: number, cy: number, r: number, z: number, n = 28): Edge[] {
  const out: Edge[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 1) / n) * Math.PI * 2;
    out.push([[cx + r * Math.cos(a), cy + r * Math.sin(a), z], [cx + r * Math.cos(b), cy + r * Math.sin(b), z]]);
  }
  return out;
}
function slot(cx: number, cy: number, half: number, r: number, z: number): Edge[] {
  const out: Edge[] = [[[cx - half, cy - r, z], [cx + half, cy - r, z]], [[cx - half, cy + r, z], [cx + half, cy + r, z]]];
  for (const [ox, from] of [[half, -Math.PI / 2], [-half, Math.PI / 2]] as const) {
    for (let i = 0; i < 10; i++) {
      const a = from + (i / 10) * Math.PI;
      const b = from + ((i + 1) / 10) * Math.PI;
      out.push([[cx + ox + r * Math.cos(a), cy + r * Math.sin(a), z], [cx + ox + r * Math.cos(b), cy + r * Math.sin(b), z]]);
    }
  }
  return out;
}

// The part, in mm, centered on the plate.
const T = 30;
const EDGES: Edge[] = [
  ...box(-180, 180, -120, 120, 0, T),
  ...box(180, 180 + T, -120, 120, -150, T),
  ...[0, T].flatMap((z) => [...ring(-120, 0, 20, z), ...ring(120, 0, 20, z), ...slot(0, 0, 20, 20, z)]),
];

const CENTER = { x: 1270, y: 560 };
const SCALE = 1.45;
const PITCH = (32 * Math.PI) / 180;

function project([x, y, z]: P, yaw: number) {
  const x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
  const y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
  return { x: CENTER.x + x1 * SCALE, y: CENTER.y - (z * Math.cos(PITCH) + y1 * Math.sin(PITCH)) * SCALE, depth: y1 * Math.cos(PITCH) - z * Math.sin(PITCH) };
}

/** Log lines, typed out (plain text so they can type; a trailing PASS is tinted). */
const LINES: { at: number; text: string; tint?: string }[] = [
  { at: cue.model.lines[0], text: "CA-00001445", tint: color.onBgMuted },
  { at: cue.model.lines[2], text: "› picked up", tint: color.accent },
  { at: cue.model.lines[3], text: "1011548.CATPart" },
  { at: cue.model.lines[5], text: "bodies ······· 1" },
  { at: cue.model.lines[6], text: "hidden ······· 0 PASS" },
  { at: cue.model.lines[7], text: "sketches ····· 0 PASS" },
];
const TYPE = 0.012;

function Typed({ t, at, text, tint }: { t: number; at: number; text: string; tint?: string }) {
  const count = Math.max(0, Math.min(text.length, Math.floor((t - at) / TYPE)));
  const shown = text.slice(0, count);
  const pass = shown.endsWith("PASS") ? shown.length - 4 : -1;
  return (
    <span style={{ color: tint }}>
      {pass > 0 ? (
        <>
          {shown.slice(0, pass)}
          <span style={{ color: color.pass }}>PASS</span>
        </>
      ) : (
        shown
      )}
      {count > 0 && count < text.length ? <span style={{ color: color.accent }}>▍</span> : null}
    </span>
  );
}

export function Model3D({ t }: { t: number }) {
  const { model } = cue;
  if (t < model.in || t > model.out + 0.14) return null;
  const enter = clamp01(step(t - model.in, ui));
  const leave = clamp01((t - model.out) / 0.12);
  const u = enter * (1 - leave);
  const yaw = (-38 + (t - model.in) * 20) * (Math.PI / 180);
  const draw = Easing.out(Easing.cubic)(progress(t, model.in, 0.9));
  const scanX = -200 + 420 * Easing.inOut(Easing.quad)(progress(t, model.scan, model.scanEnd - model.scan));
  const scanning = t >= model.scan && t <= model.scanEnd;

  const segs = EDGES.map(([a, b]) => {
    const p = project(a, yaw);
    const q = project(b, yaw);
    const near = (p.depth + q.depth) / 2;
    return { p, q, near };
  });
  const plane = scanning ? ([[scanX, -140, -170], [scanX, 140, -170], [scanX, 140, 50], [scanX, -140, 50]] as const).map((v) => project(v, yaw)) : null;
  const dimA = project([-180, -120 - 50, 0], yaw);
  const dimB = project([180, -120 - 50, 0], yaw);
  const axes = ([[70, 0, 0, "#E5675A", "X"], [0, 70, 0, color.pass, "Y"], [0, 0, 70, color.accent, "Z"]] as const).map(([x, y, z, tint, name]) => {
    const o = { x: 1640, y: 900 };
    const x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
    const y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
    return { tint, name, x: o.x + x1, y: o.y - (z * Math.cos(PITCH) + y1 * Math.sin(PITCH)), ox: o.x, oy: o.y };
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: u, filter: u < 0.98 ? `blur(${(1 - u) * 12}px)` : undefined }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {plane ? <path d={`M${plane.map((p) => `${p.x} ${p.y}`).join(" L")} Z`} fill="#4A85B91F" stroke={color.accent} strokeWidth={1.5} /> : null}
        <g strokeLinecap="round">
          {segs.map(({ p, q, near }, index) => {
            const k = index / segs.length;
            if (k > draw) return null;
            const cut = scanning && Math.abs(((p.x + q.x) / 2 - project([scanX, 0, 0], yaw).x)) < 26;
            return <line key={index} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={cut ? color.accent : color.onBg} strokeOpacity={0.45 + 0.5 * clamp01(0.5 - near / 400)} strokeWidth={cut ? 3 : 1.8} />;
          })}
        </g>
        <g stroke={color.onBgMuted} strokeWidth={1.2} fill={color.onBgMuted} opacity={draw}>
          <line x1={dimA.x} y1={dimA.y} x2={dimB.x} y2={dimB.y} />
          <circle cx={dimA.x} cy={dimA.y} r={3} />
          <circle cx={dimB.x} cy={dimB.y} r={3} />
          <text x={(dimA.x + dimB.x) / 2} y={(dimA.y + dimB.y) / 2 + 30} fontFamily={font.mono} fontSize={20} stroke="none" textAnchor="middle">360</text>
        </g>
        {axes.map((a) => (
          <g key={a.name}>
            <line x1={a.ox} y1={a.oy} x2={a.x} y2={a.y} stroke={a.tint} strokeWidth={3} strokeLinecap="round" />
            <text x={a.x + (a.x - a.ox) * 0.25} y={a.y + (a.y - a.oy) * 0.25 + 6} fill={a.tint} fontFamily={font.mono} fontSize={18} textAnchor="middle">{a.name}</text>
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 1420, top: 150, fontFamily: font.mono, fontSize: 24, color: "#6F8499", lineHeight: 1.6, textAlign: "right", width: 440 }}>
        <div>1011548 · REV A</div>
        <div>YAW {((yaw * 180) / Math.PI).toFixed(1)}°</div>
        <div>{scanning ? `SECTION X = ${scanX.toFixed(0)} mm` : "SECTION —"}</div>
      </div>

      <div style={{ position: "absolute", left: 90, top: 150, width: 640, fontFamily: font.mono, fontSize: 42, color: color.onBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <Mark size={52} check={clamp01((t - model.lines[2]) / 0.3)} />
          <span style={{ fontFamily: font.sans, fontSize: 56, fontWeight: 600, letterSpacing: "-0.02em" }}>3D model</span>
        </div>
        {LINES.map((line, index) => (
          <div key={index} style={{ height: 76, whiteSpace: "nowrap" }}>
            <Typed t={t} at={line.at} text={line.text} tint={line.tint} />
          </div>
        ))}
      </div>
      {/* The verdict, big enough to read on a phone: a stamp, not a fade. */}
      {t >= model.lines[8] + 0.2 ? (
        <div style={{ position: "absolute", left: 90, top: 820, fontFamily: font.mono, fontSize: 88, fontWeight: 500, color: color.pass, scale: String(1.25 - 0.25 * clamp01(step(t - model.lines[8] - 0.2, { stiffness: 400, damping: 28 }))), transformOrigin: "0 50%" }}>
          ✓ 3D PASS
        </div>
      ) : null}
    </div>
  );
}
