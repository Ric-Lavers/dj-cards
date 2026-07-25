"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"
import * as S from "@/app/create/_components/create-page.styles"
import api from "@/utils/api"

export default function CreateSpecialSkillPage() {
  const router = useRouter()
  const [name, s_name] = useState("")
  const [prompt, s_prompt] = useState("")
  const [includeEquipment, s_includeEquipment] = useState(true)
  const [generating, s_generating] = useState(false)
  const [generateError, s_generateError] = useState<string | null>(null)
  const [preview, s_preview] = useState<{ largeUrl: string; smallUrl: string } | null>(null)
  const [saving, s_saving] = useState(false)
  const [saveError, s_saveError] = useState<string | null>(null)

  function extractError(err: unknown) {
    return err instanceof AxiosError ? (err.response?.data?.error as string | undefined) : undefined
  }

  async function handleGenerate() {
    if (!name.trim()) return
    s_generating(true)
    s_generateError(null)
    try {
      const result = await api.post("/special-skills/preview", {
        name: name.trim(),
        prompt: prompt.trim(),
        includeEquipment,
      }) as { largeUrl: string; smallUrl: string; error?: string }
      if (result.error) { s_generateError(result.error); return }
      s_preview(result)
    } catch (err) {
      s_generateError(extractError(err) ?? "Something went wrong — try again.")
    } finally {
      s_generating(false)
    }
  }

  async function handleConfirm() {
    if (!preview) return
    s_saving(true)
    s_saveError(null)
    try {
      const skill = await api.post("/special-skills", {
        name: name.trim(),
        prompt: prompt.trim(),
        largeImage: preview.largeUrl,
        smallImage: preview.smallUrl,
      }) as { _id: string; error?: string }
      if (skill.error) { s_saveError(skill.error); return }
      router.push(`/special-skills/${skill._id}`)
    } catch (err) {
      s_saveError(extractError(err) ?? "Something went wrong — try again.")
    } finally {
      s_saving(false)
    }
  }

  return (
    <S.Page style={{ gridTemplateColumns: "1fr" }}>
      <S.FormCol style={{ maxWidth: 600, margin: "0 auto" }}>
        <S.Title>Create Special Skill</S.Title>

        <S.Section>
          <S.Label>Name</S.Label>
          <S.Input
            value={name}
            onChange={(e) => s_name(e.target.value)}
            placeholder="e.g. Bass Drop"
            required
          />
        </S.Section>

        <S.Section>
          <S.Label>Prompt</S.Label>
          <S.Textarea
            value={prompt}
            onChange={(e) => s_prompt(e.target.value)}
            placeholder="Describe the moment — what happens, how it feels, the energy in the room."
            rows={4}
          />
        </S.Section>

        <S.Section>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={includeEquipment}
              onChange={(e) => s_includeEquipment(e.target.checked)}
              style={{ accentColor: "#c9a84c" }}
            />
            <span style={{ color: "#6b6b80", fontSize: "0.85rem" }}>Include DJ equipment in the icon</span>
          </label>
        </S.Section>

        {generateError && <S.PhotoError>{generateError}</S.PhotoError>}

        {!preview ? (
          <S.SubmitButton type="button" onClick={handleGenerate} disabled={generating || !name.trim()}>
            {generating ? "Generating..." : "Generate Icon"}
          </S.SubmitButton>
        ) : (
          <S.Section>
            <S.SectionHeading>Preview</S.SectionHeading>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
              <div>
                <img src={preview.largeUrl} alt="Large icon" style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 8 }} />
                <S.Label style={{ marginTop: "0.4rem" }}>Large (card)</S.Label>
              </div>
              <div>
                <img src={preview.smallUrl} alt="Small icon" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                <S.Label style={{ marginTop: "0.4rem" }}>Small (list)</S.Label>
              </div>
            </div>
            {saveError && <S.SubmitError>{saveError}</S.SubmitError>}
            <S.PhotoActions>
              <S.ProcessButton type="button" onClick={handleConfirm} disabled={saving}>
                {saving ? "Saving..." : "Confirm & Save"}
              </S.ProcessButton>
              <S.RetakeButton type="button" onClick={() => { s_preview(null); s_generateError(null) }} disabled={saving}>
                Regenerate
              </S.RetakeButton>
            </S.PhotoActions>
          </S.Section>
        )}
      </S.FormCol>
    </S.Page>
  )
}
