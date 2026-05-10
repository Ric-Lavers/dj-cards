import { put } from "@vercel/blob"

// Uploads a Buffer to Vercel Blob and returns the public URL.
export async function uploadToBlob(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const { url } = await put(filename, buffer, { access: "public", contentType })
  return url
}

// If the value is already a Blob URL (https://...), return as-is.
// If it's a base64 data URL, upload it and return the Blob URL.
export async function ensureBlobUrl(dataOrUrl: string, filename: string): Promise<string> {
  if (!dataOrUrl) return ""
  if (!dataOrUrl.startsWith("data:")) return dataOrUrl

  const [header, base64] = dataOrUrl.split(",")
  const contentType = header.match(/data:([^;]+)/)?.[1] ?? "image/png"
  const buffer = Buffer.from(base64, "base64")
  return uploadToBlob(buffer, filename, contentType)
}
