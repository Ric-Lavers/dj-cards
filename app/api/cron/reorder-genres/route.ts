import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"
import GenreModel from "@/db/mongo/models/genre.schema"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()

  // Count how many artists have each genre
  const counts = await ArtistModel.aggregate<{ _id: string; count: number }>([
    { $unwind: "$genres" },
    { $group: { _id: "$genres", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  // Build a map of genre name → popularity rank
  const rankMap = new Map(counts.map(({ _id, count }, i) => [_id, { rank: i, count }]))

  // Fetch all genres and update their order
  const allGenres = await GenreModel.find({}).lean()
  const bulkOps = allGenres.map((genre) => {
    const entry = rankMap.get(genre.name)
    // Genres with no usage go to the bottom, sorted alphabetically after popular ones
    const order = entry ? entry.rank : counts.length + genre.name.charCodeAt(0)
    return {
      updateOne: {
        filter: { _id: genre._id },
        update: { $set: { order } },
      },
    }
  })

  await GenreModel.bulkWrite(bulkOps)

  return NextResponse.json({
    updated: allGenres.length,
    topGenres: counts.slice(0, 5).map(({ _id, count }) => ({ genre: _id, count })),
  })
}
