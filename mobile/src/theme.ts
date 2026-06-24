export const theme = {
  colors: {
    bg: "#000000",
    surface: "#0a0a0a",
    surfaceAlt: "#141414",
    border: "#262626",
    borderBright: "#404040",
    text: "#fafafa",
    textMuted: "#a3a3a3",
    primary: "#ffffff",
    primaryBright: "#fafafa",
    accent: "#22c55e",
    amber: "#f59e0b",
    coral: "#ef4444",
    white: "#ffffff",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  spacing: (n: number) => n * 4,
};

export type Theme = typeof theme;
