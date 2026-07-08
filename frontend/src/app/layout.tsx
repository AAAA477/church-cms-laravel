import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { guestGet } from "@/lib/api";
import type { ChurchDetails } from "@/lib/api-types";
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

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
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
