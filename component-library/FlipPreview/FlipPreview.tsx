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

const Hint = styled.p`
  text-align: center;
  margin-top: 0.4rem;
  font-size: 0.72rem;
  color: ${theme.colors.border};
  letter-spacing: 0.05em;
  user-select: none;
`

interface Props {
  front: React.ReactNode
  back: React.ReactNode
  showHint?: boolean
}

export const FlipPreview = ({ front, back, showHint = true }: Props) => {
  const [flipped, s_flipped] = useState(false)

  return (
    <div>
      <Scene onClick={() => s_flipped(v => !v)}>
        <Inner $flipped={flipped}>
          <Face>{front}</Face>
          <Face $back>{back}</Face>
        </Inner>
      </Scene>
      {showHint && <Hint>{flipped ? "tap to flip back" : "tap to flip"}</Hint>}
    </div>
  )
}
