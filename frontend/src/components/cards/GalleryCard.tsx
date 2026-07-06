import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Gallery } from "@/lib/api-types";

export default function GalleryCard({ gallery }: { gallery: Gallery }) {
  const photoCount = gallery["no.of.photos"];

  return (
    <Card>
      <Link href={`/gallery/${gallery.id}`} className="block">
        <div className="relative h-56 bg-warm">
          {gallery.path && (
            <Image
              src={gallery.path}
              alt={gallery.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          )}
        </div>
        <div className="p-6 flex items-baseline justify-between">
          <h3 className="font-display text-2xl text-ink">{gallery.name}</h3>
          <span className="text-xs uppercase tracking-wide text-ink-soft">
            {photoCount} photo{photoCount === 1 ? "" : "s"}
          </span>
        </div>
      </Link>
    </Card>
  );
}
