import OpenAI from "openai"
import type { PoseChoice } from "@/db/mongo/models/artist.schema"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const POSE_PROMPTS: Record<PoseChoice, string> = {
  hands_in_air: "both hands raised high in the air, euphoric crowd energy",
  knob_twiddler: "hands on DJ mixer knobs, focused and deep in concentration",
  headphone_grab: "one hand gripping headphones pressed to one ear, leaning in",
  fist_pump: "one arm thrusting upward with a clenched fist, electrified energy",
  the_lean: "hunched intensely over the decks, shoulders forward, fully locked in",
  eyes_closed: "head tilted back slightly, eyes closed, completely lost in the music",
  natural: "",
}

// Used for preset poses — preserves identity strictly, changes pose + lighting only
const PRESET_STYLE_PROMPT = `Relight and recompose this photo as a dramatic DJ collectible card portrait.
- Preserve the person's face, skin tone, and identity exactly — do not alter their features.
- Remove the background and replace with a deep near-black void (#0a0008).
- Strong rim lighting in electric purple or deep gold behind the subject.
- Subtle cold-blue/violet atmospheric haze for depth. Soft directional key light, slight warmth.
- High contrast, cinematic. No lens flare, no text, no overlays.
- Portrait crop, subject centred.`

// Used for custom prompts — creative freedom, face stays recognisable as the base
const CUSTOM_STYLE_PROMPT = `Transform this person into the following concept for a collectible DJ card portrait:

CONCEPT: {CONCEPT}

Instructions:
- Use the person's face as the foundation — keep it recognisable.
- Fully commit to the concept: add costumes, props, accessories, effects, makeup, lighting, and atmosphere that match it.
- Replace the background with something dramatic that fits the concept. unless there is a cool background element in the original that fits the concept then minmized it to fit the dark overal tone.
- Collectible card quality — bold, high-contrast, striking. Dark overall tone.
- Portrait orientation, subject centred. No text or overlays.`

const NATURAL_PROMPT = `Remove the background from this photo and replace it with a deep near-black void (#0a0008).
Keep the subject exactly as they are — pose, lighting, expression, clothing unchanged.
Add only a subtle dark purple rim glow around the edges to separate them from the background.`

export async function processArtistPhoto(
  imageBuffer: Buffer,
  mimeType: string,
  pose: PoseChoice,
  customPose?: string
): Promise<Buffer> {
  const rawCustom = customPose?.trim()
  const custom = rawCustom && !/^dj\b/i.test(rawCustom) ? `DJ ${rawCustom}` : rawCustom
  const isNatural = pose === "natural" && !custom
  const isCustom = !!custom

  let prompt: string
  if (isNatural) {
    prompt = NATURAL_PROMPT
  } else if (isCustom) {
    prompt = CUSTOM_STYLE_PROMPT.replace("{CONCEPT}", custom)
  } else {
    prompt = `${PRESET_STYLE_PROMPT}\nThe DJ's pose: ${POSE_PROMPTS[pose]}.`
  }

  const file = new File([new Uint8Array(imageBuffer)], "photo.jpg", { type: mimeType })

  const response = await client.images.edit({
    model: "gpt-image-1",
    image: file,
    prompt,
    size: "1024x1024",
  })

  const imageData = response.data?.[0]

  if (imageData?.b64_json) {
    return Buffer.from(imageData.b64_json, "base64")
  }

  if (imageData?.url) {
    const res = await fetch(imageData.url)
    return Buffer.from(await res.arrayBuffer())
  }

  throw new Error("No image returned from OpenAI")
}
