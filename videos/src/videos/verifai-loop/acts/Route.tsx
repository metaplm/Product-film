import { interpolateColors } from "remotion";

import { step } from "../../../kit/spring";
import { clamp01 } from "../../../kit/time";
import { color, font, pop, radius, ui } from "../../../tokens";
import { cue } from "../cues";
import { action, main } from "../layout";
import { Button, swap } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { Status, type State } from "../ui/Status";

export const sendButton = action(290);
const STEP_Y = main.y + 170;
const STEP_GAP = 170;
const NODE = 48;

/** Bars 11 and 12: send to approval, a person approves, the part is released on the strongest beat. */
export function Route({ t, to }: { t: number; to: number }) {
  const { route } = cue;
  if (t < route.in || t > to + 0.14) return null;
  const enter = clamp01(step(t - route.in, ui));
  const leave = clamp01((t - to) / 0.12);
  const u = enter * (1 - leave);
  const released = t >= route.released;
  const sending = t >= route.send && t < route.sent;

  const steps: { title: string; sub: string; state: State; since: number; pill: string; tone: string }[] = [
    { title: "Verifai check", sub: "96% · 0 failed · 1 warning", state: "pass", since: route.in, pill: "Passed", tone: color.accent },
    t >= route.approved
      ? { title: "Design review", sub: "Design lead", state: "pass", since: route.approved, pill: "Approved", tone: color.accent }
      : t >= route.sent
        ? { title: "Design review", sub: "Design lead", state: "checking", since: 0, pill: "Waiting", tone: color.muted }
        : { title: "Design review", sub: "Design lead", state: "idle", since: 0, pill: "Not started", tone: color.muted },
    released
      ? { title: "Release", sub: "Change CA-0142", state: "pass", since: route.released, pill: "Released", tone: color.accent }
      : t >= route.released - 0.5
        ? { title: "Release", sub: "Change CA-0142", state: "checking", since: 0, pill: "Releasing", tone: color.muted }
        : { title: "Release", sub: "Change CA-0142", state: "idle", since: 0, pill: "Not started", tone: color.muted },
  ];
  const lineFill = [clamp01(step(t - route.approved, ui)), clamp01(step(t - route.released, ui))];
  const chipPop = released ? 0.8 + 0.2 * step(t - route.released, pop) : 1;
  const chipTone = interpolateColors(clamp01((t - route.released) / 0.15), [0, 1], [color.raised, color.accent]);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: u, filter: u < 0.98 ? `blur(${(1 - u) * 10}px)` : undefined }}>
      <div style={{ position: "absolute", left: main.x, top: main.y, display: "flex", alignItems: "center", gap: 22 }}>
        <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>Release route</span>
        <span
          data-target="lifecycle"
          style={{
            display: "grid",
            fontFamily: font.mono,
            fontSize: 22,
            padding: "8px 18px",
            borderRadius: radius.pill,
            background: chipTone,
            color: released ? color.accentInk : color.muted,
            scale: String(chipPop),
          }}
        >
          <span style={{ gridArea: "1 / 1", opacity: released ? 0 : 1 }}>In work</span>
          <span style={{ gridArea: "1 / 1", ...(released ? swap(t, route.released) : { opacity: 0 }) }}>Released</span>
        </span>
      </div>
      <div style={{ position: "absolute", left: main.x, top: main.y + 56, fontFamily: font.mono, fontSize: 22, color: color.muted }}>BRK-2041 · Rev B</div>

      <Button box={sendButton} t={t} press={route.send} kind={t >= route.sent ? "ghost" : "primary"} target="send">
        {sending ? (
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Spinner t={t} size={26} tint={color.accentInk} /> Sending
          </span>
        ) : t >= route.sent ? (
          <span style={swap(t, route.sent)}>Sent for approval</span>
        ) : (
          "Send to approval"
        )}
      </Button>

      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        {[0, 1].map((index) => {
          const x = main.x + NODE / 2;
          const y1 = STEP_Y + index * STEP_GAP + NODE + 12;
          const y2 = STEP_Y + (index + 1) * STEP_GAP - 12;
          return (
            <g key={index}>
              <line x1={x} y1={y1} x2={x} y2={y2} stroke={color.border} strokeWidth={3} strokeLinecap="round" />
              <line x1={x} y1={y1} x2={x} y2={y1 + (y2 - y1) * lineFill[index]} stroke={color.accent} strokeWidth={3} strokeLinecap="round" opacity={lineFill[index] > 0.01 ? 1 : 0} />
            </g>
          );
        })}
      </svg>

      {steps.map((item, index) => (
        <div key={item.title} style={{ position: "absolute", left: main.x, top: STEP_Y + index * STEP_GAP, width: main.w, height: NODE, display: "flex", alignItems: "center", gap: 28 }}>
          <Status state={item.state} since={item.since} t={t} size={NODE} />
          <div>
            <div style={{ fontSize: 30, fontWeight: 600 }}>{item.title}</div>
            <div style={{ fontSize: 22, color: color.muted, marginTop: 6 }}>{item.sub}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
            {index === 1 ? (
              <span style={{ width: 48, height: 48, borderRadius: 24, background: color.raised, border: `1px solid ${color.border}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 600, color: color.fg }}>
                DL
              </span>
            ) : null}
            <span key={item.pill} style={{ fontFamily: font.mono, fontSize: 22, color: item.tone, width: 170, textAlign: "right", ...(item.since ? swap(t, item.since) : {}) }}>
              {item.pill}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
