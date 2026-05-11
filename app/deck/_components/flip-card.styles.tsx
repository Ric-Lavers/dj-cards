import styled, { css, keyframes } from "styled-components"
import { theme } from "@/styles/theme"

const W = theme.card.width
const H = theme.card.height

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${W}px, 1fr));
  gap: 2rem;
  padding: 2rem;
  justify-items: center;

  @media screen and (width < ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`

export const Scene = styled.div`
  width: ${W}px;
  height: ${H}px;
  perspective: 1200px;
  cursor: pointer;
`

export const Inner = styled.div<{ $flipped: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  ${({ $flipped }) => $flipped && css`transform: rotateY(180deg);`}
`

export const Face = styled.div<{ $back?: boolean }>`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  ${({ $back }) => $back && css`transform: rotateY(180deg);`}
`

export const CardNumber = styled.p`
  text-align: center;
  margin-top: 0.6rem;
  font-size: 0.75rem;
  font-family: ${theme.fonts.mono};
  color: ${theme.colors.muted};
  letter-spacing: 0.1em;
`

export const HintTap = styled.p`
  text-align: center;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: ${theme.colors.border};
  letter-spacing: 0.05em;
`
