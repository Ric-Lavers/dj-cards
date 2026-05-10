"use client"

import { useRef, useState } from "react"
import { downloadSvgAsPng } from "@/utils/downloadCard"
import styled from "styled-components"
import { theme } from "@/styles/theme"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
`

const DownloadBtn = styled.button<{ $loading: boolean }>`
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${({ $loading }) => ($loading ? theme.colors.muted : theme.colors.white)};
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: ${({ $loading }) => ($loading ? "wait" : "pointer")};
  transition: border-color 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.gold};
    color: ${theme.colors.gold};
  }
`

interface Props {
  label: string
  filename: string
  children: React.ReactNode
}

export const DownloadableCard = ({ label, filename, children }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [loading, s_loading] = useState(false)

  async function handleDownload() {
    const svg = wrapperRef.current?.querySelector("svg")
    if (!svg) return
    s_loading(true)
    try {
      await downloadSvgAsPng(svg as SVGSVGElement, filename)
    } finally {
      s_loading(false)
    }
  }

  return (
    <Wrapper>
      <div ref={wrapperRef}>{children}</div>
      <DownloadBtn $loading={loading} onClick={handleDownload} disabled={loading}>
        {loading ? "Preparing..." : `↓ Download ${label}`}
      </DownloadBtn>
    </Wrapper>
  )
}
