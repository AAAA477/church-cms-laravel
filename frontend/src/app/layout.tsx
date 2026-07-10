import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { guestGet } from "@/lib/api";
import type { ChurchDetails } from "@/lib/api-types";
import {
  buildCustomPalette,
  CUSTOM_PALETTE_KEY,
  DEFAULT_PALETTE_KEY,
  getPalette,
  isValidCustomColors,
  paletteVars,
} from "@/lib/palettes";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const getChurch = () => guestGet<ChurchDetails>("/church/details", 600).catch(() => null);

// Tab title and description come from the admin console's Settings page
// (church_full_name + short_summary), like the legacy site.
export async function generateMetadata(): Promise<Metadata> {
  const church = await getChurch();
  const name = church?.church_name ?? "Church";

  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: church?.short_summary || "A community of faith, hope and love.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const church = await getChurch();

  // Theme palette from Settings > Appearance. Tailwind v4 utilities resolve
  // colors through var(--color-*), so overriding the custom properties
  // inline on <html> restyles the whole site (inline beats the :root
  // declarations from @theme). The default palette adds no override.
  const paletteKey = church?.theme_palette || DEFAULT_PALETTE_KEY;
  let themeStyle: React.CSSProperties | undefined;
  if (paletteKey === CUSTOM_PALETTE_KEY && isValidCustomColors(church?.theme_custom_colors)) {
    themeStyle = paletteVars(buildCustomPalette(church.theme_custom_colors)) as React.CSSProperties;
  } else if (paletteKey !== DEFAULT_PALETTE_KEY) {
    themeStyle = paletteVars(getPalette(paletteKey).colors) as React.CSSProperties;
  }

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
      style={themeStyle}
    >
      <body className="min-h-full flex flex-col">
        {/* Favicon from Settings. Rendered as a plain <link> (React hoists
            it into <head>) because metadata.icons is not emitted for
            dynamic absolute URLs in this Next version. */}
        {church?.favicon && <link rel="icon" href={church.favicon} />}
        {children}
      </body>
    </html>
  );
}
