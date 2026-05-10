export async function downloadSvgAsPng(svgEl: SVGSVGElement, filename: string) {
  // Inline all <image> hrefs that are already data URLs — no CORS issues.
  // For external URLs, fetch and convert to data URL first.
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  const images = clone.querySelectorAll("image")
  await Promise.all(
    Array.from(images).map(async (img) => {
      const href = img.getAttribute("href") || img.getAttribute("xlink:href") || ""
      if (!href || href.startsWith("data:")) return
      try {
        const res = await fetch(href)
        const blob = await res.blob()
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
        img.setAttribute("href", dataUrl)
      } catch {
        // leave as-is if fetch fails
      }
    })
  )

  const scale = 2
  const w = svgEl.width.baseVal.value
  const h = svgEl.height.baseVal.value
  const svgStr = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext("2d")!
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const link = document.createElement("a")
      link.download = filename
      link.href = canvas.toDataURL("image/png")
      link.click()
      resolve()
    }
    img.onerror = reject
    img.src = url
  })
}
