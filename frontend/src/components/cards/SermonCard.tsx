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
          <div className="relative h-48 group">
            <Image
              src={sermon.cover_image}
              alt={sermon.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            {sermon.video_count > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/10 transition-colors group-hover:bg-ink/25">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary translate-x-0.5" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            )}
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
