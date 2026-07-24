import { NextRequest, NextResponse } from "next/server"
import { generateSpecialSkillIcon } from "@/services/ai/generateSpecialSkillIcon"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("icon") as File | null
    const name = ((formData.get("name") as string) ?? "").trim()
    const prompt = (formData.get("prompt") as string) ?? ""

    if (!file) return NextResponse.json({ error: "No icon reference image provided" }, { status: 400 })
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const { large, small } = await generateSpecialSkillIcon(buffer, file.type || "image/jpeg", name, prompt)

    const sourcePhoto = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`
    const largeUrl = `data:image/png;base64,${large.toString("base64")}`
    const smallUrl = `data:image/png;base64,${small.toString("base64")}`

    return NextResponse.json({ largeUrl, smallUrl, sourcePhoto })
  } catch (err) {
    const e = err as { code?: string; status?: number; response?: { status?: number }; message?: string }
    if (e?.code === "billing_hard_limit_reached") {
      return NextResponse.json(
        { error: "AI processing is temporarily unavailable — the service has hit its usage limit. Please try again later." },
        { status: 503 }
      )
    }
    if (e?.code === "moderation_blocked") {
      return NextResponse.json(
        { error: "That concept was flagged by OpenAI's safety system. Try a different image or wording." },
        { status: 422 }
      )
    }
    const status = e?.status ?? e?.response?.status
    if (status === 413 || status === 403 || e?.message?.toLowerCase().includes("too large")) {
      return NextResponse.json(
        { error: "Your image is too large — please use an image under 4 MB." },
        { status: 413 }
      )
    }
    console.error("[special-skills/preview route]", err)
    return NextResponse.json({ error: "Something went wrong generating the icon — please try again." }, { status: 500 })
  }
}
