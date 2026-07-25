import OpenAI from "openai"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function inventSpecialSkillNames(existingNames: string[]): Promise<string[]> {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: `Invent 3 short, punchy DJ "special skill" move names (2-4 words each), in the spirit of: Bass Drop, Delay Attack, Fake Fade, Dr. Flange, Triplet Hats. These are signature performance tricks/techniques for a DJ trading card game.
Avoid duplicating any of these existing names: ${existingNames.join(", ") || "(none yet)"}.
Return ONLY a JSON array of exactly 3 strings, nothing else.`,
      },
    ],
  })

  const raw = response.choices[0]?.message?.content?.trim() ?? "[]"
  const jsonMatch = raw.match(/\[[\s\S]*\]/)

  let names: unknown = []
  try {
    names = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
  } catch {
    names = []
  }

  if (!Array.isArray(names)) return []

  const existingLower = new Set(existingNames.map((n) => n.toLowerCase()))
  return names
    .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
    .map((n) => n.trim())
    .filter((n) => !existingLower.has(n.toLowerCase()))
    .slice(0, 3)
}
