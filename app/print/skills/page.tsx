import { connectToDatabase } from "@/db/mongo/connect"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import { SkillPrintPage } from "./_components/SkillPrintPage"

export const dynamic = "force-dynamic"

export default async function PrintSkillsRoute() {
  await connectToDatabase()
  const raw = await SpecialSkillModel.find({}).sort({ order: 1, name: 1 }).lean()
  const skills = JSON.parse(JSON.stringify(raw))

  return <SkillPrintPage skills={skills} />
}
