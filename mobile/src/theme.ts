export const theme = {
  colors: {
    bg: "#0f172a",
    surface: "#111c33",
    surfaceAlt: "#16233f",
    border: "#1e3050",
    borderBright: "#26406b",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    primary: "#2563eb",
    primaryBright: "#3b82f6",
    accent: "#10b981",
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
