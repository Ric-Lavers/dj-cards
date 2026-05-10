import Link from "next/link"

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>
        DJ Cards
      </h1>
      <p style={{ color: "#6b6b80", fontSize: "1.1rem" }}>
        Your DJ. A card. Like a baseball card, but better.
      </p>
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
    </main>
  )
}
