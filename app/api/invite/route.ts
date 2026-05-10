import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import InviteModel from "@/db/mongo/models/invite.schema"
import { randomBytes } from "crypto"

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const { teamId, createdBy } = await req.json()
  const token = randomBytes(16).toString("hex")
  const invite = await InviteModel.create({ token, team: teamId, createdBy })
  return NextResponse.json(JSON.parse(JSON.stringify(invite)), { status: 201 })
}

export async function GET(req: NextRequest) {
  await connectToDatabase()
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 })
  const invite = await InviteModel.findOne({ token }).lean()
  if (!invite) return NextResponse.json({ error: "invalid invite" }, { status: 404 })
  return NextResponse.json(JSON.parse(JSON.stringify(invite)))
}
