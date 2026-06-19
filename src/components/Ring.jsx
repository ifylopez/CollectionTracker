import { C, FF } from "../lib/theme";

export function Ring({ pct, size = 56, stroke = 5, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (circ * pct) / 100;
  return (
    <svg width={size} height={size} style={{ display: "block" }} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.rule} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || C.red} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray .5s" }} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontFamily={FF.display} fontSize={size * 0.28} fontWeight="800" fill={C.ink}>
        {pct}
      </text>
    </svg>
  );
}
