/**
 * Screen layout at 1920x1080. Every element a cursor clicks or a traveler
 * lands on is placed absolutely from these numbers, and checked with
 * `--debug` stills (data-target boxes).
 */
export const win = { x: 160, y: 110, w: 1600, h: 860, header: 72, sidebar: 320 } as const;
export const main = { x: win.x + win.sidebar + 48, y: win.y + win.header + 40, w: win.w - win.sidebar - 96 } as const;

/** Primary action, top right of the main area. */
export const action = (w: number) => ({ x: main.x + main.w - w, y: main.y - 6, w, h: 60 });

export const rows = { y: main.y + 118, h: 84, icon: 34 } as const;
export const rowY = (index: number) => rows.y + index * rows.h;
/** The rule list narrows when the detail panel opens. */
export const listNarrow = 520;

export const panel = { x: main.x + listNarrow + 60, y: main.y - 6, w: main.w - listNarrow - 60, h: 740 } as const;
export const apply = { x: panel.x + 32, y: panel.y + panel.h - 96, w: 200, h: 60 } as const;
export const ignore = { x: apply.x + apply.w + 16, y: apply.y, w: 150, h: 60 } as const;

export const centerOf = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
