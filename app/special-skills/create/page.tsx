"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import * as S from "@/app/create/_components/create-page.styles"
import api from "@/utils/api"

export default function CreateSpecialSkillPage() {
  const router = useRouter()
  const [name, s_name] = useState("")
  const [prompt, s_prompt] = useState("")
  const [iconFile, s_iconFile] = useState<File | null>(null)
  const [iconPreview, s_iconPreview] = useState<string | null>(null)
  const [generating, s_generating] = useState(false)
  const [generateError, s_generateError] = useState<string | null>(null)
  const [preview, s_preview] = useState<{ largeUrl: string; smallUrl: string; sourcePhoto: string } | null>(null)
  const [saving, s_saving] = useState(false)
  const [saveError, s_saveError] = useState<string | null>(null)

  function loadFile(file: File) {
    s_preview(null)
    s_generateError(null)
    s_iconFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => s_iconPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) loadFile(accepted[0])
  }, [])

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: generating,
    noClick: true,
    noKeyboard: true,
  })

  async function handleGenerate() {
    if (!iconFile || !name.trim()) return
    s_generating(true)
    s_generateError(null)
    try {
      const fd = new FormData()
      fd.append("icon", iconFile)
      fd.append("name", name.trim())
      fd.append("prompt", prompt.trim())
      const result = await api.post("/special-skills/preview", fd) as { largeUrl: string; smallUrl: string; sourcePhoto: string; error?: string }
      if (result.error) { s_generateError(result.error); return }
      s_preview(result)
    } catch (err: any) {
      s_generateError(err?.response?.data?.error ?? "Something went wrong — try again.")
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
        sourcePhoto: preview.sourcePhoto,
      }) as { _id: string; error?: string }
      if (skill.error) { s_saveError(skill.error); return }
      router.push(`/special-skills/${skill._id}`)
    } catch (err: any) {
      s_saveError(err?.response?.data?.error ?? "Something went wrong — try again.")
    } finally {
      s_saving(false)
    }
  }

  return (
    <S.Page style={{ gridTemplateColumns: "1fr" }}>
      <S.FormCol style={{ maxWidth: 600, margin: "0 auto" }}>
        <S.Title>Create Special Skill</S.Title>

        <S.Section>
          <S.SectionHeading>Special Skill Icon</S.SectionHeading>
          <S.UploadArea
            {...getRootProps()}
            $hasPhoto={!!iconPreview}
            $processing={generating}
            $isDragging={isDragActive}
          >
            {!generating && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 2 }}
              />
            )}
            {iconPreview
              ? <S.PhotoThumb src={preview?.largeUrl ?? iconPreview} alt="Special skill icon reference" $dim={generating} />
              : <S.UploadPrompt>{isDragActive ? "Drop it!" : "Tap or drag a reference image here"}</S.UploadPrompt>
            }
            {generating && <S.AiOverlay>Generating icon with AI...</S.AiOverlay>}
          </S.UploadArea>
          {generateError && <S.PhotoError>{generateError}</S.PhotoError>}
        </S.Section>

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
            placeholder="Describe the concept for the icon — what does this move look/feel like?"
            rows={3}
          />
        </S.Section>

        {!preview ? (
          <S.SubmitButton type="button" onClick={handleGenerate} disabled={generating || !iconFile || !name.trim()}>
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
