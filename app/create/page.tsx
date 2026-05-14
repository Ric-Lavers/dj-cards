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

const FALLBACK_GENRES = ["House", "Techno", "Drum & Bass", "Jungle", "Disco", "Electro", "Trance", "Ambient", "Hip-Hop", "Funk"]

const ALL_SKILLS: { value: Skill; label: string }[] = [
  { value: "scratching", label: "Scratching" },
  { value: "long_mixes", label: "Long Mixes" },
  { value: "vinyl",      label: "Vinyl" },
  { value: "cdjs",       label: "CDJs" },
  { value: "ableton",    label: "Ableton" },
  { value: "guitar",     label: "Guitar" },
  { value: "vocalist",   label: "Vocalist" },
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
  instagram: "",
  soundcloud: "",
  email: "",
  phone: "",
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
  const [submitError, s_submitError] = useState<string | null>(null)
  const [genres, s_genres] = useState<string[]>(FALLBACK_GENRES)
  const [genresExpanded, s_genresExpanded] = useState(false)
  const [genresOverflow, s_genresOverflow] = useState(false)
  const [newGenre, s_newGenre] = useState("")
  const [addingGenre, s_addingGenre] = useState(false)
  const [newSkill, s_newSkill] = useState("")
  const chipsRef = useRef<HTMLDivElement>(null)
  const [sheetOpen, s_sheetOpen] = useState(false)
  const [showPeek, s_showPeek] = useState(false)
  const inlinePreviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get("/genres").then((data) => s_genres(data as unknown as string[])).catch(() => {})
  }, [])

  useEffect(() => {
    const el = chipsRef.current
    if (!el) return
    const check = () => s_genresOverflow(el.scrollHeight > 80)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [genres])

  async function handleAddGenre() {
    const trimmed = newGenre.trim().replace(/\b\w/g, (c) => c.toUpperCase())
    if (!trimmed) return
    // Dupe check client-side before hitting API
    const existing = genres.find((g) => g.toLowerCase() === trimmed.toLowerCase())
    if (existing) { toggleGenre(existing); s_newGenre(""); return }
    s_addingGenre(true)
    try {
      const name = await api.post("/genres", { name: trimmed }) as unknown as string
      s_genres((prev) => prev.includes(name) ? prev : [...prev, name])
      toggleGenre(name)
      s_newGenre("")
    } finally {
      s_addingGenre(false)
    }
  }

  function handleAddSkill() {
    const trimmed = newSkill.trim().replace(/\b\w/g, (c) => c.toUpperCase())
    if (!trimmed) return
    const key = trimmed.toLowerCase().replace(/\s+/g, "_")
    // Dupe check against preset keys and already-added custom skills
    const allKeys = [...ALL_SKILLS.map((s) => s.value), ...form.skills]
    const duplicate = allKeys.some((s) => s.toLowerCase() === key || s.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) { s_newSkill(""); return }
    s_form((prev) => ({ ...prev, skills: [...prev.skills, trimmed as Skill] }))
    s_newSkill("")
  }

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

  async function resizeImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX = 1500
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to resize image"))
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }))
          },
          "image/jpeg",
          0.85
        )
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function loadFile(file: File) {
    s_editedPhoto(null)
    s_photoError(null)
    try {
      const ready = file.size > 4 * 1024 * 1024 ? await resizeImage(file) : file
      s_photoFile(ready)
      const reader = new FileReader()
      reader.onload = (ev) => s_photoPreview(ev.target?.result as string)
      reader.readAsDataURL(ready)
    } catch {
      s_photoError("Could not process that image — please try another.")
    }
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
    s_submitError(null)
    try {
      const payload = {
        djName: form.djName,
        poseChoice: form.poseChoice,
        customPose: form.customPose,
        genres: form.genres,
        editedPhoto: editedPhoto ?? "",
        stats: {
          yearsPlaying: form.yearsPlaying,
          tracksUploaded: form.tracksUploaded,
          totalFollowers: form.totalFollowers,
          bpm: form.bpm,
          danceabilityScale: form.danceabilityScale,
        },
        skills: form.skills,
        socials: { instagram: form.instagram, soundcloud: form.soundcloud },
        contactDetails: { email: form.email, phone: form.phone, address: form.address },
      }
      const artist = await api.post("/artist", payload)
      // @ts-ignore
      router.push(`/card/${artist._id}`)
    } catch (err: any) {
      s_submitError(err?.response?.data?.error ?? err?.message ?? "Something went wrong")
    } finally {
      s_loading(false)
    }
  }

  const previewArtist = {
    djName: form.djName,
    genres: form.genres as [string, string],
    poseChoice: form.poseChoice,
    skills: form.skills,
    socials: { instagram: form.instagram, soundcloud: form.soundcloud },
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
                <S.RadioOption key={value} $active={form.poseChoice === value} onClick={() => handleField("poseChoice", value)} type="button" disabled={processingPhoto} title={processingPhoto ? "Generating..." : undefined}>
                  {emoji} {label}
                </S.RadioOption>
              ))}
            </S.RadioGroup>
            <S.CustomPoseInput
              value={form.customPose}
              onChange={(e) => handleField("customPose", e.target.value)}
              placeholder="Or describe your own pose... (overrides selection above)"
              disabled={processingPhoto}
            />
          </S.Section>

          <S.Section>
            <S.Label>Genres (pick 2)</S.Label>
            <S.ChipGroupWrapper>
              <S.ChipGroup ref={chipsRef} $collapsed={!genresExpanded && genresOverflow}>
                {genres.map((genre) => (
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
              {genresOverflow && (
                <S.ShowMoreButton type="button" onClick={() => s_genresExpanded(v => !v)}>
                  {genresExpanded ? "Show less ↑" : `Show more ↓`}
                </S.ShowMoreButton>
              )}
            </S.ChipGroupWrapper>
            <S.AddGenreRow>
              <S.AddGenreInput
                value={newGenre}
                onChange={(e) => s_newGenre(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddGenre() } }}
                placeholder="Add a genre..."
              />
              <S.AddGenreBtn type="button" onClick={handleAddGenre} disabled={!newGenre.trim() || addingGenre}>
                {addingGenre ? "..." : "+ Add"}
              </S.AddGenreBtn>
            </S.AddGenreRow>
          </S.Section>

          <S.Section>
            <S.Label>Stats</S.Label>
            <S.StatGrid>
              {[
                { key: "yearsPlaying" as const, label: "Years Playing" },
                { key: "tracksUploaded" as const, label: "Uploads" },
                { key: "totalFollowers" as const, label: "Total Followers" },
                { key: "bpm" as const, label: "Favourite BPM" },
              ].map(({ key, label }) => (
                <S.StatField key={key}>
                  <S.Label>{label}</S.Label>
                  <S.Input
                    type="number"
                    value={form[key]}
                    onChange={(e) => handleField(key, Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
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
              {/* Custom skills */}
              {form.skills
                .filter((s) => !ALL_SKILLS.find((p) => p.value === s))
                .map((s) => (
                  <S.Chip
                    key={s}
                    $active
                    $disabled={false}
                    onClick={() => s_form((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }))}
                    type="button"
                  >
                    {s}
                  </S.Chip>
                ))}
            </S.ChipGroup>
            <S.AddGenreRow>
              <S.AddGenreInput
                value={newSkill}
                onChange={(e) => s_newSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill() } }}
                placeholder="Add a skill..."
              />
              <S.AddGenreBtn type="button" onClick={handleAddSkill} disabled={!newSkill.trim()}>
                + Add
              </S.AddGenreBtn>
            </S.AddGenreRow>
          </S.Section>

          <S.Section>
            <S.Label>Socials</S.Label>
            <S.Input
              value={form.instagram}
              onChange={(e) => handleField("instagram", e.target.value)}
              placeholder="Instagram @handle"
            />
            <S.Input
              value={form.soundcloud}
              onChange={(e) => handleField("soundcloud", e.target.value)}
              placeholder="SoundCloud @handle"
              style={{ marginTop: "0.5rem" }}
            />
          </S.Section>

          <S.Section>
            <S.Label>Contact Details <S.PrivateTag>kept private</S.PrivateTag></S.Label>
            <S.Input
              value={form.email}
              onChange={(e) => handleField("email", e.target.value)}
              placeholder="Email"
              type="email"
            />
            <S.Input
              value={form.phone}
              onChange={(e) => handleField("phone", e.target.value)}
              placeholder="Phone number"
              type="tel"
              style={{ marginTop: "0.5rem" }}
            />
            <S.Textarea
              value={form.address}
              onChange={(e) => handleField("address", e.target.value)}
              placeholder="Postal address (for physical card delivery)"
              rows={3}
              style={{ marginTop: "0.5rem" }}
            />
          </S.Section>

          {/* ── Mobile inline preview (bottom of form, above submit) ── */}
          <S.MobileInlinePreview ref={inlinePreviewRef}>
            <S.InlinePreviewScaler>
              <FlipPreview front={front} back={back} />
            </S.InlinePreviewScaler>
          </S.MobileInlinePreview>

          {submitError && <S.SubmitError>{submitError}</S.SubmitError>}
          <S.SubmitButton type="submit" disabled={loading || !editedPhoto}>
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
