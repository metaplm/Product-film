# VerifAI video kit

The look, rules, assets and code for every VerifAI film. Each film prompt points here and only adds its story.
Sources, in order of authority:
- product owner (interview, 2026-09-26)
- the VerifAI logo page (claude.ai artifact "VerifAI logo tasarımı": direction 1b "Denetim mührü", wordmark 2A)
- Webrazzi Summit 2026 application doc (product summary, stage)
- `metaplm/metachecker-mvp` (PRODUCT_OVERVIEW.md, ARCHITECTURE.md, checklist.yaml, ca_reporter.py, annotator.py, BENCHMARK_2026-06-06.md)
- `metaplm/metachecker-widget` (plugins/vuetify.js, app.vue, ChecklistList.vue)
In code the product is still called MetaChecker; films say **VerifAI**.

## The brief (from the interview)
- Plays: landing page, muted loop. 16:9, 1920x1080. 30 s. Silent (120 BPM grid). English.
- Must show: automated rule check, finding detail, the report / score, the approval route.
- Ingredients: logo animation · big punchlines word by word · blur swaps on bars and one magic move (report → route-task attachment) · one user cursor (the engineer's decision).
- Ending: "Caught before production." then the VerifAI lockup "by MetaPLM".

## What VerifAI is (claims)
- Checks CAD models and technical drawings in 3DEXPERIENCE with AI and catches design errors before production (Webrazzi doc).
- Unit of work: a Change Action. It is picked up from the approval route (pending "Approve" inbox task), its physical products, drawings and 3D models are inspected by 2D, 3D, PLM and Authority agents, and one grouped PDF report is attached to the route task (metachecker-mvp).
- "Robot inceler ve raporlar — nihai karar her zaman mühendise aittir" (PRODUCT_OVERVIEW.md). It can also run fully autonomously (Webrazzi doc). The film shows the engineer deciding.
- Checks "in minutes" (PRODUCT_OVERVIEW.md; benchmark: 140 s per CA).
- On-prem capable (Webrazzi doc, HARDWARE_ONPREM.md). Not shown in this cut.
- Demo data is real run data: CA-00001445 (3 products, 2 drawings, PASS 35 / FAIL 12), part 1011548 Rev A 1:2. The drawing sheet itself is redrawn, and its findings are illustrative.
- Never show: automatic production release, customer names or logos, accuracy figures.

## Color
| Token | Value | Source |
|---|---|---|
| film ground | `#0B1620` | logo page, dark test |
| brand blue | `#0E5A8A` | logo page (MetaPLM blue) |
| mark on dark, "AI" on dark | `#4A85B9` | logo page, dark variant |
| sky | `#1F93CE` | widget secondary |
| header gradient | `#012F4D → #015686 → #1F93CE` | widget app.vue |
| paper / alt / line | `#FFFFFF` / `#F7F8FA` / `#DDE1E8` | logo page neutrals |
| text / muted | `#0B1620` / `#6E7785` | logo page |
| report navy | `#1A2744` | ca_reporter.py |
| PASS / FAIL / partial | `#27AE60` / `#C0392B` / `#E67E22` | ca_reporter.py, annotator.py |
| agents 2D / 3D / PLM / CROSS | `#3949AB` / `#546E7A` / `#2E7D32` / `#EF6C00` | ChecklistList.vue |

## Type
- Inter 600 with -0.04em tracking for the wordmark (logo 2A) and the punchlines. Inter for UI. JetBrains Mono for IDs, part numbers and drawing text.

## Logo
- Mark: four solid corner blocks (crop marks) around a check, 64x64 paths from the logo page (`ui/Mark.tsx`). In the film the blocks snap in from outside, then the check draws.
- Wordmark: "Verif" + "AI" in the accent (`#4A85B9` on dark, `#0E5A8A` on light).
- Endorsement: "by" + the MetaPLM white logo (`public/brand/metaplm_logo_white.png`, from the widget).

## Product surfaces
| Need | In the film | Source |
|---|---|---|
| Change Action, route task | light card, widget header gradient, 3DEXPERIENCE type icons (VPMReference, Drawing, Route) | widget static/images |
| Findings on a drawing | numbered circle markers, green PASS / red FAIL, red frame on a failure | annotator.py |
| Rule names | `name_en` from checklist.yaml, with the agent chip | checklist.yaml, ChecklistList.vue |
| Report | navy banners, PASSED / FAILED boxes, "~ ISSUES FOUND", CA contents, action items | ca_reporter.py |

## Engineering look (v3)
- Ground: a drafting grid (24 px minor, 120 px major with node crosses, edge rulers), static so the loop's first and last frames match.
- HUD during product scenes: numbered section (01 INTAKE · 3D MODEL, 02 2D DRAWING, 03 REPORT, 04 DECISION), CA id, running timecode. Mono, muted.
- The mark's corner blocks are the film's framing device: the opening viewfinder, the drawing viewport's corners, and the target lock on each failure.
- 3D: the part as a wireframe projected per frame from the drawing's dimensions, a section plane, an XYZ triad (X red, Y green, Z sky), a 360 dimension.
- 2D: a camera on the sheet (push in on each failure, pull back), the rule run printed like a test run (`$ verifai inspect 1011548 --rev A`, 01..08, PASS / FAIL).
- Punchlines carry a mono spec line above and a drafting dimension below (CA-00001445, 140 s / CHANGE ACTION, BEFORE RELEASE).

## Motion
- UI spring stiffness 220, damping 26; pops 320 / 22; magic move 150 / 20.
- Punchline words: blur 16 px, rise 36 px, 0.3 s on `cubic-bezier(0.22, 1, 0.36, 1)`.
- No glows, particles or bouncy easing.

## Workspace
- `videos/`, Remotion 4.0.529 pinned, React 19. No Tailwind.
- Scripts: `stills.ts`, `render.ts` (`--silent` for films without music), `verify.py`, `beat-sheet.ts`.
- Sandboxes without Remotion's Chrome download: `REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell`.
