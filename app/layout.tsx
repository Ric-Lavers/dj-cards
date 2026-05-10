import type { Metadata } from "next"
import { StyledProvider } from "./_providers/StyledProvider"

export const metadata: Metadata = {
  title: "DJ Cards",
  description: "Generate your DJ playing card",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledProvider>{children}</StyledProvider>
      </body>
    </html>
  )
}
