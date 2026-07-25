import styled from "styled-components"
import { theme } from "@/styles/theme"

export const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.7rem 1.5rem;
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 50;

  @media print {
    display: none;
  }

  @media screen and (width < ${theme.breakpoints.sm}) {
    gap: 1rem;
    padding: 0.6rem 1rem;
    overflow-x: auto;
  }
`

export const Wordmark = styled.a`
  font-family: ${theme.fonts.heading};
  font-weight: 900;
  font-size: 1rem;
  color: ${theme.colors.white};
  text-decoration: none;
  white-space: nowrap;
`

export const Links = styled.nav`
  display: flex;
  gap: 1.1rem;
  margin-left: auto;

  @media screen and (width < ${theme.breakpoints.sm}) {
    gap: 0.85rem;
  }
`

export const NavLink = styled.a<{ $active: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  white-space: nowrap;
  color: ${(p) => (p.$active ? theme.colors.gold : theme.colors.muted)};

  &:hover {
    color: ${theme.colors.goldLight};
  }
`
