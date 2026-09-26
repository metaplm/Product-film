/** Frame helpers. Each act owns its measured boxes (caBox, sheetBox, page, attachment, taskBox, reject). */
export const centerOf = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
