import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import { inventSpecialSkillNames } from "@/services/ai/inventSpecialSkillNames"
import { generateSpecialSkillIcon } from "@/services/ai/generateSpecialSkillIcon"
import { uploadToBlob } from "@/utils/uploadToBlob"
import { randomBytes } from "crypto"

export async function POST(req: NextRequest) {
  await connectToDatabase()
  try {
    const body = await req.json().catch(() => ({}))
    const catalogNames = (await SpecialSkillModel.find({}).select("name").lean()).map((d) => d.name)
    const clientNames = Array.isArray(body.existingNames) ? body.existingNames : []
    const existingNames = [...new Set([...catalogNames, ...clientNames])]

    const names = await inventSpecialSkillNames(existingNames)
    if (names.length === 0) {
      return NextResponse.json({ error: "Couldn't invent new special skills right now — try again." }, { status: 502 })
    }

    const maxOrderDoc = await SpecialSkillModel.findOne({}).sort({ order: -1 }).lean()
    let nextOrder = (maxOrderDoc?.order ?? 0) + 1

    const results = await Promise.allSettled(
      names.map(async (name) => {
        const { large, small } = await generateSpecialSkillIcon(name)
        const uid = randomBytes(6).toString("hex")
        const largeImage = await uploadToBlob(large, `special-skills/${uid}-large.png`, "image/png")
        const smallImage = await uploadToBlob(small, `special-skills/${uid}-small.png`, "image/png")
        return { name, largeImage, smallImage }
      })
    )

    const created = []
    for (const result of results) {
      if (result.status !== "fulfilled") continue
      const { name, largeImage, smallImage } = result.value
      const skill = await SpecialSkillModel.create({
        name,
        prompt: "",
        largeImage,
        smallImage,
        invented: true,
        order: nextOrder++,
      })
      created.push(skill)
    }

    if (created.length === 0) {
      return NextResponse.json({ error: "Generated names but all icon generations failed — try again." }, { status: 502 })
    }

    return NextResponse.json(JSON.parse(JSON.stringify(created)), { status: 201 })
  } catch (err) {
    console.error("[POST /api/special-skills/invent]", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
