import Image from "next/image";
import Card from "@/components/ui/Card";
import type { Bulletin } from "@/lib/api-types";

function periodLabel(bulletin: Bulletin) {
  if (bulletin.type === "week" && bulletin.week) {
    return `Week ${bulletin.week}, ${bulletin.year}`;
  }
  if (bulletin.month) {
    const name = new Date(bulletin.year, bulletin.month - 1).toLocaleString(
      "en",
      { month: "long" },
    );
    return `${name} ${bulletin.year}`;
  }
  return String(bulletin.year);
}

export default function BulletinCard({ bulletin }: { bulletin: Bulletin }) {
  return (
    <Card>
      <div className="relative h-48 bg-warm">
        {bulletin.cover_image && (
          <Image
            src={bulletin.cover_image}
            alt={bulletin.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
          {periodLabel(bulletin)}
        </p>
        <h3 className="font-display text-2xl text-ink mb-4">{bulletin.name}</h3>
        {bulletin.path && (
          <a
            href={bulletin.path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-primary transition-colors hover:text-primary-dark"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </a>
        )}
      </div>
    </Card>
  );
}
