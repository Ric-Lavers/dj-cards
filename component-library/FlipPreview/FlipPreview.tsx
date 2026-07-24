"use client"

import { useState } from "react"
import styled, { css } from "styled-components"
import { theme } from "@/styles/theme"

const W = theme.card.width
const H = theme.card.height

const Scene = styled.div`
  width: ${W}px;
  height: ${H}px;
  perspective: 1200px;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
`

const Inner = styled.div<{ $flipped: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  ${({ $flipped }) => $flipped && css`transform: rotateY(180deg);`}
`

const Face = styled.div<{ $back?: boolean }>`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  ${({ $back }) => $back && css`transform: rotateY(180deg);`}
`

const FadeFace = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.35s ease;
  pointer-events: ${({ $active }) => ($active ? "auto" : "none")};
`

const Hint = styled.p`
  text-align: center;
  margin-top: 0.4rem;
  font-size: 0.72rem;
  color: ${theme.colors.border};
  letter-spacing: 0.05em;
  user-select: none;
`

interface Props {
  faces: React.ReactNode[]
  showHint?: boolean
}

// With exactly 2 faces this keeps the original 3D rotateY flip. With 3+ faces
// (e.g. front/back/special-skills) a true multi-sided flip doesn't read well as
// a card metaphor, so it cycles through with a crossfade instead.
export const FlipPreview = ({ faces, showHint = true }: Props) => {
  const [index, s_index] = useState(0)

  function handleClick() {
    s_index((i) => (i + 1) % faces.length)
  }

  if (faces.length === 2) {
    const flipped = index === 1
    return (
      <div>
        <Scene onClick={handleClick}>
          <Inner $flipped={flipped}>
            <Face>{faces[0]}</Face>
            <Face $back>{faces[1]}</Face>
          </Inner>
        </Scene>
        {showHint && <Hint>{flipped ? "tap to flip back" : "tap to flip"}</Hint>}
      </div>
    )
  }

  return (
    <div>
      <Scene onClick={handleClick}>
        {faces.map((face, i) => (
          <FadeFace key={i} $active={i === index}>{face}</FadeFace>
        ))}
      </Scene>
      {showHint && <Hint>{index + 1}/{faces.length} · tap to cycle</Hint>}
    </div>
  )
}
