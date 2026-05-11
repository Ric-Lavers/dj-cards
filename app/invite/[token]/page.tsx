import { InviteFlow } from "@/services/InviteFlow"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await InviteFlow.fromToken(token)

  if (invite.valid) {
    const jar = await cookies()
    InviteFlow.setCookie(token, jar)
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>
        {invite.valid ? "You've been invited" : "Invalid invite"}
      </h1>
      {invite.valid && (
        <>
          <p style={{ color: "#6b6b80", marginBottom: "2rem" }}>
            Create your DJ card and join the deck.
          </p>
          <Link
            href="/create"
            style={{
              background: "#c9a84c",
              color: "#0a0a0a",
              padding: "0.75rem 2rem",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            Create yours
          </Link>
        </>
      )}
    </main>
  )
}
