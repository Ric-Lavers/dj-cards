import Link from "next/link"
import { ElectronDanceLogo } from "@/component-library"

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem" }}>
      <div style={{ width: 260, height: 260 }}>
        <ElectronDanceLogo x={0} y={0} width={260} height={260} text="DJ Cards" />
      </div>
      <p style={{ color: "#6b6b80", fontSize: "1.1rem" }}>
        Your DJ. A card. Like a baseball card, but better.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/create"
          style={{
            background: "#c9a84c",
            color: "#0a0a0a",
            padding: "0.8rem 2.5rem",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Create your card
        </Link>
        <Link
          href="/deck"
          style={{
            background: "transparent",
            color: "#c9a84c",
            padding: "0.8rem 2.5rem",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "1rem",
            border: "2px solid #c9a84c",
          }}
        >
          View the deck
        </Link>
        <Link
          href="/special-skills/create"
          style={{
            background: "transparent",
            color: "#6b6b80",
            padding: "0.8rem 2.5rem",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "1rem",
            border: "2px solid #2e2e42",
          }}
        >
          Create special skill
        </Link>
      </div>
    </main>
  )
}
