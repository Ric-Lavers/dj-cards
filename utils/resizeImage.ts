// Downscale to max 1500px JPEG in the browser — OpenAI's image edit rejects
// uploads over 4 MB, and phone photos routinely exceed that.
export async function resizeImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1500
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to resize image"))
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }))
        },
        "image/jpeg",
        0.85
      )
    }
    img.onerror = reject
    img.src = url
  })
}

export async function prepareUpload(file: File): Promise<File> {
  return file.size > 4 * 1024 * 1024 ? resizeImage(file) : file
}
