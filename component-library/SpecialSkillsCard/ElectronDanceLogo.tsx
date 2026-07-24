"use client"

// PLACEHOLDER — swap this file's contents with the real electron.dance animated SVG
// (https://electron.dance) once the asset is extracted. Callers only pass
// x/y/width/height, so the swap doesn't require touching SpecialSkillsCard.tsx.
export const ElectronDanceLogo = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => {
  const cx = x + width / 2
  const cy = y + height / 2
  const r = Math.min(width, height) / 2.4

  return (
    <g transform={`translate(${cx}, ${cy})`} opacity="0.9">
      <circle r={r} fill="none" stroke="#c9a84c" strokeWidth={2} opacity="0.5" />
      <circle r={r * 0.72} fill="none" stroke="#7c3aed" strokeWidth={2} opacity="0.65" />
      <circle r={r * 0.4} fill="#7c3aed" opacity="0.3" />
      <text
        y={r * 0.2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Arial Black', sans-serif"
        fontWeight={900}
        fontSize={r * 0.65}
        fill="#f5f5f0"
      >
        e
      </text>
    </g>
  )
}
