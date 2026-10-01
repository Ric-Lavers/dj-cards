import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import { CardFront, CardBack } from "@/component-library"
import { GigCount } from "@/services/GigCount"
import { DownloadableCard } from "./_components/DownloadableCard"
import Link from "next/link"
import { cookies } from "next/headers"
import { RosterFlow } from "@/services/RosterFlow"

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  const raw = await ArtistModel.findById(id).lean()
  if (!raw) return <main style={{ padding: "2rem" }}>Card not found.</main>
  const [withGigs] = await GigCount.attach([raw]),
    artist = JSON.parse(JSON.stringify(withGigs))
  const slug = artist.djName.toLowerCase().replace(/\s+/g, "-")
  const jar = await cookies()
  const rosterEventId = RosterFlow.getEventId(jar)

  const skillDocs = await SpecialSkillModel.find({ name: { $in: artist.specialSkills ?? [] } }).lean()
  const specialSkillsData = JSON.parse(JSON.stringify(skillDocs)).map((s: any) => ({
    name: s.name,
    smallImage: s.smallImage,
    largeImage: s.largeImage,
  }))

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1.5rem", gap: "2rem" }}>
      {rosterEventId && (
        <a
          href={RosterFlow.rosterEventUrl(rosterEventId)}
          style={{
            display: "block",
            width: "100%",
            maxWidth: "46rem",
            background: "#c9a84c",
            color: "#0a0a0a",
            padding: "1rem 1.5rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
            borderRadius: "6px",
          }}
        >
          Welcome to the electron.dance — claim your set time →
        </a>
      )}
      <h1 style={{ fontSize: "1.5rem", fontWeight: 900 }}>{artist.djName}</h1>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <DownloadableCard label="Front" filename={`${slug}-front.png`}>
          <CardFront
            djName={artist.djName}
            editedPhoto={artist.editedPhoto}
            cardNumber={artist.cardNumber}
          />
        </DownloadableCard>

        <DownloadableCard label="Back" filename={`${slug}-back.png`}>
          <CardBack artist={artist} qrDataUrl={artist.qrCodeUrl} specialSkillsData={specialSkillsData} />
        </DownloadableCard>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/deck"
          style={{
            padding: "0.7rem 1.5rem",
            border: "1px solid #2e2e42",
            color: "#6b6b80",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        >
          View all cards
        </Link>
        <Link
          href="/create"
          style={{
            padding: "0.7rem 1.5rem",
            border: "1px solid #c9a84c",
            color: "#c9a84c",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        >
          Invite someone
        </Link>
        <button
          style={{
            padding: "0.7rem 1.5rem",
            background: "#c9a84c",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Order physical card
        </button>
      </div>
    </main>
  )
}
