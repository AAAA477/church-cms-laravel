import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Sermon } from "@/lib/api-types";

export default function SermonCard({ sermon }: { sermon: Sermon }) {
  const mediaCounts = [
    sermon.video_count > 0 && `${sermon.video_count} video${sermon.video_count > 1 ? "s" : ""}`,
    sermon.audio_count > 0 && `${sermon.audio_count} audio`,
    sermon.file_count > 0 && `${sermon.file_count} file${sermon.file_count > 1 ? "s" : ""}`,
  ].filter(Boolean);

  return (
    <Card>
      <Link href={`/sermons/${sermon.sermon_id}`} className="block">
        {sermon.cover_image && (
          <div className="relative h-48">
            <Image
              src={sermon.cover_image}
              alt={sermon.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </div>
        )}
        <div className="p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
            {sermon.author}
          </p>
          <h3 className="font-display text-2xl text-ink mb-2">{sermon.title}</h3>
          <p className="text-sm text-ink-soft line-clamp-2 mb-3">
            {sermon.description}
          </p>
          {mediaCounts.length > 0 && (
            <p className="text-xs uppercase tracking-wide text-accent">
              {mediaCounts.join(" • ")}
            </p>
          )}
        </div>
      </Link>
    </Card>
  );
}
