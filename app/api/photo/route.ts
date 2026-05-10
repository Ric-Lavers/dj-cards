import { NextRequest, NextResponse } from "next/server"
import { processArtistPhoto } from "@/services/ai/processArtistPhoto"
import type { PoseChoice } from "@/db/mongo/models/artist.schema"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("photo") as File | null
  const pose = (formData.get("pose") as PoseChoice) ?? "headphone_grab"
  const customPose = formData.get("customPose") as string | null

  if (!file) return NextResponse.json({ error: "No photo provided" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const editedBuffer = await processArtistPhoto(buffer, file.type || "image/jpeg", pose, customPose ?? undefined)
    const b64 = `data:image/png;base64,${editedBuffer.toString("base64")}`
    return NextResponse.json({ url: b64 })
  } catch (err: any) {
    if (err?.code === "moderation_blocked") {
      return NextResponse.json(
        { error: "That concept was flagged by OpenAI's safety system. Try a different pose or wording." },
        { status: 422 }
      )
    }
    throw err
  }
}
