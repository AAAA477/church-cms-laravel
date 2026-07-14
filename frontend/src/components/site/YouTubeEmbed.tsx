"use client";

import { useState } from "react";
import { youtubeId } from "@/lib/youtube";

/**
 * Responsive YouTube embed with a click-to-load thumbnail (avoids loading
 * YouTube's player JS/iframe until the visitor actually wants to watch).
 */
export default function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);

  if (!id) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-sm shadow-sm bg-ink">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Play ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8 text-primary translate-x-0.5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
