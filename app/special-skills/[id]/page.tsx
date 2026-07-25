import { connectToDatabase } from "@/db/mongo/connect"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import ArtistModel from "@/db/mongo/models/artist.schema"
import { SkillCardFront, SkillCardBack, FlipPreview } from "@/component-library"
import { SpecialSkillEditForm } from "./_components/SpecialSkillEditForm"
import { ArtistSpread } from "./_components/ArtistSpread"
import Link from "next/link"

export default async function SpecialSkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  const rawSkill = await SpecialSkillModel.findById(id).lean()
  if (!rawSkill) return <main style={{ padding: "2rem" }}>Special skill not found.</main>
  const skill = JSON.parse(JSON.stringify(rawSkill))

  const rawArtists = await ArtistModel.find({ specialSkills: skill.name }).sort({ cardNumber: 1 }).lean()
  const artists = JSON.parse(JSON.stringify(rawArtists))

  return (
    <main style={{ minHeight: "100vh", background: "#0a0008", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/special-skills" style={{ color: "#6b6b80", fontSize: "0.85rem" }}>← All special skills</Link>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
          <div style={{ width: 175, height: 245, flexShrink: 0, transformOrigin: "top left", transform: "scale(0.5)" }}>
            <FlipPreview
              faces={[
                <SkillCardFront key="front" name={skill.name} largeImage={skill.largeImage} instanceId={skill._id} />,
                <SkillCardBack key="back" instanceId={skill._id} />,
              ]}
            />
          </div>
          <SpecialSkillEditForm skill={skill} />
        </div>

        <div style={{ marginTop: "3rem" }}>
          <h2 style={{ color: "#f5f5f0", fontFamily: "'Arial Black', sans-serif", fontSize: "1.1rem", marginBottom: "1rem" }}>
            DJs with this special skill ({artists.length})
          </h2>
          <ArtistSpread artists={artists} />
        </div>
      </div>
    </main>
  )
}
