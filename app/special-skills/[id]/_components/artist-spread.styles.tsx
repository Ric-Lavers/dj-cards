import styled from "styled-components"
import { theme } from "@/styles/theme"

export const Empty = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.9rem;
`

export const Spread = styled.div`
  position: relative;
  padding: 0.5rem 0 1.5rem 1.25rem;

  @media screen and (width >= ${theme.breakpoints.md}) {
    height: 230px;
    padding: 0.5rem 0 1rem 8px;
  }
`

export const Tile = styled.div<{ $index: number; $active: boolean }>`
  position: relative;
  width: 58%;
  max-width: 175px;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: ${({ $active }) => ($active ? 50 : 1)};
  margin-top: ${({ $index }) => ($index === 0 ? 0 : "-165px")};
  transform: rotate(${({ $index }) => ($index % 2 === 0 ? -3 : 3)}deg);

  &:hover {
    z-index: 40;
    transform: rotate(0deg) translateX(16px);
  }

  @media screen and (width >= ${theme.breakpoints.md}) {
    position: absolute;
    width: 130px;
    max-width: none;
    margin-top: 0;
    left: ${({ $index }) => $index * 68}px;
    top: 0;
    transform: rotate(${({ $index }) => ($index % 2 === 0 ? -4 : 4)}deg);

    &:hover {
      z-index: 40;
      transform: translateY(-10px) rotate(0deg);
    }
  }

  ${({ $active }) =>
    $active &&
    `
    transform: rotate(0deg) scale(1.06) !important;
    z-index: 50 !important;
  `}
`

export const TileImg = styled.img`
  width: 100%;
  aspect-ratio: 350 / 490;
  object-fit: cover;
  border-radius: 8px;
  border: 1.5px solid ${theme.colors.border};
  display: block;
  background: ${theme.colors.surface};
`

export const TileName = styled.p`
  margin-top: 0.35rem;
  font-size: 0.7rem;
  color: ${theme.colors.white};
  font-family: ${theme.fonts.mono};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Menu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  z-index: 100;
  min-width: 130px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`

export const MenuLink = styled.a<{ $disabled?: boolean }>`
  display: block;
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
  color: ${({ $disabled }) => ($disabled ? theme.colors.muted : theme.colors.gold)};
  text-decoration: none;
  border-radius: 4px;
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:hover {
    background: ${theme.colors.surface};
  }
`
