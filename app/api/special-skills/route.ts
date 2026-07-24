import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import { ensureBlobUrl } from "@/utils/uploadToBlob"
import { randomBytes } from "crypto"

export async function GET() {
  await connectToDatabase()
  const skills = await SpecialSkillModel.find({}).sort({ order: 1, name: 1 }).lean()
  return NextResponse.json(JSON.parse(JSON.stringify(skills)))
}

export async function POST(req: NextRequest) {
  await connectToDatabase()
  try {
    const body = await req.json()
    const name = body.name?.trim()
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
    if (!body.largeImage || !body.smallImage) {
      return NextResponse.json({ error: "Icon images required — generate a preview first" }, { status: 400 })
    }

    const existing = await SpecialSkillModel.findOne({ name: new RegExp(`^${name}$`, "i") })
    if (existing) {
      return NextResponse.json({ error: "A special skill with that name already exists" }, { status: 409 })
    }

    const uid = randomBytes(6).toString("hex")
    const largeImage = await ensureBlobUrl(body.largeImage, `special-skills/${uid}-large.png`)
    const smallImage = await ensureBlobUrl(body.smallImage, `special-skills/${uid}-small.png`)
    const sourcePhoto = body.sourcePhoto ? await ensureBlobUrl(body.sourcePhoto, `special-skills/${uid}-source.png`) : ""

    const maxOrderDoc = await SpecialSkillModel.findOne({}).sort({ order: -1 }).lean()
    const skill = await SpecialSkillModel.create({
      name,
      prompt: body.prompt ?? "",
      largeImage,
      smallImage,
      sourcePhoto,
      invented: false,
      order: (maxOrderDoc?.order ?? 0) + 1,
    })

    return NextResponse.json(JSON.parse(JSON.stringify(skill)), { status: 201 })
  } catch (err) {
    console.error("[POST /api/special-skills]", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
