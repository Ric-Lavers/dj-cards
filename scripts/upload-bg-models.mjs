#!/usr/bin/env node
/**
 * One-time setup: mirrors @imgly/background-removal model files to Vercel Blob
 * so the app doesn't depend on the staticimgly.com CDN.
 *
 * Usage: node scripts/upload-bg-models.mjs
 *
 * On completion, prints the NEXT_PUBLIC_BG_REMOVAL_PATH value to add to
 * .env.local and Vercel environment variables.
 *
 * Safe to re-run — Vercel Blob overwrites existing files deterministically.
 */

import { put } from "@vercel/blob"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local into process.env
const envPath = join(__dirname, "..", ".env.local")
const envContent = readFileSync(envPath, "utf8")
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eq = trimmed.indexOf("=")
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim()
  process.env[key] = val
}

const CDN_BASE = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist"
const BLOB_PREFIX = "bg-removal"

// Only the quantised model + WASM runtime (~75 MB vs 327 MB for all variants)
const INCLUDE_PREFIXES = ["/models/isnet_quint8", "/onnxruntime-web/"]

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN not found in .env.local")
    process.exit(1)
  }

  console.log("Fetching resources.json from CDN…")
  const res = await fetch(`${CDN_BASE}/resources.json`)
  if (!res.ok) throw new Error(`Failed to fetch resources.json: ${res.status}`)
  const allResources = await res.json()

  const resources = Object.fromEntries(
    Object.entries(allResources).filter(([key]) =>
      INCLUDE_PREFIXES.some((p) => key.startsWith(p))
    )
  )

  const uniqueChunks = [
    ...new Map(
      Object.values(resources).flatMap((r) => r.chunks).map((c) => [c.name, c])
    ).values(),
  ]

  const totalMb = (
    Object.values(resources).reduce((s, r) => s + r.size, 0) /
    1024 /
    1024
  ).toFixed(1)

  console.log(`Uploading ${uniqueChunks.length} chunks (${totalMb} MB) to Vercel Blob…`)

  let done = 0
  for (const chunk of uniqueChunks) {
    const r = await fetch(`${CDN_BASE}/${chunk.name}`)
    if (!r.ok) throw new Error(`Failed to fetch chunk ${chunk.name}: ${r.status}`)
    await put(`${BLOB_PREFIX}/${chunk.name}`, r.body, {
      access: "public",
      addRandomSuffix: false,
    })
    done++
    process.stdout.write(`\r  ${done}/${uniqueChunks.length} chunks uploaded`)
  }
  console.log()

  // Upload the filtered resources.json
  await put(`${BLOB_PREFIX}/resources.json`, JSON.stringify(resources), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  })
  console.log("  resources.json uploaded")

  // Derive the publicPath from a sentinel upload
  const sentinel = await put(`${BLOB_PREFIX}/.keep`, "1", {
    access: "public",
    addRandomSuffix: false,
  })
  const publicPath = sentinel.url.replace(`${BLOB_PREFIX}/.keep`, `${BLOB_PREFIX}/`)

  console.log("\nDone! Add this to .env.local and Vercel environment variables:\n")
  console.log(`NEXT_PUBLIC_BG_REMOVAL_PATH=${publicPath}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
