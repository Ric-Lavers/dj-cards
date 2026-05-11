"use client"

import { memo, useState } from "react"
import type { ArtistDoc } from "@/db/mongo/models/artist.schema"
import { CardFront, CardBack } from "@/component-library"
import * as S from "./print-page.styles"

type Mode = "fronts" | "backs" | "both"

const LAYOUTS = [
  { cols: 2, rows: 2, label: "2 × 2" },
  { cols: 3, rows: 2, label: "3 × 2" },
  { cols: 3, rows: 3, label: "3 × 3" },
  { cols: 4, rows: 3, label: "4 × 3" },
] as const

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

type Artist = Partial<ArtistDoc> & { _id: string }

const PrintCard = memo(({ artist, face, cutMarks }: { artist: Artist; face: "front" | "back"; cutMarks: boolean }) => (
  <S.CardWrap $cutMarks={cutMarks}>
    {face === "front" ? (
      <CardFront
        djName={artist.djName ?? ""}
        editedPhoto={artist.editedPhoto}
        cardNumber={artist.cardNumber}
        instanceId={`print-f-${artist._id}`}
      />
    ) : (
      <CardBack
        artist={artist}
        qrDataUrl={artist.qrCodeUrl}
        instanceId={`print-b-${artist._id}`}
      />
    )}
  </S.CardWrap>
))
PrintCard.displayName = "PrintCard"

interface Props {
  artists: Artist[]
}

export const PrintPage = ({ artists }: Props) => {
  const [selectedIds, s_selectedIds] = useState<Set<string>>(
    () => new Set(artists.map(a => a._id))
  )
  const [mode, s_mode] = useState<Mode>("fronts")
  const [layoutIdx, s_layoutIdx] = useState(2)
  const [cutMarks, s_cutMarks] = useState(false)

  const layout = LAYOUTS[layoutIdx]
  const cardsPerSheet = layout.cols * layout.rows
  const selected = artists.filter(a => selectedIds.has(a._id))

  function toggleId(id: string) {
    s_selectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() { s_selectedIds(new Set(artists.map(a => a._id))) }
  function selectNone() { s_selectedIds(new Set()) }

  const frontSheets = chunk(selected, cardsPerSheet)
  const backSheets = chunk(selected, cardsPerSheet)

  type SheetEntry = {
    key: string
    face: "front" | "back"
    label: string
    cards: Artist[]
  }

  const sheets: SheetEntry[] = []
  if (mode === "fronts" || mode === "both") {
    frontSheets.forEach((cards, i) =>
      sheets.push({
        key: `front-${i}`,
        face: "front",
        label: `Fronts — sheet ${i + 1}${mode === "both" ? ` of ${frontSheets.length + backSheets.length}` : ""}`,
        cards,
      })
    )
  }
  if (mode === "backs" || mode === "both") {
    backSheets.forEach((cards, i) =>
      sheets.push({
        key: `back-${i}`,
        face: "back",
        label: `Backs — sheet ${(mode === "both" ? frontSheets.length : 0) + i + 1}${mode === "both" ? ` of ${frontSheets.length + backSheets.length}` : ""}`,
        cards,
      })
    )
  }

  const totalSheets = mode === "both" ? frontSheets.length + backSheets.length : frontSheets.length

  return (
    <>
      <S.PrintGlobal />
      <S.Layout>
        <S.Controls>
          <S.PrintBtn onClick={() => window.print()}>Print</S.PrintBtn>

          <S.ControlSection>
            <S.Label>Page type</S.Label>
            <S.ButtonGroup>
              {(["fronts", "backs", "both"] as Mode[]).map(m => (
                <S.ToggleBtn key={m} $active={mode === m} onClick={() => s_mode(m)}>
                  {m}
                </S.ToggleBtn>
              ))}
            </S.ButtonGroup>
          </S.ControlSection>

          <S.ControlSection>
            <S.Label>Layout</S.Label>
            <S.ButtonGroup>
              {LAYOUTS.map((l, i) => (
                <S.ToggleBtn key={l.label} $active={layoutIdx === i} onClick={() => s_layoutIdx(i)}>
                  {l.label}
                </S.ToggleBtn>
              ))}
            </S.ButtonGroup>
          </S.ControlSection>

          <S.ControlSection>
            <S.CheckboxRow>
              <input type="checkbox" checked={cutMarks} onChange={e => s_cutMarks(e.target.checked)} />
              Cut marks
            </S.CheckboxRow>
          </S.ControlSection>

          <S.ControlSection style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <S.Label>
              Cards — {selectedIds.size} / {artists.length}
            </S.Label>
            <S.SelectActions>
              <S.GhostBtn onClick={selectAll}>All</S.GhostBtn>
              <S.GhostBtn onClick={selectNone}>None</S.GhostBtn>
            </S.SelectActions>
            <S.CardList>
              {artists.map(a => (
                <S.CardItem key={a._id}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(a._id)}
                    onChange={() => toggleId(a._id)}
                  />
                  <S.CardNum>#{String(a.cardNumber ?? 0).padStart(4, "0")}</S.CardNum>
                  {a.djName}
                </S.CardItem>
              ))}
            </S.CardList>
          </S.ControlSection>
        </S.Controls>

        <S.Preview>
          <S.PreviewMeta>
            {selected.length} card{selected.length !== 1 ? "s" : ""} · {totalSheets} sheet{totalSheets !== 1 ? "s" : ""}
            {mode === "both" && ` (${frontSheets.length} fronts + ${backSheets.length} backs)`}
          </S.PreviewMeta>

          {selected.length === 0 && <S.Empty>No cards selected.</S.Empty>}

          {sheets.map((sheet, idx) => (
            <S.SheetContainer key={sheet.key} $pageBreak={idx > 0}>
              <S.SheetLabel>{sheet.label}</S.SheetLabel>
              <S.Sheet $cols={layout.cols}>
                {sheet.cards.map(artist => (
                  <PrintCard key={artist._id} artist={artist} face={sheet.face} cutMarks={cutMarks} />
                ))}
              </S.Sheet>
            </S.SheetContainer>
          ))}
        </S.Preview>
      </S.Layout>
    </>
  )
}
