"use client"

import { theme } from "@/styles/theme"
import type { ArtistDoc, Skill } from "@/db/mongo/models/artist.schema"

const { width, height, borderRadius } = theme.card
const W = width
const H = height

const SKILL_LABELS: Record<string, string> = {
  scratching: "Scratch",
  long_mixes: "Long Mix",
  vinyl:      "Vinyl",
  cdjs:       "CDJs",
  ableton:    "Ableton",
  guitar:     "Guitar",
  vocalist:   "Vocalist",
}

function skillLabel(skill: string) {
  return SKILL_LABELS[skill] ?? skill
}

// SVG <text> doesn't wrap on its own — greedily pack words onto lines of at
// most maxChars, capped at 2 lines (long tails just run onto the 2nd line).
function wrapLabel(text: string, maxChars: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 2)
}

// Deterministic pseudo-waveform bars from a seed string
function waveformBars(seed: string, count: number, maxH: number) {
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    const char = seed.charCodeAt(i % seed.length) || 72
    const h = 4 + ((char * (i + 1) * 37) % maxH)
    bars.push(h)
  }
  return bars
}

interface Props {
  artist: Partial<ArtistDoc> & { gigCount?: number }
  qrDataUrl?: string
  specialSkillsData?: { name: string; largeImage: string }[]
  instanceId?: string
  squareCorners?: boolean
  onQrClick?: () => void
}

export const CardBack = ({ artist, qrDataUrl, specialSkillsData, instanceId, squareCorners, onQrClick }: Props) => {
  const uid = instanceId ? `-${instanceId}` : ""
  const r = squareCorners ? 0 : borderRadius
  const { djName, stats, genres, skills, cardNumber, socials, gigCount } = artist
  const instagram = socials?.instagram?.replace(/^@/, "")
  const soundcloud = socials?.soundcloud?.replace(/^@/, "")
  const bars = waveformBars(djName || "DJ", 28, 22)
  const specialSkills = (specialSkillsData ?? []).slice(0, 2)
  const hasSpecialSkills = specialSkills.length > 0

  
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={`back-card-clip${uid}`}>
          <rect width={W} height={H} rx={r} ry={r} />
        </clipPath>

        <clipPath id={`back-skill-icon-clip${uid}`} clipPathUnits="objectBoundingBox">
          <rect x={0} y={0} width={1} height={1} rx={0.12} ry={0.12} />
        </clipPath>

        {/* Diagonal stripe pattern */}
        <pattern id={`back-stripes${uid}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="20" height="20" fill="#0a0008" />
          <rect width="2" height="20" fill="#1a0a2e" opacity="0.8" />
        </pattern>

        <linearGradient id={`back-banner-grad${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>

        <linearGradient id={`back-header-grad${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="100%" stopColor="#0a0008" />
        </linearGradient>

        <linearGradient id={`back-slash-grad${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.3" />
        </linearGradient>

        <radialGradient id={`back-corner-glow${uid}`} cx="100%" cy="0%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <g clipPath={`url(#back-card-clip${uid})`}>
        {/* ── Background ── */}
        <rect width={W} height={H} fill="#0a0008" />
        <rect width={W} height={H} fill={`url(#back-stripes${uid})`} />
        <rect width={W} height={H} fill={`url(#back-corner-glow${uid})`} />

        {/* ── Waveform decoration (top area, behind header) ── */}
        {bars.map((barH, i) => (
          <rect
            key={i}
            x={14 + i * ((W - 28) / bars.length)}
            y={56 - barH}
            width={(W - 28) / bars.length - 2}
            height={barH}
            fill="#7c3aed"
            opacity="0.18"
            rx={1}
          />
        ))}

        {/* ── Header diagonal slash ── */}
        <polygon
          points={`12,0  ${W},0  ${W},58  12,58`}
          fill={`url(#back-header-grad${uid})`}
        />
        <polygon
          points={`12,54  ${W * 0.7},54  ${W * 0.8},62  12,62`}
          fill={`url(#back-slash-grad${uid})`}
        />

        {/* ── Side banner ── */}
        <rect x={0} y={0} width={12} height={H} fill={`url(#back-banner-grad${uid})`} />
        <rect x={11} y={0} width={1} height={H} fill={theme.colors.gold} opacity="0.4" />

        {/* ── DJ Name header ── */}
        <text
          x={22}
          y={34}
          fontFamily={theme.fonts.heading}
          fontSize={20}
          fontWeight="900"
          fill={theme.colors.white}
          dominantBaseline="middle"
        >
          {djName || "DJ NAME"}
        </text>

        {/* Gold separator */}
        <line x1={12} y1={62} x2={W} y2={62} stroke={theme.colors.gold} strokeWidth={1} />

        {/* ── BPM — top right, prominent ── */}
        <text
          x={W - 16}
          y={86}
          fontFamily={theme.fonts.heading}
          fontSize={34}
          fontWeight="900"
          fill={theme.colors.gold}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {stats?.bpm ?? "—"}
        </text>
        <text
          x={W - 16}
          y={108}
          fontFamily={theme.fonts.body}
          fontSize={8}
          fill={theme.colors.muted}
          textAnchor="end"
          letterSpacing="2"
        >
          BPM
        </text>

        {/* ── Gigs played — live count from the roster, under BPM ── */}
        {gigCount !== undefined && (
          <>
            <text
              x={W - 16}
              y={140}
              fontFamily={theme.fonts.heading}
              fontSize={26}
              fontWeight="900"
              fill={theme.colors.white}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {gigCount}
            </text>
            <text
              x={W - 16}
              y={160}
              fontFamily={theme.fonts.body}
              fontSize={8}
              fill={theme.colors.muted}
              textAnchor="end"
              letterSpacing="2"
            >
              GIGS
            </text>
          </>
        )}

        {/* ── Stats grid ── */}
        {[
          ["YEARS PLAYING", stats?.yearsPlaying ?? "—"],
          ["UPLOADS", stats?.tracksUploaded ?? "—"],
          ["FOLLOWERS", stats?.totalFollowers ?? "—"],
        ].map(([label, value], i) => {
          const isEmpty = (value === 0 || value === "0") && label !== "YEARS PLAYING"
          return (
            <g key={String(label)} transform={`translate(22, ${72 + i * 32})`}>
              <text fontFamily={theme.fonts.mono} fontSize={8} fill="#b0b0c8" letterSpacing="1" y={0}
                visibility={isEmpty && label !== "YEARS PLAYING" ? "hidden" : "visible"}>
                {label}
              </text>
              <text
                fontFamily={theme.fonts.heading}
                fontSize={18}
                fontWeight="700"
                fill={theme.colors.white}
                y={17}
                visibility={isEmpty ? "hidden" : "visible"}
              >
                {String(value)}
              </text>
            </g>
          )
        })}

        {/* ── Section divider ── */}
        <line x1={12} y1={173} x2={W} y2={173} stroke={theme.colors.border} strokeWidth={0.75} opacity="0.5" />

        {/* ── Danceability scale ── */}
        <text x={22} y={186} fontFamily={theme.fonts.mono} fontSize={7} fill={theme.colors.muted} letterSpacing="1">EASY LISTENING</text>
        <text x={W - 16} y={186} fontFamily={theme.fonts.mono} fontSize={7} fill={theme.colors.muted} textAnchor="end" letterSpacing="1">DANCEABILITY</text>
        {/* Track */}
        <rect x={22} y={192} width={W - 44} height={9} rx={4.5} fill={theme.colors.surface} />
        {/* Fill */}
        <rect
          x={22}
          y={192}
          width={((stats?.danceabilityScale ?? 50) / 100) * (W - 44)}
          height={9}
          rx={4.5}
          fill={`url(#back-slash-grad${uid})`}
        />
        {/* Thumb */}
        <circle
          cx={22 + ((stats?.danceabilityScale ?? 50) / 100) * (W - 44)}
          cy={196.5}
          r={8}
          fill={theme.colors.gold}
        />

        {/* ── Genres ── */}
        <line x1={12} y1={210} x2={W} y2={210} stroke={theme.colors.border} strokeWidth={0.75} opacity="0.5" />
        {(genres ?? []).slice(0, 2).map((genre, i) => (
          <g key={genre} transform={`translate(${22 + i * 120}, 216)`}>
            <rect width={112} height={30} rx={15} fill="#2d1060" stroke="#a855f7" strokeWidth={1} />
            <text
              x={56}
              y={15}
              fontFamily={theme.fonts.mono}
              fontSize={10}
              fill="#e0b8ff"
              textAnchor="middle"
              dominantBaseline="middle"
              letterSpacing="1"
            >
              {genre.toUpperCase()}
            </text>
          </g>
        ))}

        {/* ── Skills ── */}
        <line x1={12} y1={254} x2={W} y2={254} stroke={theme.colors.border} strokeWidth={0.75} opacity="0.5" />
        {(skills ?? []).slice(0, hasSpecialSkills ? 4 : 8).map((skill, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const label = skillLabel(skill)
          const x = 18 + col * 84
          const y = 262 + row * 32
          return (
            <g key={skill} transform={`translate(${x}, ${y})`}>
              <rect width={76} height={26} rx={5} fill="#2a2a40" />
              <rect width={3} height={26} rx={1.5} fill="#a855f7" />
              <text
                x={42}
                y={13}
                fontFamily={theme.fonts.mono}
                fontSize={8.5}
                fill={theme.colors.white}
                textAnchor="middle"
                dominantBaseline="middle"
                letterSpacing="0.3"
              >
                {label.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* ── Special Skills (large icons, up to 2) ── */}
        {hasSpecialSkills && (() => {
          const dividerY = 296
          const iconSize = 58
          const iconGap = 14
          const iconY = dividerY + 22
          const startX = 24
          return (
            <>
              <line x1={12} y1={dividerY} x2={W} y2={dividerY} stroke={theme.colors.border} strokeWidth={0.75} opacity="0.5" />
              {specialSkills.map((skill, i) => {
                const iconX = startX + i * (iconSize + iconGap)
                return (
                  <g key={skill.name}>
                    <rect x={iconX - 3} y={iconY - 3} width={iconSize + 6} height={iconSize + 6} rx={10} fill="#2a1a40" stroke={theme.colors.gold} strokeWidth={1} />
                    <image
                      href={skill.largeImage}
                      x={iconX}
                      y={iconY}
                      width={iconSize}
                      height={iconSize}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#back-skill-icon-clip${uid})`}
                    />
                    <text
                      x={iconX + iconSize / 2}
                      y={iconY + iconSize + 13}
                      fontFamily={theme.fonts.mono}
                      fontSize={8.5}
                      fill={theme.colors.gold}
                      textAnchor="middle"
                      letterSpacing="0.3"
                    >
                      {wrapLabel(skill.name.toUpperCase(), 13).map((line, li) => (
                        <tspan key={li} x={iconX + iconSize / 2} dy={li === 0 ? 0 : 8}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                )
              })}
            </>
          )
        })()}

        {/* ── QR code ── */}
        {qrDataUrl && (() => {
          const qrSize = hasSpecialSkills ? 64 : 76
          const qrY = hasSpecialSkills ? H - 90 : H - 105
          return (
            <g
              transform={`translate(${W - 14 - qrSize}, ${qrY})`}
              onClick={onQrClick ? (e) => { e.stopPropagation(); onQrClick() } : undefined}
            >
              <rect width={qrSize} height={qrSize} rx={6} fill="#fff" />
              <image href={qrDataUrl} x={4} y={4} width={qrSize - 8} height={qrSize - 8} />
              <text
                x={qrSize / 2}
                y={qrSize + 14}
                fontFamily={theme.fonts.mono}
                fontSize={7}
                fill={theme.colors.muted}
                textAnchor="middle"
                letterSpacing="1"
              >
                ARTIST PROFILE
              </text>
            </g>
          )
        })()}

        {/* ── Bottom waveform decoration ── */}
        {bars.map((barH, i) => (
          <rect
            key={`bot-${i}`}
            x={14 + i * ((W - 28) / bars.length)}
            y={H - 16}
            width={(W - 28) / bars.length - 2}
            height={-Math.min(barH * 0.6, 12)}
            fill="#c9a84c"
            opacity="0.15"
            rx={1}
          />
        ))}

        {/* ── Socials ── */}
        {instagram && (
          <text x={22} y={H - 42} fontFamily={theme.fonts.mono} fontSize={8} fill={theme.colors.gold} letterSpacing="0.5">
            ig: @{instagram}
          </text>
        )}
        {soundcloud && (
          <text x={22} y={H - 30} fontFamily={theme.fonts.mono} fontSize={8} fill={theme.colors.gold} letterSpacing="0.5">
            sc: @{soundcloud}
          </text>
        )}

        {/* ── Card number ── */}
        <text
          x={22}
          y={H - 6}
          fontFamily={theme.fonts.mono}
          fontSize={8}
          fill={theme.colors.muted}
          letterSpacing="1"
        >
          {cardNumber ? `#${String(cardNumber).padStart(4, "0")}` : ""}
        </text>

        {/* ── Card border (screen only) ── */}
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
