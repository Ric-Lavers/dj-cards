import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import { PrintPage } from "./_components/PrintPage"

export const dynamic = "force-dynamic"

export default async function PrintRoute() {
  await connectToDatabase()
  const raw = await ArtistModel.find({}).sort({ cardNumber: 1 }).lean()
  const artists = JSON.parse(JSON.stringify(raw))

  const skillDocs = await SpecialSkillModel.find({}).lean()
  const specialSkillsMap = Object.fromEntries(
    JSON.parse(JSON.stringify(skillDocs)).map((s: any) => [s.name, { name: s.name, smallImage: s.smallImage, largeImage: s.largeImage }])
  )

  return <PrintPage artists={artists} specialSkillsMap={specialSkillsMap} />
}
