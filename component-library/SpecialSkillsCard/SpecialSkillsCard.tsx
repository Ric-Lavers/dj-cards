"use client"

import { theme } from "@/styles/theme"
import type { ArtistDoc } from "@/db/mongo/models/artist.schema"
import { ElectronDanceLogo } from "./ElectronDanceLogo"

const { width, height, borderRadius } = theme.card
const W = width
const H = height

interface Props {
  artist: Partial<ArtistDoc>
  specialSkillsData?: { name: string; largeImage: string }[]
  instanceId?: string
  squareCorners?: boolean
}

export const SpecialSkillsCard = ({ artist, specialSkillsData, instanceId, squareCorners }: Props) => {
  const uid = instanceId ? `-${instanceId}` : ""
  const r = squareCorners ? 0 : borderRadius
  const { djName } = artist
  const skills = (specialSkillsData ?? []).slice(0, 2)
  const stageW = W - 24
  const stageH = H - 100
  const iconSize = 96

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={`skills-card-clip${uid}`}>
          <rect width={W} height={H} rx={r} ry={r} />
        </clipPath>
        <clipPath id={`skills-stage-clip${uid}`}>
          <rect x={12} y={12} width={stageW} height={stageH} rx={8} ry={8} />
        </clipPath>

        <radialGradient id={`skills-bg-glow${uid}`} cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#2d0060" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0d0020" stopOpacity="1" />
          <stop offset="100%" stopColor="#0a0008" stopOpacity="1" />
        </radialGradient>

        <linearGradient id={`skills-name-grad${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="100%" stopColor="#0a0008" />
        </linearGradient>

        <linearGradient id={`skills-banner-grad${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#skills-card-clip${uid})`}>
        <rect width={W} height={H} fill="#0a0008" />
        <rect width={W} height={H} fill={`url(#skills-bg-glow${uid})`} />

        {/* ── Stage: brand logo centerpiece ── */}
        <g clipPath={`url(#skills-stage-clip${uid})`}>
          <rect x={12} y={12} width={stageW} height={stageH} fill="#12081f" />
          <ElectronDanceLogo x={12} y={12} width={stageW} height={stageH} />

          {/* ── Selected special-skill icons ── */}
          {skills.map((skill, i) => {
            const y = 12 + stageH - iconSize - 14
            const x =
              skills.length === 1
                ? 12 + stageW / 2 - iconSize / 2
                : 12 + 20 + i * (stageW - 40 - iconSize)
            return (
              <g key={skill.name}>
                <rect x={x - 4} y={y - 4} width={iconSize + 8} height={iconSize + 8} rx={12} fill="#0a0008" opacity="0.65" />
                <image
                  href={skill.largeImage}
                  x={x}
                  y={y}
                  width={iconSize}
                  height={iconSize}
                  preserveAspectRatio="xMidYMid slice"
                />
                <rect x={x} y={y} width={iconSize} height={iconSize} rx={8} fill="none" stroke={theme.colors.gold} strokeWidth={1.5} opacity="0.7" />
                <rect x={x} y={y + iconSize - 20} width={iconSize} height={20} fill="#0a0008" opacity="0.75" />
                <text
                  x={x + iconSize / 2}
                  y={y + iconSize - 9}
                  fontFamily={theme.fonts.mono}
                  fontSize={7.5}
                  fill={theme.colors.gold}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  letterSpacing="0.3"
                >
                  {skill.name.toUpperCase()}
                </text>
              </g>
            )
          })}

          {skills.length === 0 && (
            <text
              x={12 + stageW / 2}
              y={12 + stageH - 30}
              fontFamily={theme.fonts.mono}
              fontSize={9}
              fill={theme.colors.muted}
              textAnchor="middle"
              letterSpacing="1"
            >
              NO SPECIAL SKILLS YET
            </text>
          )}
        </g>

        {/* ── Name bar ── */}
        <rect x={0} y={H - 88} width={W} height={88} fill={`url(#skills-name-grad${uid})`} />
        <line x1={0} y1={H - 88} x2={W} y2={H - 88} stroke={theme.colors.gold} strokeWidth={1.5} />

        {/* ── Side banner ── */}
        <rect x={0} y={0} width={12} height={H} fill={`url(#skills-banner-grad${uid})`} />
        <rect x={11} y={0} width={1} height={H} fill={theme.colors.gold} opacity="0.4" />

        {/* ── Face label chip ── */}
        <rect x={W - 108} y={14} width={94} height={18} rx={4} fill="#0a0008" opacity="0.7" />
        <text
          x={W - 61}
          y={23}
          fontFamily={theme.fonts.mono}
          fontSize={8.5}
          fill={theme.colors.gold}
          textAnchor="middle"
          dominantBaseline="middle"
          letterSpacing="0.5"
        >
          SPECIAL SKILLS
        </text>

        {/* ── DJ name ── */}
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

        <line
          x1={22}
          y1={H - 28}
          x2={Math.min(22 + (djName || "DJ NAME").length * 16, W - 20)}
          y2={H - 28}
          stroke={theme.colors.gold}
          strokeWidth={2}
          opacity="0.6"
        />

        <rect
          x={1} y={1} width={W - 2} height={H - 2}
          rx={r} ry={r}
          fill="none"
          stroke={theme.colors.gold}
          strokeWidth={1.5}
          opacity="0.4"
        />
      </g>
    </svg>
  )
}
