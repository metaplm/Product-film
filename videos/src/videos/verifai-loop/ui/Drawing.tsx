import { color } from "../../../tokens";

/**
 * A technical drawing sheet for part 1011548 Rev A at 1:2 (the benchmark's
 * title-block ground truth), drawn as SVG in sheet units (1080 x 764, A3 ratio).
 * The notes carry no general tolerance standard and the title block has no
 * approval: the two findings the inspection shows.
 */
export const SHEET = { w: 1080, h: 764 } as const;
const ink = color.text;
const fine = "#4D5663";
const mono = '"JetBrains Mono", monospace';

function Cell({ x, y, w, label, value }: { x: number; y: number; w: number; label: string; value: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={40} fill="none" stroke={ink} strokeWidth={1.4} />
      <text x={x + 6} y={y + 12} fontSize={9.5} fill={fine} fontFamily={mono}>
        {label}
      </text>
      <text x={x + 8} y={y + 32} fontSize={17} fill={ink} fontFamily={mono} fontWeight={500}>
        {value}
      </text>
    </g>
  );
}

export function Drawing() {
  return (
    <svg width={SHEET.w} height={SHEET.h} viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} style={{ display: "block" }}>
      <rect x={0} y={0} width={SHEET.w} height={SHEET.h} fill={color.paper} />
      <rect x={16} y={16} width={1048} height={732} fill="none" stroke={ink} strokeWidth={2} />
      <rect x={32} y={32} width={1016} height={700} fill="none" stroke={ink} strokeWidth={1} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line x1={32 + (i + 1) * (1016 / 6)} y1={16} x2={32 + (i + 1) * (1016 / 6)} y2={32} stroke={ink} strokeWidth={1} />
          <text x={32 + (i + 0.5) * (1016 / 6)} y={28} fontSize={10} fill={fine} fontFamily={mono} textAnchor="middle">
            {i + 1}
          </text>
        </g>
      ))}

      {/* Front view: the bracket plate. */}
      <rect x={110} y={120} width={360} height={240} rx={12} fill="none" stroke={ink} strokeWidth={2.4} />
      <circle cx={170} cy={240} r={20} fill="none" stroke={ink} strokeWidth={2.2} />
      <circle cx={410} cy={240} r={20} fill="none" stroke={ink} strokeWidth={2.2} />
      <rect x={250} y={220} width={80} height={40} rx={20} fill="none" stroke={ink} strokeWidth={2.2} />
      <g stroke={fine} strokeWidth={0.9} strokeDasharray="14 4 3 4">
        <line x1={96} y1={240} x2={484} y2={240} />
        <line x1={170} y1={206} x2={170} y2={274} />
        <line x1={410} y1={206} x2={410} y2={274} />
        <line x1={290} y1={106} x2={290} y2={374} />
      </g>
      {/* Side view: the bent flange. */}
      <path d="M540 120 H570 V330 H660 V360 H540 Z" fill="none" stroke={ink} strokeWidth={2.4} />
      <line x1={540} y1={240} x2={570} y2={240} stroke={fine} strokeWidth={0.9} strokeDasharray="6 3" />
      {/* Isometric view. */}
      <g fill="none" stroke={ink} strokeWidth={1.8} strokeLinejoin="round">
        <path d="M800 200 L900 150 L980 190 L880 240 Z" />
        <path d="M800 200 V214 L880 254 V240" />
        <path d="M880 254 L980 204 V190" />
        <path d="M880 240 V290 L894 297 V247" />
        <ellipse cx={850} cy={196} rx={11} ry={6} />
        <ellipse cx={930} cy={180} rx={11} ry={6} />
      </g>
      <text x={890} y={320} fontSize={11} fill={fine} fontFamily={mono} textAnchor="middle">
        ISO VIEW 1:4
      </text>
      {/* Dimensions. */}
      <g stroke={fine} strokeWidth={1} fill={fine} fontFamily={mono} fontSize={14}>
        <line x1={110} y1={366} x2={110} y2={410} />
        <line x1={470} y1={366} x2={470} y2={410} />
        <line x1={110} y1={400} x2={470} y2={400} />
        <path d="M110 400 l10 -4 v8 Z M470 400 l-10 -4 v8 Z" stroke="none" />
        <text x={290} y={394} textAnchor="middle" stroke="none">360</text>
        <line x1={104} y1={120} x2={62} y2={120} />
        <line x1={104} y1={360} x2={62} y2={360} />
        <line x1={72} y1={120} x2={72} y2={360} />
        <path d="M72 120 l-4 10 h8 Z M72 360 l-4 -10 h8 Z" stroke="none" />
        <text x={64} y={244} textAnchor="middle" stroke="none" transform="rotate(-90 64 240)">240</text>
        <line x1={184} y1={226} x2={228} y2={176} />
        <line x1={228} y1={176} x2={276} y2={176} />
        <text x={232} y={170} stroke="none">2× Ø40</text>
        <line x1={660} y1={345} x2={700} y2={384} />
        <text x={704} y={396} stroke="none">t = 30</text>
      </g>
      {/* The drawing's own item balloon. */}
      <g>
        <line x1={466} y1={130} x2={488} y2={148} stroke={ink} strokeWidth={1} />
        <circle cx={500} cy={140} r={16} fill={color.paper} stroke={ink} strokeWidth={1.6} />
        <text x={500} y={146} fontSize={15} fill={ink} fontFamily={mono} textAnchor="middle">1</text>
      </g>
      {/* Notes: no general tolerance standard. */}
      <g fontFamily={mono} fill={ink}>
        <text x={70} y={496} fontSize={15} fontWeight={700}>NOTES</text>
        <text x={70} y={524} fontSize={13.5}>1. BREAK ALL SHARP EDGES 0.5 × 45°</text>
        <text x={70} y={550} fontSize={13.5}>2. SURFACE FINISH Ra 3.2</text>
        <text x={70} y={576} fontSize={13.5}>3. DEBURR AFTER CUTTING</text>
      </g>
      {/* Title block. */}
      <Cell x={590} y={572} w={458} label="TITLE" value="BRACKET" />
      <Cell x={590} y={612} w={200} label="PART NO" value="1011548" />
      <Cell x={790} y={612} w={100} label="REV" value="A" />
      <Cell x={890} y={612} w={158} label="SCALE" value="1:2" />
      <Cell x={590} y={652} w={300} label="MATERIAL" value="SS316L" />
      <Cell x={890} y={652} w={158} label="SHEET" value="1/1" />
      <Cell x={590} y={692} w={150} label="DRAWN" value="M. K." />
      <Cell x={740} y={692} w={154} label="CHECKED" value="" />
      <Cell x={894} y={692} w={154} label="APPROVED" value="" />
    </svg>
  );
}
