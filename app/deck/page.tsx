import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import { FlipCard } from "./_components/FlipCard"
import { SkillFlipCard } from "./_components/SkillFlipCard"
import * as S from "./_components/flip-card.styles"
import Link from "next/link"

export const revalidate = 60

export default async function CardsPage() {
  await connectToDatabase()
  const raw = await ArtistModel.find({}).sort({ cardNumber: 1 }).lean()
  const artists = JSON.parse(JSON.stringify(raw))

  const skillDocs = await SpecialSkillModel.find({}).sort({ order: 1, name: 1 }).lean()
  const specialSkills = JSON.parse(JSON.stringify(skillDocs)).map(
    (s: { _id: string; name: string; largeImage: string }) => ({ _id: s._id, name: s.name, largeImage: s.largeImage })
  )
  const specialSkillsMap = Object.fromEntries(
    skillDocs.map((s) => [s.name, { name: s.name, smallImage: s.smallImage, largeImage: s.largeImage }])
  )

  return (
    <main style={{ minHeight: "100vh", background: "#0a0008" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2rem 2rem 0" }}>
        <h1 style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#f5f5f0" }}>
          The Deck
        </h1>
        <Link href="/create" style={{ padding: "0.5rem 1.2rem", background: "#c9a84c", color: "#0a0a0a", borderRadius: "6px", fontWeight: 700, fontSize: "0.85rem" }}>
          + Create yours
        </Link>
      </div>

      {artists.length === 0 && specialSkills.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", color: "#6b6b80" }}>
          No cards yet. <Link href="/create" style={{ color: "#c9a84c" }}>Be the first.</Link>
        </div>
      ) : (
        <S.Grid>
          {artists.map((artist: any) => (
            <FlipCard key={artist._id} artist={artist} specialSkillsMap={specialSkillsMap} />
          ))}
          {specialSkills.map((skill: { _id: string; name: string; largeImage: string }) => (
            <SkillFlipCard key={skill._id} skill={skill} />
          ))}
        </S.Grid>
      )}
    </main>
  )
}
