import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"
import { generateCardNumber } from "@/utils/generateCardNumber"
import { ensureBlobUrl } from "@/utils/uploadToBlob"
import { randomBytes } from "crypto"
import QRCode from "qrcode"
import { cookies } from "next/headers"
import { InviteFlow } from "@/services/InviteFlow"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const uid = randomBytes(6).toString("hex")

    // Resolve invite from cookie
    const jar = await cookies()
    const inviteToken = InviteFlow.getToken(jar)
    const invite = inviteToken ? await InviteFlow.fromToken(inviteToken) : null

    // Upload photos to Blob if still base64
    const [photo, editedPhoto] = await Promise.all([
      ensureBlobUrl(body.photo ?? "", `originals/${uid}-orig.jpg`),
      ensureBlobUrl(body.editedPhoto ?? "", `edited/${uid}-edited.png`),
    ])

    const cardNumber = await generateCardNumber()
    const artist = await ArtistModel.create({
      ...body,
      photo,
      editedPhoto,
      cardNumber,
      invitedBy: invite?.invitedBy ?? null,
    })

    // Record this artist against the invite
    await invite?.record(artist._id)

    // Create this artist's own invite token for their card QR
    const token = await InviteFlow.create(artist._id)

    // Generate QR code pointing to the invite page
    const inviteUrl = `${BASE_URL}/invite/${token}`
    const qrCodeUrl = await QRCode.toDataURL(inviteUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#0a0008", light: "#ffffff" },
    })

    await ArtistModel.findByIdAndUpdate(artist._id, { qrCodeUrl })

    const result = artist.toObject()
    result.qrCodeUrl = qrCodeUrl

    return NextResponse.json(JSON.parse(JSON.stringify(result)), { status: 201 })
  } catch (err) {
    console.error("[POST /api/artist]", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  await connectToDatabase()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const artist = await ArtistModel.findById(id).lean()
  if (!artist) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(JSON.parse(JSON.stringify(artist)))
}
