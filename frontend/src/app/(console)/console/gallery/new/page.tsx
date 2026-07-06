import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import GalleryCreateForm from "@/components/admin/GalleryCreateForm";

export const metadata: Metadata = { title: "Add Album" };

export default function NewGalleryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/console/gallery" className="text-sm text-primary hover:text-primary-dark">
        ← Gallery
      </Link>

      <h1 className="font-display text-4xl text-ink mt-4 mb-8">Add Album</h1>

      <Card className="p-8" hover={false}>
        <GalleryCreateForm />
      </Card>
    </div>
  );
}
