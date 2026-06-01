import { InviteFlow } from "@/services/InviteFlow"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await InviteFlow.fromToken(token)
  const inviterName = invite.inviterName

  async function acceptInvite() {
    "use server"
    const jar = await cookies()
    InviteFlow.setCookie(token, jar)
    redirect("/create")
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>
        DJ Cards
      </h1>
      {invite.valid ? (
        <>
          <p style={{ color: "#6b6b80", fontSize: "1.1rem", textAlign: "center" }}>
            {inviterName ? (
              <><strong style={{ color: "#fff" }}>{inviterName}</strong> invited you to create your DJ card.</>
            ) : (
              "You've been invited to create your DJ card."
            )}
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <form action={acceptInvite}>
              <button
                type="submit"
                style={{
                  background: "#c9a84c",
                  color: "#0a0a0a",
                  padding: "0.8rem 2.5rem",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Create yours
              </button>
            </form>
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
          </div>
        </>
      ) : (
        <p style={{ color: "#6b6b80", fontSize: "1.1rem" }}>This invite link is invalid.</p>
      )}
    </main>
  )
}
