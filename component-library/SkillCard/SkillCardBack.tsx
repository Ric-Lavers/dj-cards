"use client"

import { theme } from "@/styles/theme"
import { ElectronDanceLogo } from "./ElectronDanceLogo"

const { width, height, borderRadius } = theme.card
const W = width
const H = height

interface Props {
  instanceId?: string
  squareCorners?: boolean
}

export const SkillCardBack = ({ instanceId, squareCorners }: Props) => {
  const uid = instanceId ? `-${instanceId}` : ""
  const r = squareCorners ? 0 : borderRadius
  const stage = Math.min(W, H) * 0.82

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={`skillback-card-clip${uid}`}>
          <rect width={W} height={H} rx={r} ry={r} />
        </clipPath>

        <radialGradient id={`skillback-bg-glow${uid}`} cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#2d0060" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0d0020" stopOpacity="1" />
          <stop offset="100%" stopColor="#0a0008" stopOpacity="1" />
        </radialGradient>

        <linearGradient id={`skillback-banner-grad${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#skillback-card-clip${uid})`}>
        <rect width={W} height={H} fill="#0a0008" />
        <rect width={W} height={H} fill={`url(#skillback-bg-glow${uid})`} />

        <ElectronDanceLogo
          x={W / 2 - stage / 2}
          y={H / 2 - stage / 2}
          width={stage}
          height={stage}
          instanceId={instanceId}
        />

        <rect x={0} y={0} width={12} height={H} fill={`url(#skillback-banner-grad${uid})`} />
        <rect x={11} y={0} width={1} height={H} fill={theme.colors.gold} opacity="0.4" />

        {!squareCorners && (
          <rect
            x={1} y={1} width={W - 2} height={H - 2}
            rx={r} ry={r}
            fill="none"
            stroke={theme.colors.gold}
            strokeWidth={1.5}
            opacity="0.4"
          />
        )}
      </g>
    </svg>
  )
}
