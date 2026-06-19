// Paleta de colores: papel manila + tinta + acentos editoriales
export const C = {
  paper: "#E8DEC4",
  paperLight: "#F1E9D2",
  paperDark: "#D9CCAC",
  ink: "#1F1A14",
  inkSoft: "#3A3128",
  inkMuted: "#6B5D45",
  inkFaint: "#A3957A",
  rule: "rgba(31,26,20,0.14)",
  ruleStrong: "rgba(31,26,20,0.32)",
  red: "#C8302E",
  redSoft: "#E8CFC9",
  green: "#2C5F3D",
  greenSoft: "#C9D6C3",
  gold: "#A6791F",
  goldSoft: "#E5D5A8",
  white: "#FFFEF9",
};

export const RARITIES = {
  common:    { name: "Común",      color: C.inkMuted, bg: "transparent",  border: C.rule },
  rare:      { name: "Rara",       color: "#1F4F7A",  bg: "#D3E0EC",      border: "#7AA0C2" },
  epic:      { name: "Épica",      color: "#5D2F7A",  bg: "#E0D3EC",      border: "#9A7AB8" },
  legendary: { name: "Legendaria", color: C.gold,     bg: C.goldSoft,     border: C.gold },
};
export const RARITY_KEYS = Object.keys(RARITIES);

export const PALETTE_COLORS = [
  C.red, C.green, C.gold,
  "#2D5F8E", "#7A3F9C", C.ink,
  "#A04020", "#5C4A8A",
];

export const FF = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};
