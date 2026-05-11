"use client"

import { theme } from "@/styles/theme"

const { width, height, borderRadius } = theme.card
const W = width
const H = height

function sunburstPaths(cx: number, cy: number, numRays: number, r: number) {
  const paths: string[] = []
  for (let i = 0; i < numRays; i++) {
    if (i % 2 !== 0) continue
    const a1 = (i / numRays) * Math.PI * 2 - Math.PI / 2
    const a2 = ((i + 1) / numRays) * Math.PI * 2 - Math.PI / 2
    const x1 = cx + Math.cos(a1) * r
    const y1 = cy + Math.sin(a1) * r
    const x2 = cx + Math.cos(a2) * r
    const y2 = cy + Math.sin(a2) * r
    paths.push(`M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} Z`)
  }
  return paths
}

interface Props {
  djName: string
  editedPhoto?: string
  cardNumber?: number
  instanceId?: string
}

export const CardFront = ({ djName, editedPhoto, cardNumber, instanceId }: Props) => {
  const uid = instanceId ? `-${instanceId}` : ""
  const rays = sunburstPaths(W * 0.52, H * 0.42, 24, 700)

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={`front-card-clip${uid}`}>
          <rect width={W} height={H} rx={borderRadius} ry={borderRadius} />
        </clipPath>
        <clipPath id={`front-photo-clip${uid}`}>
          <rect x={12} y={12} width={W - 24} height={H - 100} rx={8} ry={8} />
        </clipPath>

        {/* Background radial glow */}
        <radialGradient id={`front-bg-glow${uid}`} cx="52%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#2d0060" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0d0020" stopOpacity="1" />
          <stop offset="100%" stopColor="#0a0008" stopOpacity="1" />
        </radialGradient>

        {/* Photo bottom fade */}
        <linearGradient id={`front-photo-fade${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="#0a0008" />
        </linearGradient>

        {/* Name bar gradient */}
        <linearGradient id={`front-name-grad${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="100%" stopColor="#0a0008" />
        </linearGradient>

        {/* Side banner */}
        <linearGradient id={`front-banner-grad${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>

        {/* Diagonal slash gradient */}
        <linearGradient id={`front-slash-grad${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* ── Layer 1: background ── */}
      <g clipPath={`url(#front-card-clip${uid})`}>
        <rect width={W} height={H} fill="#0a0008" />
        <rect width={W} height={H} fill={`url(#front-bg-glow${uid})`} />

        {/* ── Layer 2: sunburst rays ── */}
        {rays.map((d, i) => (
          <path key={i} d={d} fill="#2a005a" opacity="0.55" />
        ))}

        {/* ── Layer 3: photo ── */}
        {editedPhoto ? (
          <image
            href={editedPhoto}
            x={12}
            y={12}
            width={W - 24}
            height={H - 100}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#front-photo-clip${uid})`}
          />
        ) : (
          <rect x={12} y={12} width={W - 24} height={H - 100} rx={8} fill="#1a0a2e" />
        )}

        {/* ── Layer 4: photo fade into name bar ── */}
        <rect x={0} y={H - 200} width={W} height={200} fill={`url(#front-photo-fade${uid})`} />

        {/* ── Layer 5: diagonal slash accent ── */}
        <polygon
          points={`0,${H - 110}  ${W * 0.65},${H - 110}  ${W * 0.75},${H - 88}  0,${H - 88}`}
          fill={`url(#front-slash-grad${uid})`}
          opacity="0.7"
        />

        {/* ── Layer 6: name bar ── */}
        <rect x={0} y={H - 88} width={W} height={88} fill={`url(#front-name-grad${uid})`} />

        {/* Gold top separator line */}
        <line x1={0} y1={H - 88} x2={W} y2={H - 88} stroke={theme.colors.gold} strokeWidth={1.5} />

        {/* ── Layer 7: side banner ── */}
        <rect x={0} y={0} width={12} height={H} fill={`url(#front-banner-grad${uid})`} />
        {/* Banner inner highlight */}
        <rect x={11} y={0} width={1} height={H} fill={theme.colors.gold} opacity="0.4" />

        {/* ── Layer 8: top-right card number chip ── */}
        <rect x={W - 54} y={14} width={40} height={18} rx={4} fill="#0a0008" opacity="0.7" />
        <text
          x={W - 34}
          y={23}
          fontFamily={theme.fonts.mono}
          fontSize={9}
          fill={theme.colors.gold}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {cardNumber ? `#${String(cardNumber).padStart(4, "0")}` : "#0000"}
        </text>

        {/* ── Layer 9: DJ name ── */}
        <text
          x={22}
          y={H - 50}
          fontFamily={theme.fonts.heading}
          fontSize={28}
          fontWeight="900"
          fill={theme.colors.white}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {djName || "DJ NAME"}
        </text>

        {/* Gold underline accent on name */}
        <line
          x1={22}
          y1={H - 28}
          x2={Math.min(22 + (djName || "DJ NAME").length * 16, W - 20)}
          y2={H - 28}
          stroke={theme.colors.gold}
          strokeWidth={2}
          opacity="0.6"
        />

        {/* ── Layer 10: card outer border ── */}
        <rect
          x={1}
          y={1}
          width={W - 2}
          height={H - 2}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={theme.colors.gold}
          strokeWidth={1.5}
          opacity="0.4"
        />
      </g>
    </svg>
  )
}
