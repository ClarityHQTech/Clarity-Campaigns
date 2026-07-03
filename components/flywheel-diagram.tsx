import { Users, TrendingUp, Repeat } from "lucide-react";

const SIZE = 580;
const CENTER = SIZE / 2;
const OUTER_R = 168;
const INNER_R = 110;
const ICON_R = (OUTER_R + INNER_R) / 2;
const LABEL_R = OUTER_R + 40;
const GAP_DEG = 8;
const ARC_DEG = 360 / 3 - GAP_DEG;
const RING_R = OUTER_R + 20;

function polar(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function ringSegmentPath(startAngle: number, endAngle: number) {
  const outerStart = polar(OUTER_R, startAngle);
  const outerEnd = polar(OUTER_R, endAngle);
  const innerEnd = polar(INNER_R, endAngle);
  const innerStart = polar(INNER_R, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

const STAGES = [
  { key: "acquisition", label: "ACQUISITION", start: -90, color: "var(--primary)", tint: "rgba(233,148,26,0.14)", Icon: Users },
  { key: "conversion", label: "CONVERSION", start: -90 + 120, color: "var(--secondary)", tint: "rgba(77,150,133,0.14)", Icon: TrendingUp },
  { key: "retention", label: "RETENTION", start: -90 + 240, color: "var(--destructive)", tint: "rgba(194,81,58,0.14)", Icon: Repeat },
];

export function FlywheelDiagram() {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Brand Intelligence flywheel: Acquisition, Conversion, Retention"
    >
      <defs>
        <style>{`
          @keyframes fw-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          .fw-ring {
            transform-origin: ${CENTER}px ${CENTER}px;
            animation: fw-spin 22s linear infinite;
          }
        `}</style>
      </defs>

      {/* Rotating outer decorative ring */}
      <circle
        className="fw-ring"
        cx={CENTER}
        cy={CENTER}
        r={RING_R}
        fill="none"
        stroke="rgba(233,148,26,0.25)"
        strokeWidth="1.5"
        strokeDasharray="5 11"
      />

      {STAGES.map((s) => {
        const end = s.start + ARC_DEG;
        const mid = (s.start + end) / 2;
        const iconPos = polar(ICON_R, mid);
        const labelPos = polar(LABEL_R, mid);
        return (
          <g key={s.key}>
            <path d={ringSegmentPath(s.start, end)} fill={s.tint} stroke={s.color} strokeWidth={1} />
            <circle cx={iconPos.x} cy={iconPos.y} r={20} fill="var(--card)" stroke={s.color} strokeWidth={1.5} />
            <foreignObject x={iconPos.x - 11} y={iconPos.y - 11} width={22} height={22}>
              <s.Icon size={22} color={s.color} strokeWidth={1.75} />
            </foreignObject>
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight={700}
              fontFamily="var(--font-mono)"
              letterSpacing="0.07em"
              fill={s.color}
            >
              {s.label}
            </text>
          </g>
        );
      })}

      <circle cx={CENTER} cy={CENTER} r={INNER_R - 5} fill="var(--foreground)" />
      <text x={CENTER} y={CENTER - 10} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight={600} fontFamily="var(--font-heading)" fill="var(--background)">
        BRAND
      </text>
      <text x={CENTER} y={CENTER + 14} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight={600} fontFamily="var(--font-heading)" fill="var(--background)">
        INTELLIGENCE
      </text>
    </svg>
  );
}
