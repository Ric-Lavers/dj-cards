import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"
import { PrintPage } from "./_components/PrintPage"

export const dynamic = "force-dynamic"

export default async function PrintRoute() {
  await connectToDatabase()
  const raw = await ArtistModel.find({}).sort({ cardNumber: 1 }).lean()
  const artists = JSON.parse(JSON.stringify(raw))
  return <PrintPage artists={artists} />
}
