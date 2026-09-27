/**
 * The film ground as a drafting sheet: a fine 24 px grid, a 120 px major grid
 * with small crosses at its nodes. Static, so frame 0 and the
 * last frame match.
 */
const MINOR = "#0F1E2B";
const MAJOR = "#15293A";

export function Blueprint() {
  const crosses = [];
  for (let x = 120; x < 1920; x += 120) for (let y = 120; y < 1080; y += 120) crosses.push(<path key={`${x}-${y}`} d={`M${x - 5} ${y} H${x + 5} M${x} ${y - 5} V${y + 5}`} />);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="minor" width={24} height={24} patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" fill="none" stroke={MINOR} strokeWidth={1} />
        </pattern>
        <pattern id="major" width={120} height={120} patternUnits="userSpaceOnUse">
          <path d="M120 0 H0 V120" fill="none" stroke={MAJOR} strokeWidth={1} />
        </pattern>
      </defs>
      <rect width={1920} height={1080} fill="url(#minor)" />
      <rect width={1920} height={1080} fill="url(#major)" />
      <g stroke="#23405A" strokeWidth={1.2}>{crosses}</g>
    </svg>
  );
}

