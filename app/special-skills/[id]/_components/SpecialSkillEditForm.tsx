"use client"

import { useState, type CSSProperties } from "react"
import { AxiosError } from "axios"
import api from "@/utils/api"

interface SkillData {
  _id: string
  name: string
  prompt: string
  sourcePhoto: string
}

export const SpecialSkillEditForm = ({ skill }: { skill: SkillData }) => {
  const [name, s_name] = useState(skill.name)
  const [prompt, s_prompt] = useState(skill.prompt)
  const [saving, s_saving] = useState(false)
  const [saveError, s_saveError] = useState<string | null>(null)
  const [saved, s_saved] = useState(false)
  const [regenerating, s_regenerating] = useState(false)
  const [regenError, s_regenError] = useState<string | null>(null)
  const [regenPreview, s_regenPreview] = useState<{ largeUrl: string; smallUrl: string } | null>(null)

  function extractError(err: unknown) {
    return err instanceof AxiosError ? (err.response?.data?.error as string | undefined) : undefined
  }

  async function handleSave() {
    s_saving(true)
    s_saveError(null)
    s_saved(false)
    try {
      await api.patch(`/special-skills/${skill._id}`, { name: name.trim(), prompt: prompt.trim() })
      s_saved(true)
    } catch (err) {
      s_saveError(extractError(err) ?? "Failed to save changes.")
    } finally {
      s_saving(false)
    }
  }

  async function handleRegenerate() {
    if (!skill.sourcePhoto) {
      s_regenError("No reference photo stored for this skill — can't regenerate.")
      return
    }
    s_regenerating(true)
    s_regenError(null)
    s_regenPreview(null)
    try {
      const res = await fetch(skill.sourcePhoto)
      const blob = await res.blob()
      const file = new File([blob], "source.jpg", { type: blob.type || "image/jpeg" })
      const fd = new FormData()
      fd.append("icon", file)
      fd.append("name", name.trim())
      fd.append("prompt", prompt.trim())
      const result = (await api.post("/special-skills/preview", fd)) as {
        largeUrl: string
        smallUrl: string
        error?: string
      }
      if (result.error) {
        s_regenError(result.error)
        return
      }
      s_regenPreview({ largeUrl: result.largeUrl, smallUrl: result.smallUrl })
    } catch (err) {
      s_regenError(extractError(err) ?? "Failed to regenerate icon.")
    } finally {
      s_regenerating(false)
    }
  }

  async function handleConfirmRegenerate() {
    if (!regenPreview) return
    s_saving(true)
    s_saveError(null)
    try {
      await api.patch(`/special-skills/${skill._id}`, {
        name: name.trim(),
        prompt: prompt.trim(),
        largeImage: regenPreview.largeUrl,
        smallImage: regenPreview.smallUrl,
      })
      s_saved(true)
      s_regenPreview(null)
    } catch (err) {
      s_saveError(extractError(err) ?? "Failed to save regenerated icon.")
    } finally {
      s_saving(false)
    }
  }

  const inputStyle: CSSProperties = {
    display: "block",
    width: "100%",
    marginTop: "0.3rem",
    padding: "0.5rem 0.7rem",
    background: "#1c1c28",
    border: "1px solid #2e2e42",
    borderRadius: 6,
    color: "#f5f5f0",
    fontSize: "0.9rem",
  }
  const labelStyle: CSSProperties = { color: "#6b6b80", fontSize: "0.75rem", letterSpacing: "0.05em" }

  return (
    <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <div>
        <label style={labelStyle}>NAME</label>
        <input value={name} onChange={(e) => s_name(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>PROMPT</label>
        <textarea value={prompt} onChange={(e) => s_prompt(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      {saveError && <p style={{ color: "#ff6b6b", fontSize: "0.8rem" }}>{saveError}</p>}
      {saved && <p style={{ color: "#4ade80", fontSize: "0.8rem" }}>Saved.</p>}

      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "0.6rem 1.4rem", background: "#c9a84c", color: "#0a0a0a", borderRadius: 6, fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating || saving}
          style={{ padding: "0.6rem 1.4rem", background: "transparent", color: "#c9a84c", border: "1.5px solid #c9a84c", borderRadius: 6, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", opacity: regenerating ? 0.6 : 1 }}
        >
          {regenerating ? "Regenerating..." : "Regenerate icon"}
        </button>
      </div>

      {regenError && <p style={{ color: "#ff6b6b", fontSize: "0.8rem" }}>{regenError}</p>}

      {regenPreview && (
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginTop: "0.4rem" }}>
          <img src={regenPreview.largeUrl} alt="New large icon" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }} />
          <img src={regenPreview.smallUrl} alt="New small icon" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
          <button
            type="button"
            onClick={handleConfirmRegenerate}
            disabled={saving}
            style={{ padding: "0.5rem 1rem", background: "#c9a84c", color: "#0a0a0a", borderRadius: 6, fontWeight: 700, fontSize: "0.8rem", border: "none", cursor: "pointer" }}
          >
            {saving ? "Saving..." : "Use this"}
          </button>
        </div>
      )}
    </div>
  )
}
