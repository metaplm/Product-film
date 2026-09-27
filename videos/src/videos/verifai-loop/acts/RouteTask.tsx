import { Img, staticFile } from "remotion";

import { clamp01 } from "../../../kit/time";
import { color, font } from "../../../tokens";
import { cue } from "../cues";
import { Button, swap } from "../ui/Button";
import { Mark } from "../ui/Mark";
import { Chip, HEADER, Panel, type Box } from "../ui/Panel";
import { AttachmentRow, attachment } from "./Report";

/**
 * Bars 11 and 12: the route task with VerifAI's pre-check and the report
 * attached (add_task_reference). The engineer makes the call: "the robot
 * inspects and reports; the final decision belongs to the engineer"
 * (PRODUCT_OVERVIEW.md).
 */
export const taskBox: Box = { x: 160, y: 150, w: 1080, h: 780 };
export const reject = { x: taskBox.x + 40, y: taskBox.y + 600, w: 320, h: 96 };
const approve = { x: reject.x + reject.w + 24, y: reject.y, w: 320, h: 96 };

export function RouteTask({ t }: { t: number }) {
  const { task, report } = cue;
  const back = t >= task.returned;
  const returned = t >= task.returned;
  const rejecting = t >= task.reject;
  return (
    <>
    <Returned t={t} show={back} />
    <Panel
      t={t}
      box={taskBox}
      from={task.in}
      to={task.out}
      header={
        <>
          <Img src={staticFile("brand/Route.png")} style={{ width: 56, height: 42 }} />
          <span style={{ fontSize: 30, fontWeight: 600 }}>Approve</span>
          <span style={{ fontFamily: font.mono, fontSize: 24, color: "#CFE3F2" }}>CA-00001445</span>
          <span style={{ marginLeft: "auto", display: "grid", justifyItems: "end" }}>
            <span style={{ gridArea: "1 / 1", opacity: returned ? 0 : 1 }}>
              <Chip fill="#FFFFFF" ink={color.headerMid}>In Approval</Chip>
            </span>
            <span style={{ gridArea: "1 / 1", ...(returned ? swap(t, task.returned) : { opacity: 0 }) }}>
              <Chip fill={color.fail} ink="#FFFFFF" style={{ fontSize: 28, padding: "8px 20px" }}>Returned to designer</Chip>
            </span>
          </span>
        </>
      }
    >
      <div style={{ position: "absolute", left: 40, right: 40, top: HEADER + 40, display: "flex", gap: 20, ...swap(t, task.comment) }}>
        <Mark size={48} tone="light" />
        <div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>
            VerifAI <span style={{ color: color.textMuted, fontWeight: 400 }}>· pre-check</span>
          </div>
          <div style={{ fontSize: 46, marginTop: 8, fontWeight: 600, letterSpacing: "-0.01em" }}>
            <span style={{ color: color.pass }}>35 passed</span> · <span style={{ color: color.fail }}>12 failed</span>
          </div>
          <div style={{ fontSize: 28, color: color.textMuted, marginTop: 8 }}>Title block approvals missing on 1011548.</div>
        </div>
      </div>
      {/* The report lands here (see Report.tsx); this row takes over once it has. */}
      <div style={{ position: "absolute", left: attachment.x - taskBox.x, top: attachment.y - taskBox.y, opacity: t > report.shrink + 0.5 ? 1 : 0 }}>
        <AttachmentRow />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 430, height: 1, background: color.line }} />
      <div style={{ position: "absolute", left: 40, top: 462, display: "flex", alignItems: "center", gap: 16, ...swap(t, task.comment + 0.5) }}>
        <span style={{ width: 52, height: 52, borderRadius: 26, background: color.lineSoft, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700, color: color.brand }}>EN</span>
        <div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>Your decision</div>
          <div style={{ fontSize: 24, color: color.textMuted, marginTop: 2 }}>The engineer approves or rejects.</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: -taskBox.x, top: -taskBox.y, width: 1920, height: 1080, ...swap(t, task.comment + 0.5) }}>
        <Button box={reject} fill={color.fail} ink="#FFFFFF" t={t} press={task.reject} target="reject">
          {rejecting ? <span style={swap(t, task.reject + 0.1)}>Rejected</span> : "Reject"}
        </Button>
        <div style={{ opacity: rejecting ? 0.35 : 1 }}>
          <Button box={approve} fill={color.paper} ink={color.pass} border={color.pass} t={t}>
            Approve
          </Button>
        </div>
      </div>
    </Panel>
    </>
  );
}

/** The route going back: a line drawn from the task to a big "designer" end, on the film ground. */
function Returned({ t, show }: { t: number; show: boolean }) {
  const { task } = cue;
  if (!show || t > task.out + 0.14) return null;
  const leave = clamp01((t - task.out) / 0.12);
  const draw = clamp01((t - task.returned) / 0.45);
  const label = clamp01((t - task.returned - 0.35) / 0.2);
  const y = taskBox.y + 120;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - leave, filter: leave > 0 ? `blur(${leave * 12}px)` : undefined }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${taskBox.x + taskBox.w} ${y} H${1580}`} stroke={color.fail} strokeWidth={4} fill="none" strokeDasharray={`${(1580 - taskBox.x - taskBox.w) * draw} 2000`} />
        {draw >= 1 ? <path d={`M1580 ${y} l-20 -12 v24 Z`} fill={color.fail} /> : null}
      </svg>
      <div style={{ position: "absolute", left: 1600, top: y - 70, fontFamily: font.mono, color: "#E5675A", opacity: label, translate: `${(1 - label) * 20}px 0`, lineHeight: 1.1 }}>
        <div style={{ fontSize: 30, color: color.onBgMuted }}>BACK TO</div>
        <div style={{ fontSize: 64, fontWeight: 500 }}>DESIGN</div>
      </div>
    </div>
  );
}
