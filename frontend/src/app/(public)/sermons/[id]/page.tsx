import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Button from "@/components/ui/Button";
import { guestGet } from "@/lib/api";
import { youtubeId } from "@/lib/youtube";
import type { Paginated, Sermon, SermonLink } from "@/lib/api-types";

const TYPE_LABELS: Record<string, string> = {
  video: "Video",
  audio: "Audio",
  document: "Document",
};

type Props = { params: Promise<{ id: string }> };

async function getSermon(id: string): Promise<Sermon | undefined> {
  // No single-sermon endpoint exists; the show route returns only media links.
  const sermons = await guestGet<{ data: Sermon[] }>("/sermons", 600);
  return sermons.data.find((s) => String(s.sermon_id) === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermon(id);
  return { title: sermon?.title ?? "Sermon" };
}

export default async function SermonDetailPage({ params }: Props) {
  const { id } = await params;
  const [sermon, links] = await Promise.all([
    getSermon(id),
    guestGet<Paginated<SermonLink>>(`/sermon/show/{church}/${id}`, 600),
  ]);

  if (!sermon) notFound();

  const media = links.data;

  // The first YouTube video becomes the featured thumbnail; everything
  // else — additional videos, audio, documents — lists below it. Clicking
  // opens the video directly on YouTube (a direct link, not an inline
  // embedded player).
  const featuredVideo = media.find((m) => m.type === "video" && youtubeId(m.url));
  const featuredVideoId = featuredVideo ? youtubeId(featuredVideo.url) : null;
  const rest = media.filter((m) => m !== featuredVideo);

  return (
    <>
      <article>
        <header className="hero-gradient texture-overlay">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            <Breadcrumbs
              crumbs={[
                { label: "Home", href: "/" },
                { label: "Resources", href: "/resources" },
                { label: sermon.title },
              ]}
            />
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
              {sermon.author}
            </p>
            <div className="mx-auto mb-6 h-[3px] w-[60px] bg-primary" aria-hidden />
            <h1 className="font-display text-4xl sm:text-5xl text-ink">
              {sermon.title}
            </h1>
            <p className="mt-4 text-sm text-ink-soft">{sermon.date}</p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {featuredVideo && featuredVideoId ? (
            <a
              href={featuredVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch "${sermon.title}" on YouTube`}
              className="group relative block aspect-video w-full overflow-hidden rounded-sm shadow-sm bg-ink mb-12"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${featuredVideoId}/hqdefault.jpg`}
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
              <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-sm bg-ink/75 px-2.5 py-1 text-xs font-medium text-white">
                Watch on YouTube
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7v8" />
                </svg>
              </span>
            </a>
          ) : (
            sermon.cover_image && (
              <div className="relative h-72 sm:h-96 mb-12 rounded-sm overflow-hidden shadow-sm">
                <Image
                  src={sermon.cover_image}
                  alt={sermon.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                  preload
                />
              </div>
            )
          )}

          <div className="prose max-w-none text-ink-soft leading-relaxed whitespace-pre-line">
            {sermon.description}
          </div>

          {rest.length > 0 && (
            <section className="mt-12">
              <h2 className="ornament ornament-left font-display text-3xl text-ink mb-8 pt-8">
                {featuredVideo ? "More" : "Watch & Listen"}
              </h2>
              <ul className="space-y-4">
                {rest.map((link, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 bg-white rounded-sm shadow-sm px-6 py-4"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary mb-1">
                        {TYPE_LABELS[link.type] ?? link.type}
                      </p>
                      <p className="text-ink">{link.title}</p>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-sm font-medium uppercase tracking-wider text-primary hover:text-primary-dark"
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-16 text-center">
            <Button href="/resources" variant="outline">
              All Sermons
            </Button>
          </div>
        </div>
      </article>
    </>
  );
}
