import OpenAI from "openai"
import sharp from "sharp"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SPECIAL_SKILL_ICON_PROMPT = `Illustrate the following DJ special-skill moment as a bold, collectible trading-card icon:

SKILL: {NAME}
SCENE: {CONCEPT}

Instructions:
- Fully commit to the scene described — dynamic action, dramatic lighting, energy and motion.
- Deep near-black background (#0a0008) with electric purple and gold rim lighting, matching a premium DJ trading-card aesthetic.
- Subtle cold-blue/violet atmospheric haze for depth, high contrast, cinematic.
- Bold, centered composition that reads clearly even at small icon sizes. No text, no lettering, no watermarks.`

export async function generateSpecialSkillIcon(name: string, prompt?: string): Promise<{ large: Buffer; small: Buffer }> {
  const concept = prompt?.trim() || name
  const finalPrompt = SPECIAL_SKILL_ICON_PROMPT.replace("{NAME}", name).replace("{CONCEPT}", concept)

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: finalPrompt,
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
