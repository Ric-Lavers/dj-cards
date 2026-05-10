export const theme = {
  colors: {
    black: "#0a0a0a",
    white: "#f5f5f0",
    offWhite: "#e8e6df",
    gold: "#c9a84c",
    goldLight: "#e2c97e",
    deepPurple: "#1a0a2e",
    neonBlue: "#00d4ff",
    cardBg: "#111118",
    surface: "#1c1c28",
    border: "#2e2e42",
    muted: "#6b6b80",
  },
  fonts: {
    heading: "'Arial Black', 'Helvetica Neue', sans-serif",
    body: "'Helvetica Neue', Arial, sans-serif",
    mono: "'Courier New', monospace",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  card: {
    width: 350,
    height: 490,
    borderRadius: 12,
  },
}

export type Theme = typeof theme
