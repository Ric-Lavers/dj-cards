import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (typeof body.djName === "string" && body.djName.trim()) update.djName = body.djName.trim()
    if (Array.isArray(body.genres)) {
      if (body.genres.length !== 2) {
        return NextResponse.json({ error: "Pick exactly 2 genres" }, { status: 400 })
      }
      update.genres = body.genres
    }
    if (Array.isArray(body.skills)) update.skills = body.skills
    if (Array.isArray(body.specialSkills)) {
      if (body.specialSkills.length > 2) {
        return NextResponse.json({ error: "Pick at most 2 special skills" }, { status: 400 })
      }
      update.specialSkills = body.specialSkills
    }

    if (body.stats && typeof body.stats === "object") {
      const s = body.stats as Record<string, unknown>
      const stats: Record<string, number> = {}
      for (const key of ["yearsPlaying", "tracksUploaded", "totalFollowers", "bpm", "danceabilityScale"]) {
        if (typeof s[key] === "number") stats[key] = s[key] as number
      }
      for (const [key, value] of Object.entries(stats)) update[`stats.${key}`] = value
    }

    if (body.socials && typeof body.socials === "object") {
      const s = body.socials as Record<string, unknown>
      if (typeof s.instagram === "string") update["socials.instagram"] = s.instagram
      if (typeof s.soundcloud === "string") update["socials.soundcloud"] = s.soundcloud
    }

    const artist = await ArtistModel.findByIdAndUpdate(id, update, { new: true }).lean()
    if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(JSON.parse(JSON.stringify(artist)))
  } catch (err) {
    console.error("[PATCH /api/artist/[id]]", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
