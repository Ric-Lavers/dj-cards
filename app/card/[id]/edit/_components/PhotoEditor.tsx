"use client"

import { useState } from "react"
import { AxiosError } from "axios"
import * as S from "@/app/create/_components/create-page.styles"
import * as P from "./photo-editor.styles"
import api from "@/utils/api"
import { POSES } from "@/utils/poses"
import { prepareUpload } from "@/utils/resizeImage"
import type { PoseChoice } from "@/db/mongo/models/artist.schema"

type Source = "original" | "current" | "upload"

export type PhotoChange = {
  editedPhoto: string
  photo?: string
  poseChoice: PoseChoice
  customPose: string
}

// Re-generates a card's front image from a new pose/prompt. Source is the saved
// original upload (only cards made after originals started being stored have
// one), the current card image, or a fresh upload. Nothing is saved here — the
// result is staged via onChange and goes out with the form's "Save changes".
export const PhotoEditor = ({
  artist,
  onChange,
}: {
  artist: { photo?: string; editedPhoto?: string; poseChoice?: PoseChoice; customPose?: string }
  onChange: (change: PhotoChange | null) => void
}) => {
  const [source, s_source] = useState<Source>(artist.photo ? "original" : "current")
  const [uploadFile, s_uploadFile] = useState<File | null>(null)
  const [uploadPreview, s_uploadPreview] = useState<string | null>(null)
  const [pose, s_pose] = useState<PoseChoice>(artist.poseChoice ?? "natural")
  const [customPose, s_customPose] = useState(artist.customPose ?? "")
  const [result, s_result] = useState<string | null>(null)
  const [processing, s_processing] = useState(false)
  const [error, s_error] = useState<string | null>(null)

  const sourceUrl = source === "original" ? artist.photo : source === "current" ? artist.editedPhoto : uploadPreview

  async function handleUpload(file: File) {
    s_error(null)
    try {
      const ready = await prepareUpload(file)
      s_uploadFile(ready)
      s_uploadPreview(URL.createObjectURL(ready))
      s_source("upload")
    } catch {
      s_error("Could not read that image — please try another.")
    }
  }

  async function sourceFile(): Promise<File> {
    if (source === "upload" && uploadFile) return uploadFile
    const res = await fetch(sourceUrl!)
    if (!res.ok) throw new Error("Couldn't load the saved photo.")
    const blob = await res.blob()
    return new File([blob], "source.png", { type: blob.type || "image/png" })
  }

  async function handleGenerate() {
    if (!sourceUrl) return
    s_processing(true)
    s_error(null)
    try {
      const file = await sourceFile()
      let url: string
      if (pose === "cutout" && !customPose.trim()) {
        const { removeBackground } = await import("@imgly/background-removal")
        const opts: Record<string, unknown> = { model: "isnet_quint8" }
        if (process.env.NEXT_PUBLIC_BG_REMOVAL_PATH) opts.publicPath = process.env.NEXT_PUBLIC_BG_REMOVAL_PATH
        const cut = await removeBackground(file, opts)
        url = await blobToDataUrl(cut)
      } else {
        const fd = new FormData()
        fd.append("photo", file)
        fd.append("pose", pose)
        if (customPose.trim()) fd.append("customPose", customPose.trim())
        const res = await api.post("/photo", fd) as { url: string; error?: string }
        if (res.error) { s_error(res.error); return }
        url = res.url
      }
      s_result(url)
      onChange({
        editedPhoto: url,
        photo: source === "upload" ? await blobToDataUrl(file) : undefined,
        poseChoice: pose,
        customPose: customPose.trim(),
      })
    } catch (err) {
      const apiError = err instanceof AxiosError ? (err.response?.data?.error as string | undefined) : undefined
      s_error(apiError ?? (err instanceof Error ? err.message : undefined) ?? "Something went wrong — try again.")
    } finally {
      s_processing(false)
    }
  }

  function handleDiscard() {
    s_result(null)
    onChange(null)
  }

  return (
    <S.Section>
      <S.Label>Card Photo</S.Label>
      <P.PhotoRow>
        <P.PreviewArea $hasPhoto={!!sourceUrl} $processing={processing}>
          {result || artist.editedPhoto
            ? <S.PhotoThumb src={result ?? artist.editedPhoto} alt="Card photo" $dim={processing} />
            : <S.UploadPrompt>No photo yet</S.UploadPrompt>}
          {processing && <S.AiOverlay>Generating with AI...</S.AiOverlay>}
        </P.PreviewArea>
        {result && <P.StagedNote>New photo — hit “Save changes” to keep it.</P.StagedNote>}
      </P.PhotoRow>

      <P.SubLabel><S.Label>Start from</S.Label></P.SubLabel>
      <S.RadioGroup>
        {artist.photo && (
          <S.RadioOption type="button" $active={source === "original"} onClick={() => s_source("original")} disabled={processing}>
            📷 Original photo
          </S.RadioOption>
        )}
        {artist.editedPhoto && (
          <S.RadioOption type="button" $active={source === "current"} onClick={() => s_source("current")} disabled={processing}>
            🃏 Current card image
          </S.RadioOption>
        )}
        <P.UploadChip>
          <S.RadioOption type="button" $active={source === "upload"} disabled={processing}>
            ⬆️ {uploadFile ? "New upload" : "Upload new photo"}
          </S.RadioOption>
          {!processing && (
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
          )}
        </P.UploadChip>
      </S.RadioGroup>

      <P.SubLabel><S.Label>Pose</S.Label></P.SubLabel>
      <S.RadioGroup>
        {POSES.map(({ value, label, emoji }) => (
          <S.RadioOption key={value} type="button" $active={pose === value} onClick={() => s_pose(value)} disabled={processing}>
            {emoji} {label}
          </S.RadioOption>
        ))}
      </S.RadioGroup>
      <S.Textarea
        value={customPose}
        onChange={(e) => s_customPose(e.target.value)}
        placeholder="Or describe a new look / concept... (overrides the pose above)"
        rows={3}
        disabled={processing}
      />

      {error && <S.PhotoError>{error}</S.PhotoError>}

      <S.PhotoActions>
        <S.ProcessButton type="button" onClick={handleGenerate} disabled={processing || !sourceUrl}>
          {processing ? "Generating..." : result ? "Try again" : "Generate new photo"}
        </S.ProcessButton>
        {result && (
          <S.RetakeButton type="button" onClick={handleDiscard} disabled={processing}>
            Keep old photo
          </S.RetakeButton>
        )}
      </S.PhotoActions>
    </S.Section>
  )
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
