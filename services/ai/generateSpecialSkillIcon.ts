import OpenAI from "openai"
import sharp from "sharp"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const ICON_STYLE_PROMPT = `Turn this reference image into a bold, iconic collectible-card emblem representing the DJ special skill "{NAME}": {CONCEPT}
- Abstract, iconic badge/emblem style — not a literal photo of a person.
- Centered composition, no text, no lettering, no watermarks.
- Deep near-black background (#0a0008) with electric purple and gold accent lighting, matching a premium DJ trading-card aesthetic.
- Bold silhouette that reads clearly even at small sizes.`

export async function generateSpecialSkillIcon(
  imageBuffer: Buffer,
  mimeType: string,
  name: string,
  prompt?: string
): Promise<{ large: Buffer; small: Buffer }> {
  const concept = prompt?.trim() || name
  const finalPrompt = ICON_STYLE_PROMPT.replace("{NAME}", name).replace("{CONCEPT}", concept)

  const file = new File([new Uint8Array(imageBuffer)], "icon-source.jpg", { type: mimeType })

  const response = await client.images.edit({
    model: "gpt-image-1",
    image: file,
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
