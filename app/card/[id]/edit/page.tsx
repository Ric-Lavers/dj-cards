import { connectToDatabase } from "@/db/mongo/connect"
import ArtistModel from "@/db/mongo/models/artist.schema"
import { ArtistEditForm } from "./_components/ArtistEditForm"
import Link from "next/link"

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  const raw = await ArtistModel.findById(id).lean()
  if (!raw) return <main style={{ padding: "2rem" }}>Card not found.</main>
  const artist = JSON.parse(JSON.stringify(raw))

  return (
    <main style={{ minHeight: "100vh", background: "#0a0008", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link href={`/card/${id}`} style={{ color: "#6b6b80", fontSize: "0.85rem" }}>← Back to card</Link>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f5f5f0", margin: "1rem 0 1.5rem" }}>
          Edit {artist.djName}
        </h1>
        <ArtistEditForm artist={artist} />
      </div>
    </main>
  )
}
