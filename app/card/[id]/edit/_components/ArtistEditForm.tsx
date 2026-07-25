"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"
import * as S from "@/app/create/_components/create-page.styles"
import api from "@/utils/api"
import type { ArtistDoc, Skill } from "@/db/mongo/models/artist.schema"

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

type SpecialSkillOption = { _id: string; name: string; smallImage: string; largeImage: string }
type Artist = Partial<ArtistDoc> & { _id: string }

export const ArtistEditForm = ({ artist }: { artist: Artist }) => {
  const router = useRouter()
  const [djName, s_djName] = useState(artist.djName ?? "")
  const [genres, s_genres] = useState<string[]>(artist.genres ?? [])
  const [skills, s_skills] = useState<Skill[]>(artist.skills ?? [])
  const [specialSkills, s_specialSkills] = useState<string[]>(artist.specialSkills ?? [])
  const [yearsPlaying, s_yearsPlaying] = useState(artist.stats?.yearsPlaying ?? 0)
  const [tracksUploaded, s_tracksUploaded] = useState(artist.stats?.tracksUploaded ?? 0)
  const [totalFollowers, s_totalFollowers] = useState(artist.stats?.totalFollowers ?? 0)
  const [bpm, s_bpm] = useState(artist.stats?.bpm ?? 128)
  const [danceabilityScale, s_danceabilityScale] = useState(artist.stats?.danceabilityScale ?? 50)
  const [instagram, s_instagram] = useState(artist.socials?.instagram ?? "")
  const [soundcloud, s_soundcloud] = useState(artist.socials?.soundcloud ?? "")
  const [newSkill, s_newSkill] = useState("")

  const [genreCatalog, s_genreCatalog] = useState<string[]>(FALLBACK_GENRES)
  const [specialSkillCatalog, s_specialSkillCatalog] = useState<SpecialSkillOption[]>([])
  const [saving, s_saving] = useState(false)
  const [saveError, s_saveError] = useState<string | null>(null)
  const [saved, s_saved] = useState(false)

  useEffect(() => {
    api.get("/genres").then((data) => s_genreCatalog(data as unknown as string[])).catch(() => {})
    api.get("/special-skills").then((data) => s_specialSkillCatalog(data as unknown as SpecialSkillOption[])).catch(() => {})
  }, [])

  function toggleGenre(genre: string) {
    s_genres((prev) => {
      const has = prev.includes(genre)
      if (has) return prev.filter((g) => g !== genre)
      if (prev.length >= 2) return prev
      return [...prev, genre]
    })
  }

  function toggleSkill(skill: Skill) {
    s_skills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  function handleAddSkill() {
    const trimmed = newSkill.trim().replace(/\b\w/g, (c) => c.toUpperCase())
    if (!trimmed) return
    const key = trimmed.toLowerCase().replace(/\s+/g, "_")
    const allKeys = [...ALL_SKILLS.map((s) => s.value), ...skills]
    const duplicate = allKeys.some((s) => s.toLowerCase() === key || s.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) { s_newSkill(""); return }
    s_skills((prev) => [...prev, trimmed as Skill])
    s_newSkill("")
  }

  function toggleSpecialSkill(name: string) {
    s_specialSkills((prev) => {
      const has = prev.includes(name)
      if (has) return prev.filter((s) => s !== name)
      if (prev.length >= 2) return prev
      return [...prev, name]
    })
  }

  async function handleSave() {
    if (genres.length !== 2) {
      s_saveError("Pick exactly 2 genres.")
      return
    }
    s_saving(true)
    s_saveError(null)
    s_saved(false)
    try {
      await api.patch(`/artist/${artist._id}`, {
        djName,
        genres,
        skills,
        specialSkills,
        stats: { yearsPlaying, tracksUploaded, totalFollowers, bpm, danceabilityScale },
        socials: { instagram, soundcloud },
      })
      s_saved(true)
      router.refresh()
    } catch (err) {
      const message = err instanceof AxiosError ? (err.response?.data?.error as string | undefined) : undefined
      s_saveError(message ?? "Failed to save changes.")
    } finally {
      s_saving(false)
    }
  }

  return (
    <S.FormCol style={{ maxWidth: 560 }}>
      <S.Section>
        <S.Label>DJ Name</S.Label>
        <S.Input value={djName} onChange={(e) => s_djName(e.target.value)} required />
      </S.Section>

      <S.Section>
        <S.Label>Genres (pick 2)</S.Label>
        <S.ChipGroup>
          {genreCatalog.map((genre) => (
            <S.Chip
              key={genre}
              $active={genres.includes(genre)}
              $disabled={!genres.includes(genre) && genres.length >= 2}
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
            { label: "Years Playing", value: yearsPlaying, set: s_yearsPlaying },
            { label: "Uploads", value: tracksUploaded, set: s_tracksUploaded },
            { label: "Total Followers", value: totalFollowers, set: s_totalFollowers },
            { label: "Favourite BPM", value: bpm, set: s_bpm },
          ].map(({ label, value, set }) => (
            <S.StatField key={label}>
              <S.Label>{label}</S.Label>
              <S.Input
                type="number"
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                min={0}
              />
            </S.StatField>
          ))}
        </S.StatGrid>
      </S.Section>

      <S.Section>
        <S.Label>Danceability — {danceabilityScale}%</S.Label>
        <S.ScaleRow>
          <span>Easy Listening</span>
          <S.Slider
            type="range"
            min={0}
            max={100}
            value={danceabilityScale}
            onChange={(e) => s_danceabilityScale(Number(e.target.value))}
          />
          <span>Danceability</span>
        </S.ScaleRow>
      </S.Section>

      <S.Section>
        <S.Label>Skills</S.Label>
        <S.ChipGroup>
          {ALL_SKILLS.map(({ value, label }) => (
            <S.Chip key={value} $active={skills.includes(value)} $disabled={false} onClick={() => toggleSkill(value)} type="button">
              {label}
            </S.Chip>
          ))}
          {skills.filter((s) => !ALL_SKILLS.find((p) => p.value === s)).map((s) => (
            <S.Chip key={s} $active $disabled={false} onClick={() => s_skills((prev) => prev.filter((x) => x !== s))} type="button">
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
        <S.Label>Special Skills (pick 2)</S.Label>
        <S.ChipGroup>
          {specialSkillCatalog.map(({ name, smallImage }) => (
            <S.Chip
              key={name}
              $active={specialSkills.includes(name)}
              $disabled={!specialSkills.includes(name) && specialSkills.length >= 2}
              onClick={() => toggleSpecialSkill(name)}
              type="button"
            >
              {smallImage && <S.ChipIcon src={smallImage} alt="" />}
              {name}
            </S.Chip>
          ))}
        </S.ChipGroup>
      </S.Section>

      <S.Section>
        <S.Label>Socials</S.Label>
        <S.Input value={instagram} onChange={(e) => s_instagram(e.target.value)} placeholder="Instagram handle" style={{ marginBottom: "0.5rem" }} />
        <S.Input value={soundcloud} onChange={(e) => s_soundcloud(e.target.value)} placeholder="Soundcloud handle" />
      </S.Section>

      {saveError && <S.SubmitError>{saveError}</S.SubmitError>}
      {saved && <p style={{ color: "#4ade80", fontSize: "0.85rem" }}>Saved.</p>}

      <S.SubmitButton type="button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
      </S.SubmitButton>
    </S.FormCol>
  )
}
