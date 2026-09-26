import { move } from "../../../kit/move";
import { step } from "../../../kit/spring";
import { clamp01, progress } from "../../../kit/time";
import { color, font, radius, ui } from "../../../tokens";
import { cue } from "../cues";
import { action, apply, ignore, listNarrow, main, panel, rowY, rows } from "../layout";
import { Button, swap } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { Status, type State } from "../ui/Status";

/** Demo rules for BRK-2041. Row 4 fails, row 6 warns. */
const RULES = [
  { name: "Material assigned", detail: "Al 6061-T6", result: "pass" },
  { name: "Mass properties set", detail: "0.184 kg", result: "pass" },
  { name: "Title block complete", detail: "12 / 12 fields", result: "pass" },
  { name: "Hole diameter ≥ 3.0 mm", detail: "HOLE-04: 2.5 mm", result: "fail" },
  { name: "Naming convention", detail: "BRK-2041", result: "pass" },
  { name: "Drawing tolerances", detail: "2 dims on default", result: "warn" },
] as const;
const ISSUE = 3;
const FIX = "Increase HOLE-04 to 3.2 mm. It clears M3 screws and meets rule MP-DR-012.".split(" ");

export const runButton = action(220);

function stateOf(index: number, t: number): { state: State; since: number } {
  const at = cue.rules[index];
  if (index === ISSUE && t >= cue.detail.fixed) return { state: "pass", since: cue.detail.fixed };
  if (t >= at) return { state: RULES[index].result, since: at };
  if (t >= Math.max(cue.run.click, at - 0.5)) return { state: "checking", since: 0 };
  return { state: "idle", since: 0 };
}

/** Bars 3 to 7: run the rule check, open the failed rule, read and apply the suggested fix. */
export function RuleCheck({ t }: { t: number }) {
  const counts = { pass: 0, fail: 0, warn: 0 };
  RULES.forEach((_, index) => {
    const { state } = stateOf(index, t);
    if (state === "pass" || state === "fail" || state === "warn") counts[state]++;
  });
  const started = t >= cue.rules[0];
  const narrow = step(t - cue.detail.in, ui);
  const listW = main.w + (listNarrow - main.w) * narrow;
  const detailsFade = 1 - clamp01((t - cue.detail.in) / 0.15);
  const checking = t >= cue.run.click && t < cue.run.done;

  // The failed rule's status mark travels from its row into the panel header.
  const iconFrom = { x: main.x + 20, y: rowY(ISSUE) + (rows.h - rows.icon) / 2, w: rows.icon, h: rows.icon };
  const iconTo = { x: panel.x + 32, y: panel.y + 32, w: 48, h: 48 };
  const traveler = move(t, cue.detail.in, iconFrom, iconTo);
  const issue = stateOf(ISSUE, t);

  return (
    <>
      <div style={{ position: "absolute", left: main.x, top: main.y, fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>Rule check</div>
      <div style={{ position: "absolute", left: main.x, top: main.y + 56, fontFamily: font.mono, fontSize: 22, color: color.muted, display: "grid" }}>
        <span style={{ gridArea: "1 / 1", opacity: started ? 0 : 1 }}>BRK-2041 · 6 design rules</span>
        <span style={{ gridArea: "1 / 1", ...(started ? swap(t, cue.rules[0]) : { opacity: 0 }) }}>
          <span style={{ color: color.accent }}>{counts.pass} passed</span> · <span style={{ color: counts.fail ? color.fail : color.muted }}>{counts.fail} failed</span> · <span style={{ color: counts.warn ? color.warn : color.muted }}>{counts.warn} warning</span>
        </span>
      </div>

      {/* The detail panel takes this corner, so the run button leaves as it opens. */}
      <div style={{ opacity: detailsFade }}>
      <Button box={runButton} t={t} press={cue.run.click} target="run">
        {checking ? (
          <span key="busy" style={{ display: "flex", alignItems: "center", gap: 12, ...swap(t, cue.run.click) }}>
            <Spinner t={t} size={26} tint={color.accentInk} /> Checking
          </span>
        ) : (
          <span key="idle" style={t >= cue.run.done ? swap(t, cue.run.done) : undefined}>Run check</span>
        )}
      </Button>
      </div>

      {RULES.map((rule, index) => {
        const { state, since } = stateOf(index, t);
        const selected = index === ISSUE && t >= cue.openIssue;
        const hideIcon = index === ISSUE && t >= cue.detail.in;
        return (
          <div
            key={rule.name}
            data-target={index === ISSUE ? "issue-row" : undefined}
            style={{
              position: "absolute",
              left: main.x,
              top: rowY(index),
              width: listW,
              height: rows.h,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 20px",
              boxSizing: "border-box",
              borderRadius: radius.control,
              background: selected ? color.raised : undefined,
              boxShadow: index > 0 && !selected && !(index === ISSUE + 1 && t >= cue.openIssue) ? `inset 0 1px 0 ${color.border}` : undefined,
            }}
          >
            <span style={{ opacity: hideIcon ? 0 : 1, display: "flex" }}>
              <Status state={state} since={since} t={t} />
            </span>
            <span style={{ fontSize: 26, whiteSpace: "nowrap" }}>{rule.name}</span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: font.mono,
                fontSize: 22,
                color: state === "fail" ? color.fail : state === "warn" ? color.warn : color.muted,
                opacity: (t >= cue.rules[index] ? swap(t, cue.rules[index]).opacity : 0) * detailsFade,
                whiteSpace: "nowrap",
              }}
            >
              {rule.detail}
            </span>
          </div>
        );
      })}

      {t >= cue.detail.in ? <Detail t={t} /> : null}
      {t >= cue.detail.in ? (
        <div style={{ position: "absolute", left: traveler.x, top: traveler.y, width: traveler.w, height: traveler.h, display: "flex" }}>
          <div style={{ scale: String(traveler.w / rows.icon), transformOrigin: "0 0" }}>
            <Status state={issue.state} since={issue.since} t={t} />
          </div>
        </div>
      ) : null}
    </>
  );
}

function Detail({ t }: { t: number }) {
  const { detail } = cue;
  const enter = step(t - detail.in, ui);
  const fixed = t >= detail.fixed;
  const fact = (index: number) => swap(t, detail.facts + index * 0.25);
  const facts = [
    ["Feature", "HOLE-04", color.fg],
    ["Measured", fixed ? "3.2 mm" : "2.5 mm", fixed ? color.accent : color.fail],
    ["Required", "≥ 3.0 mm", color.fg],
  ] as const;
  const applying = t >= detail.apply && t < detail.fixed;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: clamp01(enter), translate: `${(1 - enter) * 40}px 0` }}>
      <div style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.w, height: panel.h, borderRadius: radius.window - 4, background: color.raised, border: `1px solid ${color.border}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: panel.x + 100, top: panel.y + 30, display: "grid", fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>
        <span style={{ gridArea: "1 / 1", opacity: fixed ? 0 : 1 }}>Hole diameter below minimum</span>
        <span style={{ gridArea: "1 / 1", ...(fixed ? swap(t, detail.fixed) : { opacity: 0 }) }}>Hole diameter within rule</span>
      </div>
      <div style={{ position: "absolute", left: panel.x + 100, top: panel.y + 72, fontFamily: font.mono, fontSize: 20, color: color.muted }}>Rule MP-DR-012</div>
      {facts.map(([label, value, tint], index) => (
        <div key={label} style={{ position: "absolute", left: panel.x + 32, top: panel.y + 140 + index * 54, width: panel.w - 64, display: "flex", fontSize: 24, ...fact(index) }}>
          <span style={{ color: color.muted, width: 180 }}>{label}</span>
          <span style={{ fontFamily: font.mono, color: tint }}>{value}</span>
        </div>
      ))}
      <div style={{ position: "absolute", left: panel.x + 32, top: panel.y + 318, width: panel.w - 64, height: 1, background: color.border }} />
      <div style={{ position: "absolute", left: panel.x + 32, top: panel.y + 346, fontSize: 22, color: color.accent, fontWeight: 500, ...swap(t, detail.fixWords - 0.25) }}>✦ Suggested fix</div>
      <div style={{ position: "absolute", left: panel.x + 32, top: panel.y + 394, width: panel.w - 64, fontSize: 28, lineHeight: 1.45 }}>
        {FIX.map((word, index) => {
          const u = progress(t, detail.fixWords + index * 0.09, 0.2);
          return (
            <span key={index} style={{ opacity: u, filter: u < 1 ? `blur(${(1 - u) * 6}px)` : undefined }}>
              {word}{" "}
            </span>
          );
        })}
      </div>
      <div style={{ opacity: swap(t, detail.fixWords + 0.6).opacity }}>
        <Button box={apply} t={t} press={detail.apply} target="apply">
          {applying ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Spinner t={t} size={24} tint={color.accentInk} /> Applying
            </span>
          ) : fixed ? (
            <span style={swap(t, detail.fixed)}>Applied</span>
          ) : (
            "Apply fix"
          )}
        </Button>
        <Button box={ignore} kind="ghost" t={t}>
          Ignore
        </Button>
      </div>
    </div>
  );
}
