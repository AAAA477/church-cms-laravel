import NavBar from "@/components/site/NavBar";
import Footer from "@/components/site/Footer";
import { guestGet } from "@/lib/api";
import type { ChurchDetails } from "@/lib/api-types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const church = await guestGet<ChurchDetails>("/church/details", 600);

  return (
    <>
      <NavBar churchName={church.church_name} tagline="Faith • Hope • Love" />
      <main className="flex-1">{children}</main>
      <Footer church={church} />
    </>
  );
}
