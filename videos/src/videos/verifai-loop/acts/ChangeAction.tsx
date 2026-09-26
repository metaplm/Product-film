import { Img, staticFile } from "remotion";

import { clamp01 } from "../../../kit/time";
import { color, font } from "../../../tokens";
import { cue } from "../cues";
import { swap } from "../ui/Button";
import { Mark } from "../ui/Mark";
import { Chip, HEADER, Panel, type Box } from "../ui/Panel";
import { Spinner } from "../ui/Spinner";

/**
 * Bars 3 and 4: a Change Action with its physical products reaches the
 * approval route, and VerifAI picks the task up on its own (enovia_poller.py:
 * pending "Approve" inbox tasks → Change Action → products and drawings).
 * Products are the live run's CA-00001445: 3 products, 2 drawings.
 */
const PRODUCTS = [
  { id: "1011548", rev: "A", drawing: true },
  { id: "1011549", rev: "A", drawing: true },
  { id: "1006311", rev: "A", drawing: false },
] as const;
export const caBox: Box = { x: 260, y: 170, w: 1400, h: 740 };
const ROW_Y = HEADER + 96;
const ROW_H = 104;

export function ChangeAction({ t }: { t: number }) {
  const { ca } = cue;
  const picked = t >= ca.pickup;
  return (
    <Panel
      t={t}
      box={caBox}
      from={ca.in}
      to={ca.out}
      header={
        <>
          <span style={{ fontSize: 30, fontWeight: 600 }}>Change Action</span>
          <span style={{ fontFamily: font.mono, fontSize: 24, color: "#CFE3F2" }}>CA-00001445</span>
          <span style={{ marginLeft: "auto" }}>
            <Chip fill="#FFFFFF" ink={color.headerMid}>
              In Approval
            </Chip>
          </span>
        </>
      }
    >
      <div style={{ position: "absolute", left: 40, top: HEADER + 40, fontSize: 22, color: color.textMuted, fontWeight: 500 }}>Proposed changes · 3 products</div>
      {PRODUCTS.map((product, index) => {
        const enter = swap(t, ca.rows[index]);
        const queued = t >= ca.queued[index];
        return (
          <div key={product.id} style={{ position: "absolute", left: 40, right: 40, top: ROW_Y + index * ROW_H, height: ROW_H - 12, display: "flex", alignItems: "center", gap: 24, padding: "0 24px", borderRadius: 10, background: color.paperAlt, ...enter }}>
            <Img src={staticFile("brand/VPMReference.png")} style={{ width: 72, height: 54 }} />
            <div>
              <div style={{ fontFamily: font.mono, fontSize: 30, fontWeight: 500 }}>{product.id}</div>
              <div style={{ fontSize: 20, color: color.textMuted, marginTop: 2 }}>Physical Product · Rev {product.rev}</div>
            </div>
            {product.drawing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 36, fontSize: 20, color: color.textMuted }}>
                <Img src={staticFile("brand/Drawing.png")} style={{ width: 48, height: 36 }} /> Drawing
              </span>
            ) : null}
            <span style={{ marginLeft: "auto", display: "grid", justifyItems: "end" }}>
              <span style={{ gridArea: "1 / 1", ...(queued ? swap(t, ca.queued[index]) : { opacity: 0 }) }}>
                <Chip fill="#E6F1F8" ink={color.brand}>
                  <Mark size={24} tone="light" /> Queued for VerifAI
                </Chip>
              </span>
            </span>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 40, right: 40, top: ROW_Y + 3 * ROW_H + 26, height: 1, background: color.line, opacity: swap(t, ca.route - 0.2).opacity }} />
      <div style={{ position: "absolute", left: 40, top: ROW_Y + 3 * ROW_H + 50, fontSize: 22, color: color.textMuted, fontWeight: 500, ...swap(t, ca.route - 0.2) }}>Approval route</div>
      <div
        data-target="route-task"
        style={{ position: "absolute", left: 40, right: 40, top: ROW_Y + 3 * ROW_H + 96, height: 104, display: "flex", alignItems: "center", gap: 24, padding: "0 24px", borderRadius: 10, border: `2px solid ${picked ? color.brand : color.line}`, boxSizing: "border-box", ...swap(t, ca.route) }}
      >
        <Img src={staticFile("brand/Route.png")} style={{ width: 72, height: 54 }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>Approve</div>
          <div style={{ fontSize: 20, color: color.textMuted, marginTop: 2 }}>Route task · started</div>
        </div>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14, fontSize: 24, fontWeight: 600, color: color.brand, opacity: picked ? clamp01(swap(t, ca.pickup).opacity) : 0 }}>
          <Mark size={36} tone="light" check={clamp01((t - ca.pickup) / 0.3)} />
          VerifAI picked it up
          <Spinner t={t} size={28} tint={color.brand} track={color.lineSoft} />
        </span>
      </div>
    </Panel>
  );
}
