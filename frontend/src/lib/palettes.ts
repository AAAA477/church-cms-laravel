/**
 * Curated theme palettes selectable in the admin console
 * (Settings > Appearance, stored in the theme_palette setting).
 *
 * Every palette fills the same eight CSS custom properties that
 * globals.css declares in @theme, so Tailwind utilities (bg-primary,
 * text-ink, …) restyle automatically when the root layout overrides the
 * variables. Each `primary` is dark enough for white text (≥ 4.5:1).
 */

export type Palette = {
  key: string;
  name: string;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    ink: string;
    inkSoft: string;
    cream: string;
    warm: string;
    warmDeep: string;
  };
};

export const DEFAULT_PALETTE_KEY = "warm-earth";

export const PALETTES: Palette[] = [
  {
    // Matches the @theme defaults in globals.css.
    key: "warm-earth",
    name: "Warm Earth",
    colors: {
      primary: "#8b6f47",
      primaryDark: "#6b5437",
      accent: "#c4a574",
      ink: "#2c2416",
      inkSoft: "#5c5449",
      cream: "#faf8f5",
      warm: "#f5f1eb",
      warmDeep: "#ede8df",
    },
  },
  {
    key: "coastal-blue",
    name: "Coastal Blue",
    colors: {
      primary: "#39587c",
      primaryDark: "#2b4562",
      accent: "#8fb0cd",
      ink: "#1c2733",
      inkSoft: "#4b5866",
      cream: "#f7fafc",
      warm: "#edf2f7",
      warmDeep: "#dfe7ef",
    },
  },
  {
    key: "forest-green",
    name: "Forest Green",
    colors: {
      primary: "#41634b",
      primaryDark: "#324e3a",
      accent: "#9db88a",
      ink: "#1f2b21",
      inkSoft: "#4d5a4e",
      cream: "#f7faf5",
      warm: "#edf3e9",
      warmDeep: "#dfe8d8",
    },
  },
  {
    key: "burgundy",
    name: "Burgundy",
    colors: {
      primary: "#7d3b49",
      primaryDark: "#622e39",
      accent: "#c5969d",
      ink: "#2e1f22",
      inkSoft: "#5d4a4e",
      cream: "#faf6f5",
      warm: "#f5ecea",
      warmDeep: "#eaddda",
    },
  },
  {
    key: "graphite",
    name: "Graphite",
    colors: {
      primary: "#48556a",
      primaryDark: "#374357",
      accent: "#9aa8bc",
      ink: "#22272e",
      inkSoft: "#545b64",
      cream: "#f8f9fa",
      warm: "#eff1f4",
      warmDeep: "#e1e5ea",
    },
  },
  {
    key: "royal-plum",
    name: "Royal Plum",
    colors: {
      primary: "#684a77",
      primaryDark: "#523a5e",
      accent: "#ae91bd",
      ink: "#2a2130",
      inkSoft: "#564a5d",
      cream: "#faf7fb",
      warm: "#f3edf5",
      warmDeep: "#e7dcea",
    },
  },
  {
    // Matched to The Church of Pentecost Canada Inc. logo (royal-blue rings
    // + world map, gold banner). The logo's third color, the red dashed
    // ring around the dove emblem, isn't represented — this two-tone
    // palette system has no slot for a tertiary accent.
    key: "pentecost-blue-gold",
    name: "Pentecost Blue & Gold",
    colors: {
      primary: "#1d4f96",
      primaryDark: "#153a72",
      accent: "#f4c430",
      ink: "#16202e",
      inkSoft: "#5b6472",
      cream: "#f7f9fc",
      warm: "#eef2f8",
      warmDeep: "#dde5f0",
    },
  },
];

export function getPalette(key: string | null | undefined): Palette {
  return PALETTES.find((p) => p.key === key) ?? PALETTES[0];
}

/** The four admin-picked colors a custom palette derives from. */
export type CustomColors = {
  primary: string;
  accent: string;
  background: string;
  text: string;
};

export const CUSTOM_PALETTE_KEY = "custom";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isValidCustomColors(c: unknown): c is CustomColors {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return (["primary", "accent", "background", "text"] as const).every(
    (k) => typeof o[k] === "string" && HEX.test(o[k] as string),
  );
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix `a` toward `b` by t (0..1). */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/**
 * Derive the full eight-variable palette from four picked colors, using the
 * same relationships the designed presets follow (darker primary for
 * hovers, primary-tinted surface steps, softened body text).
 */
export function buildCustomPalette(c: CustomColors): Palette["colors"] {
  return {
    primary: c.primary,
    primaryDark: mix(c.primary, "#000000", 0.25),
    accent: c.accent,
    ink: c.text,
    inkSoft: mix(c.text, c.background, 0.35),
    cream: c.background,
    warm: mix(c.background, c.primary, 0.05),
    warmDeep: mix(c.background, c.primary, 0.13),
  };
}

/** WCAG contrast ratio between two hex colors (1..21). */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** CSS custom-property overrides for a palette's colors (inline-styleable). */
export function paletteVars(colors: Palette["colors"]): Record<string, string> {
  return {
    "--color-primary": colors.primary,
    "--color-primary-dark": colors.primaryDark,
    "--color-accent": colors.accent,
    "--color-ink": colors.ink,
    "--color-ink-soft": colors.inkSoft,
    "--color-cream": colors.cream,
    "--color-warm": colors.warm,
    "--color-warm-deep": colors.warmDeep,
  };
}
