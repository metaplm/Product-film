# Verifai video kit

The look, rules, assets and code for every Verifai film. Each film prompt points here and only adds its story.
Sources: product owner interview (2026-09-26). Verifai has no repo, design system or landing page yet, so every visual rule below is a **film default** chosen for this kit. The product owner can overrule any of them; when a real design system exists, it wins.

## The brief (from the interview)
- Plays: landing page, muted loop. Format: 16:9, 1920x1080. Length: 30 s.
- Music: silent (120 BPM invisible grid).
- Must show: automated rule check, issue detail with a suggested fix, compliance report / score, approval (release) flow.
- Language: English.
- Ingredients: logo animation (the mark draws itself) · big punchlines between scenes, word by word · magic move (fail mark into the detail panel) and blur swaps / cuts on bars · user cursor clicks.
- Ending: "Verified before release." then the Verifai lockup. No URL or CTA (none given).

## Hard rules
- Casing: sentence case in UI and punchlines. (default)
- Type: Inter for UI and words; JetBrains Mono only for IDs, measurements, rule codes and counters. (default)
- Corners: window 20 px, controls 12 px, pills full. (default)
- Surfaces: background `#0a0b0d`; the app window `#111418`; raised panels and selected rows `#171b21`. Nothing else. (default)
- Borders and shadows: 1 px `#242a33` for window, panel and dividers. No shadows, no glows. (default)
- Copy: short, plain, no exclamation marks, no em dashes in scenes. (default)

## Frame (1920x1080, 60 fps, dark)
- Framing: full bleed background, the app window centered at 160,110 (1600x860).
- Words: Inter 600, 140 to 150 px, key word in the accent.
- Scenes: UI text only; body 24 px and up, titles 30 to 38 px.

## Color
| Token | Value | Use |
|---|---|---|
| background | `#0a0b0d` | page, punchlines |
| foreground | `#f2f5f8` | text |
| muted foreground | `#8a93a0` | secondary text, idle states |
| surface | `#111418` | app window |
| raised | `#171b21` | detail panel, selected row, ghost button |
| border | `#242a33` | window, dividers, tracks |
| accent | `#34e2a0` | verified / pass, primary button, "ai" in the wordmark |
| accent ink | `#04130d` | text and glyphs on the accent |
| fail | `#ff5c5c` | failed rule |
| warn | `#f4b740` | warning |

## Type
- Inter 400/500/600/700 and JetBrains Mono 400/500, from `@fontsource`, copied to `public/fonts` by `scripts/copy-fonts.sh`.

## Signature elements
| Element | Look | In films |
|---|---|---|
| Buttons | accent fill, 60 px high, fixed width | loading shows a spinner + verb, width kept |
| Status marks | 34 px circle: ring (idle), spinner (checking), filled tone with glyph (pass / fail / warn) | pop in on the result beat |
| Spinner | 90° arc | frame-driven, 1.6 turns per second |

## Logo and brand element
- Logo: `ui/Mark.tsx`, a hex part outline with a check. Draws (hex stroke, check stroke), then floods with the accent. Wordmark "Verif" + "ai" in the accent.
- Mascot: none.

## Cursors
- User: the macOS arrow (`kit/cursor.tsx`). Clicks land beside labels, never over words being read.

## Components (all redrawn; there is no product code yet)
| Need | Component | Why |
|---|---|---|
| App shell | `acts/Window.tsx` | redraw |
| Rule list, detail panel | `acts/RuleCheck.tsx` | redraw, frame-driven |
| Score ring, category bars | `acts/Report.tsx` | redraw |
| Release route | `acts/Route.tsx` | redraw |

## Motion
- UI spring stiffness 220, damping 26; pops stiffness 320, damping 22; magic move 150 / 20.
- Punchline words: blur 16 px, rise 36 px, 0.3 s on `cubic-bezier(0.22, 1, 0.36, 1)`.

## Claims (confirm with the product owner)
- Films show: Verifai checks CAD / PLM data (parts, metadata, drawings) against design rules, explains a failed rule, suggests a fix, reports a compliance score, and feeds a release route where a **person** approves.
- To confirm: whether "Apply fix" is a real action in Verifai (it may only suggest). If not, the button becomes "Create task".
- Demo data is invented: BRK-2041, HOLE-04, rule MP-DR-012, change CA-0142, 96%.
- Films never show: release without human approval, partner or vendor logos (none approved).

## Workspace
- `videos/`, Remotion 4.0.529 pinned, React 19. No Tailwind.
- Scripts: `stills.ts`, `render.ts` (`--silent` for films without music), `verify.py`, `beat-sheet.ts`.
- In sandboxes without Remotion's Chrome download: `REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell`.
