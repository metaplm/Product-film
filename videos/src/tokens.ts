/**
 * VerifAI tokens, taken from the product's own sources:
 * - brand blue, navy, light blue and neutrals: the VerifAI logo page (direction 1b, "Denetim mührü")
 * - header gradient: metachecker-widget app.vue (its sky end dropped: the film keeps one accent)
 * - PASS / FAIL / SKIP / partial and the report navy: metachecker-mvp ca_reporter.py
 * - agent colors: metachecker-widget ChecklistList.vue
 * Hex only, because anything that animates goes through interpolateColors.
 */
export const color = {
  // Film ground: the logo's dark test background.
  bg: "#0B1620",
  onBg: "#FFFFFF",
  onBgMuted: "#98A1AE",
  brand: "#0E5A8A",
  brandLight: "#4A85B9",
  /** The film's one accent (the logo's "AI" on dark). */
  accent: "#4A85B9",
  // Product surfaces (light, as in the widget and the report).
  paper: "#FFFFFF",
  paperAlt: "#F7F8FA",
  line: "#DDE1E8",
  lineSoft: "#EDEFF3",
  text: "#0B1620",
  textMuted: "#6E7785",
  headerFrom: "#012F4D",
  headerMid: "#015686",
  reportNavy: "#1A2744",
  pass: "#27AE60",
  passBg: "#EAF7EF",
  fail: "#C0392B",
  failBg: "#FDECEA",
  skip: "#95A5A6",
  partial: "#E67E22",
} as const;

export const agentColor = { "2D": "#3949AB", "3D": "#546E7A", PLM: "#2E7D32", CROSS: "#EF6C00" } as const;

export const font = {
  sans: '"Inter", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

export const radius = { window: 14, control: 8, pill: 999 } as const;

/** UI springs: quick and settled, no bounce. */
export const ui = { stiffness: 220, damping: 26 } as const;
export const pop = { stiffness: 320, damping: 22 } as const;
