import { removeBackground as removeBg } from "@imgly/background-removal-node"

export async function removeBackground(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const blob = new Blob([buffer], { type: mimeType })
  const result = await removeBg(blob)
  return Buffer.from(await result.arrayBuffer())
}
