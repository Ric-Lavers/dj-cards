import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import GenreModel from "@/db/mongo/models/genre.schema"

const SEED_GENRES = [
  "House", "Techno", "Drum & Bass", "Jungle", "Disco",
  "Electro", "Trance", "Ambient", "Hip-Hop", "Funk",
]

export async function GET() {
  await connectToDatabase()

  const count = await GenreModel.countDocuments()
  if (count === 0) {
    await GenreModel.insertMany(
      SEED_GENRES.map((name, order) => ({ name, order }))
    )
  }

  const genres = await GenreModel.find({}).sort({ order: 1, name: 1 }).lean()
  return NextResponse.json(genres.map((g) => g.name))
}

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const { name } = await req.json()
  const trimmed = name?.trim()
  if (!trimmed) return NextResponse.json({ error: "name required" }, { status: 400 })

  const existing = await GenreModel.findOne({ name: new RegExp(`^${trimmed}$`, "i") })
  if (existing) return NextResponse.json(existing.name)

  const maxOrder = await GenreModel.findOne({}).sort({ order: -1 }).lean()
  const genre = await GenreModel.create({ name: trimmed, order: (maxOrder?.order ?? 0) + 1 })
  return NextResponse.json(genre.name, { status: 201 })
}
