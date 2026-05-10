import { CardFront } from "@/component-library"
import { CardBack } from "@/component-library"

const demoArtist = {
  djName: "DJ Syntax",
  genres: ["Techno", "House"] as [string, string],
  poseChoice: "headphone_grab" as const,
  skills: ["scratching", "vinyl", "cdjs", "ableton", "long_mixes", "guitar"] as any,
  cardNumber: 42,
  stats: {
    yearsPlaying: 12,
    tracksUploaded: 347,
    totalFollowers: 18400,
    bpm: 132,
    danceabilityScale: 72,
  },
  contactDetails: { email: "", instagram: "@djsyntax", address: "" },
}

export default function PreviewPage() {
  return (
    <main style={{ background: "#0a0008", minHeight: "100vh", display: "flex", gap: "2rem", padding: "3rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
      <CardFront djName={demoArtist.djName} cardNumber={demoArtist.cardNumber} />
      <CardBack artist={demoArtist} />
    </main>
  )
}
