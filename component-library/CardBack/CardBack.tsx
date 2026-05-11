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
  artist: Partial<ArtistDoc>
  qrDataUrl?: string
  instanceId?: string
}

export const CardBack = ({ artist, qrDataUrl, instanceId }: Props) => {
  const uid = instanceId ? `-${instanceId}` : ""
  const { djName, stats, genres, skills, cardNumber, socials } = artist
  const instagram = socials?.instagram?.replace(/^@/, "")
  const soundcloud = socials?.soundcloud?.replace(/^@/, "")
  const bars = waveformBars(djName || "DJ", 28, 22)

  
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
          <rect width={W} height={H} rx={borderRadius} ry={borderRadius} />
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

        {/* ── Stats grid ── */}
        {[
          ["YEARS PLAYING", stats?.yearsPlaying ?? "—"],
          ["UPLOADS", stats?.tracksUploaded ?? "—"],
          ["FOLLOWERS", stats?.totalFollowers ?? "—"],
        ].map(([label, value], i) => {
          const isEmpty = (value === 0 || value === "0") && label !== "YEARS PLAYING"
          return (
            <g key={String(label)} transform={`translate(22, ${74 + i * 36})`}>
              <text fontFamily={theme.fonts.mono} fontSize={8} fill={theme.colors.muted} letterSpacing="1" y={0}
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
        <line x1={12} y1={185} x2={W} y2={185} stroke={theme.colors.border} strokeWidth={0.75} opacity="0.5" />

        {/* ── Danceability scale ── */}
        <text x={22} y={198} fontFamily={theme.fonts.mono} fontSize={7} fill={theme.colors.muted} letterSpacing="1">EASY LISTENING</text>
        <text x={W - 16} y={198} fontFamily={theme.fonts.mono} fontSize={7} fill={theme.colors.muted} textAnchor="end" letterSpacing="1">DANCEABILITY</text>
        {/* Track */}
        <rect x={22} y={204} width={W - 44} height={5} rx={2.5} fill={theme.colors.surface} />
        {/* Fill */}
        <rect
          x={22}
          y={204}
          width={((stats?.danceabilityScale ?? 50) / 100) * (W - 44)}
          height={5}
          rx={2.5}
          fill={`url(#back-slash-grad${uid})`}
        />
        {/* Thumb */}
        <circle
          cx={22 + ((stats?.danceabilityScale ?? 50) / 100) * (W - 44)}
          cy={206.5}
          r={5}
          fill={theme.colors.gold}
        />

        {/* ── Genres ── */}
        <line x1={12} y1={222} x2={W} y2={222} stroke={theme.colors.border} strokeWidth={0.75} opacity="0.5" />
        {(genres ?? []).slice(0, 2).map((genre, i) => (
          <g key={genre} transform={`translate(${22 + i * 110}, 228)`}>
            <rect width={100} height={22} rx={11} fill="#1a0a2e" stroke="#7c3aed" strokeWidth={0.75} />
            <text
              x={50}
              y={11}
              fontFamily={theme.fonts.mono}
              fontSize={8}
              fill="#c084fc"
              textAnchor="middle"
              dominantBaseline="middle"
              letterSpacing="1"
            >
              {genre.toUpperCase()}
            </text>
          </g>
        ))}

        {/* ── Skills ── */}
        <line x1={12} y1={260} x2={W} y2={260} stroke={theme.colors.border} strokeWidth={0.75} opacity="0.5" />
        {(skills ?? []).slice(0, 8).map((skill, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const label = skillLabel(skill)
          const x = 18 + col * 80
          const y = 268 + row * 28
          return (
            <g key={skill} transform={`translate(${x}, ${y})`}>
              <rect width={72} height={22} rx={4} fill={theme.colors.surface} />
              <rect width={3} height={22} rx={1.5} fill="#7c3aed" opacity="0.7" />
              <text
                x={40}
                y={11}
                fontFamily={theme.fonts.mono}
                fontSize={7.5}
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

        {/* ── QR code ── */}
        {qrDataUrl && (
          <g transform={`translate(${W - 90}, ${H - 105})`}>
            <rect width={76} height={76} rx={6} fill="#fff" />
            <image href={qrDataUrl} x={4} y={4} width={68} height={68} />
            <text
              x={38}
              y={90}
              fontFamily={theme.fonts.mono}
              fontSize={7}
              fill={theme.colors.muted}
              textAnchor="middle"
              letterSpacing="1"
            >
              ARTIST PROFILE
            </text>
          </g>
        )}

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

        {/* ── Card border ── */}
        <rect
          x={1} y={1} width={W - 2} height={H - 2}
          rx={borderRadius} ry={borderRadius}
          fill="none"
          stroke={theme.colors.gold}
          strokeWidth={1.5}
          opacity="0.4"
        />
      </g>
    </svg>
  )
}
