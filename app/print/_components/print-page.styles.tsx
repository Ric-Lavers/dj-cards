"use client"

import styled, { createGlobalStyle } from "styled-components"
import { theme } from "@/styles/theme"

export const PrintGlobal = createGlobalStyle`
  @page { margin: 10mm; }
  @media print {
    body { background: white !important; }
    * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
`

export const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.black};
  color: ${theme.colors.white};
  @media print {
    display: block;
    background: white;
  }
`

export const Controls = styled.aside`
  width: 256px;
  flex-shrink: 0;
  background: ${theme.colors.surface};
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
  @media print { display: none; }
`

export const Preview = styled.main`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  @media print { padding: 0; }
`

export const SheetContainer = styled.div<{ $pageBreak: boolean }>`
  margin-bottom: 2.5rem;
  @media print {
    margin-bottom: 0;
    ${p => p.$pageBreak && "break-before: page;"}
  }
`

export const Sheet = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${p => p.$cols}, 2.5in);
  gap: 4mm;
  width: fit-content;

  @media screen {
    background: white;
    padding: 10mm;
    border-radius: 4px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
  }
`

export const CardWrap = styled.div<{ $cutMarks: boolean }>`
  width: 2.5in;
  height: 3.5in;
  flex-shrink: 0;

  svg {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }

  @media print {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    ${p => p.$cutMarks && `
      outline: 0.5pt dashed #aaa;
      outline-offset: 2mm;
    `}
  }

  @media screen {
    ${p => p.$cutMarks && `
      outline: 1px dashed #aaa;
      outline-offset: 4px;
    `}
  }
`

export const SheetLabel = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 0.68rem;
  color: ${theme.colors.muted};
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
  @media print { display: none; }
`

export const ControlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

export const Label = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: ${theme.colors.muted};
  text-transform: uppercase;
  margin: 0;
`

export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`

export const ToggleBtn = styled.button<{ $active: boolean }>`
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  font-family: ${theme.fonts.mono};
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  border: 1px solid ${p => (p.$active ? theme.colors.gold : theme.colors.border)};
  background: ${p => (p.$active ? "#1c1409" : "transparent")};
  color: ${p => (p.$active ? theme.colors.gold : theme.colors.muted)};
  cursor: pointer;
  white-space: nowrap;
`

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 0.25rem;
`

export const CardItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.4rem;
  border-radius: 3px;
  cursor: pointer;
  font-family: ${theme.fonts.mono};
  font-size: 0.7rem;
  color: ${theme.colors.white};

  &:hover { background: ${theme.colors.border}; }

  input[type="checkbox"] { accent-color: ${theme.colors.gold}; }
`

export const CardNum = styled.span`
  color: ${theme.colors.muted};
  min-width: 2.8rem;
`

export const PrintBtn = styled.button`
  width: 100%;
  padding: 0.6rem;
  background: ${theme.colors.gold};
  color: #0a0a0a;
  border: none;
  border-radius: 6px;
  font-family: ${theme.fonts.heading};
  font-size: 0.85rem;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 0.05em;
  &:hover { background: ${theme.colors.goldLight}; }
`

export const SelectActions = styled.div`
  display: flex;
  gap: 0.4rem;
`

export const GhostBtn = styled.button`
  flex: 1;
  padding: 0.28rem;
  border-radius: 4px;
  font-family: ${theme.fonts.mono};
  font-size: 0.68rem;
  border: 1px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.muted};
  cursor: pointer;
  &:hover { border-color: ${theme.colors.gold}; color: ${theme.colors.gold}; }
`

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${theme.fonts.mono};
  font-size: 0.72rem;
  color: ${theme.colors.muted};
  cursor: pointer;
  input[type="checkbox"] { accent-color: ${theme.colors.gold}; }
`

export const PreviewMeta = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 0.7rem;
  color: ${theme.colors.muted};
  margin-bottom: 1rem;
  @media print { display: none; }
`

export const Empty = styled.div`
  padding: 4rem 2rem;
  font-family: ${theme.fonts.mono};
  font-size: 0.85rem;
  color: ${theme.colors.muted};
`
