/** Frame-driven spinner (no CSS animation): a 90° arc turning 1.6 times a second. */
export function Spinner({ t, size = 24, tint, track }: { t: number; size?: number; tint: string; track: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flex: "none", rotate: `${t * 576}deg` }}>
      <circle cx={16} cy={16} r={12} fill="none" stroke={track} strokeWidth={3.5} />
      <path d="M16 4 A12 12 0 0 1 28 16" fill="none" stroke={tint} strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  );
}
