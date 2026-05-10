"use client"

import { useState, useCallback, useEffect, useRef, memo } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import * as S from "./_components/create-page.styles"
import { CardFront, CardBack, FlipPreview } from "@/component-library"
import api from "@/utils/api"
import type { PoseChoice, Skill } from "@/db/mongo/models/artist.schema"

const POSES: { value: PoseChoice; label: string; emoji: string }[] = [
  { value: "hands_in_air",  label: "Hands in the Air", emoji: "🙌" },
  { value: "knob_twiddler", label: "Knob Twiddler",    emoji: "🎛️" },
  { value: "headphone_grab",label: "Headphone Grab",   emoji: "🎧" },
  { value: "fist_pump",     label: "Fist Pump",        emoji: "✊" },
  { value: "the_lean",      label: "The Lean",         emoji: "🫦" },
  { value: "eyes_closed",   label: "Eyes Closed",      emoji: "😌" },
  { value: "natural",       label: "Natural",          emoji: "🪄" },
]

const ALL_GENRES = ["House", "Techno", "Drum & Bass", "Jungle", "Disco", "Electro", "Trance", "Ambient", "Hip-Hop", "Funk"]

const ALL_SKILLS: { value: Skill; label: string }[] = [
  { value: "scratching", label: "Scratching" },
  { value: "long_mixes", label: "Long Mixes" },
  { value: "vinyl", label: "Vinyl" },
  { value: "cdjs", label: "CDJs" },
  { value: "ableton", label: "Ableton" },
  { value: "guitar", label: "Guitar" },
  { value: "vocalist", label: "Vocalist" },
]

const defaultForm = {
  djName: "",
  poseChoice: "headphone_grab" as PoseChoice,
  customPose: "",
  genres: [] as string[],
  yearsPlaying: 0,
  tracksUploaded: 0,
  totalFollowers: 0,
  bpm: 128,
  danceabilityScale: 50,
  skills: [] as Skill[],
  email: "",
  instagram: "",
  address: "",
}

export default function CreatePage() {
  const router = useRouter()
  const [form, s_form] = useState(defaultForm)
  const [photoFile, s_photoFile] = useState<File | null>(null)
  const [photoPreview, s_photoPreview] = useState<string | null>(null)
  const [editedPhoto, s_editedPhoto] = useState<string | null>(null)
  const [processingPhoto, s_processingPhoto] = useState(false)
  const [photoError, s_photoError] = useState<string | null>(null)
  const [loading, s_loading] = useState(false)
  const [sheetOpen, s_sheetOpen] = useState(false)
  const [showPeek, s_showPeek] = useState(false)
  const inlinePreviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = inlinePreviewRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => s_showPeek(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const customPoseDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleField<K extends keyof typeof defaultForm>(key: K, value: typeof defaultForm[K]) {
    s_form((prev) => ({ ...prev, [key]: value }))
  }

  function toggleGenre(genre: string) {
    s_form((prev) => {
      const has = prev.genres.includes(genre)
      if (has) return { ...prev, genres: prev.genres.filter((g) => g !== genre) }
      if (prev.genres.length >= 2) return prev
      return { ...prev, genres: [...prev.genres, genre] }
    })
  }

  function toggleSkill(skill: Skill) {
    s_form((prev) => {
      const has = prev.skills.includes(skill)
      return { ...prev, skills: has ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill] }
    })
  }

  function loadFile(file: File) {
    s_photoFile(file)
    s_editedPhoto(null)
    const reader = new FileReader()
    reader.onload = (ev) => s_photoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // noClick — let native <input> handle tap/click directly (fixes iOS)
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) loadFile(accepted[0])
  }, [])

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: processingPhoto,
    noClick: true,   // we handle click via native <input> overlay
    noKeyboard: true,
  })

  async function handleProcessPhoto(file = photoFile, pose = form.poseChoice, custom = form.customPose) {
    if (!file) return
    s_processingPhoto(true)
    s_photoError(null)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      fd.append("pose", pose)
      if (custom.trim()) fd.append("customPose", custom.trim())
      const result = await api.post("/photo", fd) as { url: string; error?: string }
      if (result.error) { s_photoError(result.error); return }
      s_editedPhoto(result.url)
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Something went wrong — try again."
      s_photoError(msg)
    } finally {
      s_processingPhoto(false)
    }
  }

  useEffect(() => {
    if (!photoFile) return
    handleProcessPhoto(photoFile, form.poseChoice, form.customPose)
  }, [form.poseChoice])

  useEffect(() => {
    if (!photoFile) return
    if (customPoseDebounce.current) clearTimeout(customPoseDebounce.current)
    customPoseDebounce.current = setTimeout(() => {
      handleProcessPhoto(photoFile, form.poseChoice, form.customPose)
    }, 900)
    return () => { if (customPoseDebounce.current) clearTimeout(customPoseDebounce.current) }
  }, [form.customPose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    s_loading(true)
    try {
      const payload = {
        djName: form.djName,
        poseChoice: form.poseChoice,
        customPose: form.customPose,
        genres: form.genres,
        photo: photoPreview ?? "",
        editedPhoto: editedPhoto ?? "",
        stats: {
          yearsPlaying: form.yearsPlaying,
          tracksUploaded: form.tracksUploaded,
          totalFollowers: form.totalFollowers,
          bpm: form.bpm,
          danceabilityScale: form.danceabilityScale,
        },
        skills: form.skills,
        contactDetails: { email: form.email, instagram: form.instagram, address: form.address },
      }
      const artist = await api.post("/artist", payload)
      // @ts-ignore
      router.push(`/card/${artist._id}`)
    } finally {
      s_loading(false)
    }
  }

  const previewArtist = {
    djName: form.djName,
    genres: form.genres as [string, string],
    poseChoice: form.poseChoice,
    skills: form.skills,
    stats: {
      yearsPlaying: form.yearsPlaying,
      tracksUploaded: form.tracksUploaded,
      totalFollowers: form.totalFollowers,
      bpm: form.bpm,
      danceabilityScale: form.danceabilityScale,
    },
  }

  const front = <CardFront djName={form.djName} editedPhoto={editedPhoto ?? photoPreview ?? undefined} />
  const back = <CardBack artist={previewArtist} />

  return (
    <S.Page>
      <S.FormCol>
        <S.Title>Create Your Card</S.Title>
        <form onSubmit={handleSubmit}>

          <S.Section>
            <S.SectionHeading>Your Photo</S.SectionHeading>
            <S.UploadArea
              {...getRootProps()}
              $hasPhoto={!!photoPreview}
              $processing={processingPhoto}
              $isDragging={isDragActive}
            >
              {/* Native input overlay — handles click/tap directly, avoids iOS programmatic-click block */}
              {!processingPhoto && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 2 }}
                />
              )}
              {photoPreview
                ? <S.PhotoThumb src={photoPreview} alt="Your photo" $dim={processingPhoto} />
                : <S.UploadPrompt>{isDragActive ? "Drop it!" : "Tap or drag a photo here"}</S.UploadPrompt>
              }
              {processingPhoto && <S.AiOverlay>Generating with AI...</S.AiOverlay>}
            </S.UploadArea>

            {photoError && <S.PhotoError>{photoError}</S.PhotoError>}

            {photoFile && (
              <S.PhotoActions>
                <S.ProcessButton type="button" onClick={() => handleProcessPhoto()} disabled={processingPhoto}>
                  {processingPhoto ? "Processing..." : editedPhoto ? "Re-apply AI Style" : "Apply AI Style"}
                </S.ProcessButton>
                <S.RetakeButton type="button" onClick={() => { s_editedPhoto(null); s_photoFile(null); s_photoPreview(null) }}>
                  Retake
                </S.RetakeButton>
              </S.PhotoActions>
            )}
          </S.Section>

          <S.Section>
            <S.Label>DJ Name</S.Label>
            <S.Input
              value={form.djName}
              onChange={(e) => handleField("djName", e.target.value)}
              placeholder="DJ ..."
              required
            />
          </S.Section>

          <S.Section>
            <S.Label>Pose</S.Label>
            <S.RadioGroup>
              {POSES.map(({ value, label, emoji }) => (
                <S.RadioOption key={value} $active={form.poseChoice === value} onClick={() => handleField("poseChoice", value)} type="button">
                  {emoji} {label}
                </S.RadioOption>
              ))}
            </S.RadioGroup>
            <S.CustomPoseInput
              value={form.customPose}
              onChange={(e) => handleField("customPose", e.target.value)}
              placeholder="Or describe your own pose... (overrides selection above)"
            />
          </S.Section>

          <S.Section>
            <S.Label>Genres (pick 2)</S.Label>
            <S.ChipGroup>
              {ALL_GENRES.map((genre) => (
                <S.Chip
                  key={genre}
                  $active={form.genres.includes(genre)}
                  $disabled={!form.genres.includes(genre) && form.genres.length >= 2}
                  onClick={() => toggleGenre(genre)}
                  type="button"
                >
                  {genre}
                </S.Chip>
              ))}
            </S.ChipGroup>
          </S.Section>

          <S.Section>
            <S.Label>Stats</S.Label>
            <S.StatGrid>
              {[
                { key: "yearsPlaying" as const, label: "Years Playing" },
                { key: "tracksUploaded" as const, label: "Tracks Uploaded" },
                { key: "totalFollowers" as const, label: "Total Followers" },
                { key: "bpm" as const, label: "Favourite BPM" },
              ].map(({ key, label }) => (
                <S.StatField key={key}>
                  <S.Label>{label}</S.Label>
                  <S.Input
                    type="number"
                    value={form[key]}
                    onChange={(e) => handleField(key, Number(e.target.value))}
                    min={0}
                  />
                </S.StatField>
              ))}
            </S.StatGrid>
          </S.Section>

          <S.Section>
            <S.Label>Danceability — {form.danceabilityScale}%</S.Label>
            <S.ScaleRow>
              <span>Easy Listening</span>
              <S.Slider
                type="range"
                min={0}
                max={100}
                value={form.danceabilityScale}
                onChange={(e) => handleField("danceabilityScale", Number(e.target.value))}
              />
              <span>Danceability</span>
            </S.ScaleRow>
          </S.Section>

          <S.Section>
            <S.Label>Skills</S.Label>
            <S.ChipGroup>
              {ALL_SKILLS.map(({ value, label }) => (
                <S.Chip
                  key={value}
                  $active={form.skills.includes(value)}
                  $disabled={false}
                  onClick={() => toggleSkill(value)}
                  type="button"
                >
                  {label}
                </S.Chip>
              ))}
            </S.ChipGroup>
          </S.Section>

          <S.Section>
            <S.Label>Contact Details</S.Label>
            <S.Input
              value={form.email}
              onChange={(e) => handleField("email", e.target.value)}
              placeholder="Email"
              type="email"
            />
            <S.Input
              value={form.instagram}
              onChange={(e) => handleField("instagram", e.target.value)}
              placeholder="@instagram"
              style={{ marginTop: "0.5rem" }}
            />
            <S.Textarea
              value={form.address}
              onChange={(e) => handleField("address", e.target.value)}
              placeholder="Postal address (for physical card delivery)"
              rows={3}
            />
          </S.Section>

          {/* ── Mobile inline preview (bottom of form, above submit) ── */}
          <S.MobileInlinePreview ref={inlinePreviewRef}>
            <S.InlinePreviewScaler>
              <FlipPreview front={front} back={back} />
            </S.InlinePreviewScaler>
          </S.MobileInlinePreview>

          <S.SubmitButton type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Card"}
          </S.SubmitButton>
        </form>
      </S.FormCol>

      {/* ── Desktop preview (right column, hidden on mobile) ── */}
      <S.PreviewCol>
        <S.PreviewSticky>
          <FlipPreview front={front} back={back} />
        </S.PreviewSticky>
      </S.PreviewCol>

      {/* ── Peek FAB (mobile only, shown when inline preview scrolled out of view) ── */}
      {showPeek && (
        <S.PeekFab onClick={() => s_sheetOpen(true)}>
          Preview
        </S.PeekFab>
      )}

      {/* ── Slide-up peek sheet ── */}
      {sheetOpen && (
        <>
          <S.SheetBackdrop onClick={() => s_sheetOpen(false)} />
          <S.Sheet>
            <S.SheetHandle />
            <S.SheetClose onClick={() => s_sheetOpen(false)}>✕</S.SheetClose>
            <S.SheetCardScaler>
              <FlipPreview front={front} back={back} />
            </S.SheetCardScaler>
          </S.Sheet>
        </>
      )}
    </S.Page>
  )
}
