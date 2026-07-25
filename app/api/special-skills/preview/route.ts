import { NextRequest, NextResponse } from "next/server"
import { generateSpecialSkillIcon } from "@/services/ai/generateSpecialSkillIcon"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = ((body.name as string) ?? "").trim()
    const prompt = (body.prompt as string) ?? ""
    const includeEquipment = body.includeEquipment !== false

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

    const { large, small } = await generateSpecialSkillIcon(name, prompt, includeEquipment)

    const largeUrl = `data:image/png;base64,${large.toString("base64")}`
    const smallUrl = `data:image/png;base64,${small.toString("base64")}`

    return NextResponse.json({ largeUrl, smallUrl })
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
        { error: "That concept was flagged by OpenAI's safety system. Try a different wording." },
        { status: 422 }
      )
    }
    const status = e?.status ?? e?.response?.status
    if (status === 413 || status === 403 || e?.message?.toLowerCase().includes("too large")) {
      return NextResponse.json(
        { error: "That request was too large — try a shorter prompt." },
        { status: 413 }
      )
    }
    console.error("[special-skills/preview route]", err)
    return NextResponse.json({ error: "Something went wrong generating the icon — please try again." }, { status: 500 })
  }
}
