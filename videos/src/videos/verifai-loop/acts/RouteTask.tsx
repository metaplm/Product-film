import { Img, staticFile } from "remotion";

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
export const taskBox: Box = { x: 420, y: 150, w: 1080, h: 780 };
export const reject = { x: taskBox.x + 40, y: taskBox.y + 620, w: 260, h: 68 };
const approve = { x: reject.x + reject.w + 20, y: reject.y, w: 260, h: 68 };

export function RouteTask({ t }: { t: number }) {
  const { task, report } = cue;
  const returned = t >= task.returned;
  const rejecting = t >= task.reject;
  return (
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
              <Chip fill={color.fail} ink="#FFFFFF">Returned to designer</Chip>
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
          <div style={{ fontSize: 30, marginTop: 10 }}>
            <span style={{ color: color.pass, fontWeight: 600 }}>35 passed</span> · <span style={{ color: color.fail, fontWeight: 600 }}>12 failed</span>
          </div>
          <div style={{ fontSize: 24, color: color.textMuted, marginTop: 8 }}>Title block approvals missing on 1011548.</div>
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
          <div style={{ fontSize: 24, fontWeight: 600 }}>Your decision</div>
          <div style={{ fontSize: 20, color: color.textMuted, marginTop: 2 }}>The engineer approves or rejects.</div>
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
  );
}
