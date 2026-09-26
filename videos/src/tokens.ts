/**
 * Verifai tokens. There is no product design system yet, so these are the
 * film's defaults (see videos/BRAND.md): dark and technical, one green
 * "verified" accent, status tones for pass / warn / fail. Hex only, because
 * anything that animates goes through interpolateColors.
 */
export const color = {
  bg: "#0a0b0d",
  surface: "#111418",
  raised: "#171b21",
  border: "#242a33",
  fg: "#f2f5f8",
  muted: "#8a93a0",
  accent: "#34e2a0",
  accentInk: "#04130d",
  fail: "#ff5c5c",
  warn: "#f4b740",
} as const;

export const font = {
  sans: '"Inter", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

export const radius = { window: 20, control: 12, pill: 999 } as const;

/** UI springs: quick and settled, no bounce. */
export const ui = { stiffness: 220, damping: 26 } as const;
export const pop = { stiffness: 320, damping: 22 } as const;
