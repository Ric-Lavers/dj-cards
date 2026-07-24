"use client"

import { memo, useState } from "react"
import { SkillCardFront, SkillCardBack } from "@/component-library"
import * as S from "../../_components/print-page.styles"

type Mode = "fronts" | "backs" | "both"
type Skill = { _id: string; name: string; largeImage: string }

const LAYOUTS = [
  { cols: 2, rows: 2, label: "2 × 2" },
  { cols: 3, rows: 2, label: "3 × 2" },
  { cols: 3, rows: 3, label: "3 × 3" },
  { cols: 4, rows: 3, label: "4 × 3" },
  { cols: 1, rows: 1, label: "1 / page" },
] as const

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Marks positioned relative to BleedCardWrap (the trim edge).
function CropMarks() {
  const gap = "1mm"
  const len = "4mm"
  const thick = "0.75px"
  return (
    <>
      <S.Mark style={{ top: 0, right: `calc(100% + ${gap})`, width: len, height: thick }} />
      <S.Mark style={{ right: "100%", bottom: `calc(100% + ${gap})`, width: thick, height: len }} />
      <S.Mark style={{ top: 0, left: `calc(100% + ${gap})`, width: len, height: thick }} />
      <S.Mark style={{ left: "100%", bottom: `calc(100% + ${gap})`, width: thick, height: len }} />
      <S.Mark style={{ bottom: 0, right: `calc(100% + ${gap})`, width: len, height: thick }} />
      <S.Mark style={{ right: "100%", top: `calc(100% + ${gap})`, width: thick, height: len }} />
      <S.Mark style={{ bottom: 0, left: `calc(100% + ${gap})`, width: len, height: thick }} />
      <S.Mark style={{ left: "100%", top: `calc(100% + ${gap})`, width: thick, height: len }} />
    </>
  )
}

const PrintSkillCard = memo(({ skill, face, cutMarks }: { skill: Skill; face: "front" | "back"; cutMarks: boolean }) => (
  <S.CardWrap $cutMarks={cutMarks}>
    {face === "front" ? (
      <SkillCardFront name={skill.name} largeImage={skill.largeImage} instanceId={`print-f-${skill._id}`} squareCorners />
    ) : (
      <SkillCardBack instanceId={`print-b-${skill._id}`} squareCorners />
    )}
  </S.CardWrap>
))
PrintSkillCard.displayName = "PrintSkillCard"

interface Props {
  skills: Skill[]
}

export const SkillPrintPage = ({ skills }: Props) => {
  const [selectedIds, s_selectedIds] = useState<Set<string>>(
    () => new Set(skills.map(s => s._id))
  )
  const [mode, s_mode] = useState<Mode>("fronts")
  const [layoutIdx, s_layoutIdx] = useState(2)
  const [cutMarks, s_cutMarks] = useState(false)

  const layout = LAYOUTS[layoutIdx]
  const isSinglePage = layout.cols === 1 && layout.rows === 1
  const cardsPerSheet = layout.cols * layout.rows
  const selected = skills.filter(s => selectedIds.has(s._id))

  function toggleId(id: string) {
    s_selectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() { s_selectedIds(new Set(skills.map(s => s._id))) }
  function selectNone() { s_selectedIds(new Set()) }

  const frontSheets = chunk(selected, cardsPerSheet)
  const backSheets = chunk(selected, cardsPerSheet)

  type SheetEntry = { key: string; face: "front" | "back"; label: string; cards: Skill[] }

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

  const bleedPages: { skill: Skill; face: "front" | "back"; key: string }[] = []
  if (isSinglePage) {
    if (mode === "both") {
      selected.forEach(s => {
        bleedPages.push({ skill: s, face: "front", key: `bleed-f-${s._id}` })
        bleedPages.push({ skill: s, face: "back", key: `bleed-b-${s._id}` })
      })
    } else {
      const face = mode === "backs" ? "back" : "front"
      selected.forEach(s => bleedPages.push({ skill: s, face, key: `bleed-${face[0]}-${s._id}` }))
    }
  }

  return (
    <>
      {isSinglePage ? <S.BleedGlobal /> : <S.PrintGlobal />}
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
              Special Skills — {selectedIds.size} / {skills.length}
            </S.Label>
            <S.SelectActions>
              <S.GhostBtn onClick={selectAll}>All</S.GhostBtn>
              <S.GhostBtn onClick={selectNone}>None</S.GhostBtn>
            </S.SelectActions>
            <S.CardList>
              {skills.map(s => (
                <S.CardItem key={s._id}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s._id)}
                    onChange={() => toggleId(s._id)}
                  />
                  {s.name}
                </S.CardItem>
              ))}
            </S.CardList>
          </S.ControlSection>
        </S.Controls>

        <S.Preview>
          <S.PreviewMeta>
            {selected.length} card{selected.length !== 1 ? "s" : ""}
            {isSinglePage
              ? ` · ${bleedPages.length} page${bleedPages.length !== 1 ? "s" : ""}`
              : ` · ${totalSheets} sheet${totalSheets !== 1 ? "s" : ""}${mode === "both" ? ` (${frontSheets.length} fronts + ${backSheets.length} backs)` : ""}`}
          </S.PreviewMeta>

          {selected.length === 0 && <S.Empty>No special skills selected.</S.Empty>}

          {isSinglePage
            ? bleedPages.map((p, idx) => (
                <S.BleedSheet key={p.key} $last={idx === bleedPages.length - 1}>
                  <S.BleedCardWrap>
                    {p.face === "front" ? (
                      <SkillCardFront name={p.skill.name} largeImage={p.skill.largeImage} instanceId={`bleed-f-${p.skill._id}`} squareCorners />
                    ) : (
                      <SkillCardBack instanceId={`bleed-b-${p.skill._id}`} squareCorners />
                    )}
                    <CropMarks />
                  </S.BleedCardWrap>
                </S.BleedSheet>
              ))
            : sheets.map((sheet, idx) => (
                <S.SheetContainer key={sheet.key} $pageBreak={idx > 0}>
                  <S.SheetLabel>{sheet.label}</S.SheetLabel>
                  <S.Sheet $cols={layout.cols}>
                    {sheet.cards.map(skill => (
                      <PrintSkillCard key={skill._id} skill={skill} face={sheet.face} cutMarks={cutMarks} />
                    ))}
                  </S.Sheet>
                </S.SheetContainer>
              ))}
        </S.Preview>
      </S.Layout>
    </>
  )
}
