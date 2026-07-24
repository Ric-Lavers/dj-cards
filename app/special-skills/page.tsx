import { connectToDatabase } from "@/db/mongo/connect"
import SpecialSkillModel from "@/db/mongo/models/specialSkill.schema"
import Link from "next/link"

export const revalidate = 60

export default async function SpecialSkillsPage() {
  await connectToDatabase()
  const raw = await SpecialSkillModel.find({}).sort({ order: 1, name: 1 }).lean()
  const skills = JSON.parse(JSON.stringify(raw))

  return (
    <main style={{ minHeight: "100vh", background: "#0a0008" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2rem 2rem 0" }}>
        <h1 style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#f5f5f0" }}>
          Special Skills
        </h1>
        <Link href="/special-skills/create" style={{ padding: "0.5rem 1.2rem", background: "#c9a84c", color: "#0a0a0a", borderRadius: "6px", fontWeight: 700, fontSize: "0.85rem" }}>
          + Create special skill
        </Link>
      </div>

      {skills.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", color: "#6b6b80" }}>
          No special skills yet. <Link href="/special-skills/create" style={{ color: "#c9a84c" }}>Create one.</Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1.5rem",
          padding: "2rem",
        }}>
          {skills.map((skill: any) => (
            <Link
              key={skill._id}
              href={`/special-skills/${skill._id}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.6rem",
                padding: "1rem",
                background: "#1c1c28",
                border: "1px solid #2e2e42",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              {skill.largeImage ? (
                <img src={skill.largeImage} alt={skill.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px" }} />
              ) : (
                <div style={{ width: "100%", aspectRatio: "1", background: "#12081f", borderRadius: "6px" }} />
              )}
              <span style={{ color: "#f5f5f0", fontWeight: 700, fontSize: "0.9rem", textAlign: "center" }}>{skill.name}</span>
              {skill.invented && (
                <span style={{ color: "#6b6b80", fontSize: "0.7rem", letterSpacing: "0.05em" }}>AI-INVENTED</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
