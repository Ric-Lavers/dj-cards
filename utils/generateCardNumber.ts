import ArtistModel from "@/db/mongo/models/artist.schema"

export async function generateCardNumber(): Promise<number> {
  const count = await ArtistModel.countDocuments()
  return count + 1
}
