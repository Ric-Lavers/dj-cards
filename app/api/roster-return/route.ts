import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { RosterFlow } from "@/services/RosterFlow"

export async function POST(req: NextRequest) {
  const { eventId } = await req.json()
  if (typeof eventId !== "string" || !/^[a-f0-9]{24}$/i.test(eventId)) {
    return NextResponse.json({ error: "invalid eventId" }, { status: 400 })
  }
  const jar = await cookies()
  RosterFlow.setCookie(eventId, jar)
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const jar = await cookies()
  RosterFlow.clear(jar)
  return NextResponse.json({ success: true })
}
