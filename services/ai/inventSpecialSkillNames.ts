import OpenAI from "openai"
import sharp from "sharp"

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

const GENERIC_ICON_PROMPT = `A bold collectible trading-card icon/emblem representing the DJ special skill "{NAME}".
- Abstract, iconic badge style — not a literal photo, no people, no text, no lettering.
- Centered composition, deep near-black background (#0a0008), electric purple and gold accent lighting.
- Bold silhouette that reads clearly even at small sizes.`

export async function generateInventedSkillIcon(name: string): Promise<{ large: Buffer; small: Buffer }> {
  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: GENERIC_ICON_PROMPT.replace(/\{NAME\}/g, name),
    size: "1024x1024",
  })

  const imageData = response.data?.[0]

  let large: Buffer
  if (imageData?.b64_json) {
    large = Buffer.from(imageData.b64_json, "base64")
  } else if (imageData?.url) {
    const res = await fetch(imageData.url)
    large = Buffer.from(await res.arrayBuffer())
  } else {
    throw new Error("No image returned from OpenAI")
  }

  const small = await sharp(large).resize(40, 40, { fit: "cover" }).png().toBuffer()

  return { large, small }
}
