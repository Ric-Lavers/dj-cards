import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import { ensureBlobUrl } from "@/utils/uploadToBlob"
import { randomBytes } from "crypto"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim()
    if (typeof body.prompt === "string") update.prompt = body.prompt

    if (body.largeImage && body.smallImage) {
      const uid = randomBytes(6).toString("hex")
      update.largeImage = await ensureBlobUrl(body.largeImage, `special-skills/${uid}-large.png`)
      update.smallImage = await ensureBlobUrl(body.smallImage, `special-skills/${uid}-small.png`)
    }

    const skill = await SpecialSkillModel.findByIdAndUpdate(id, update, { new: true }).lean()
    if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(JSON.parse(JSON.stringify(skill)))
  } catch (err) {
    console.error("[PATCH /api/special-skills/[id]]", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
