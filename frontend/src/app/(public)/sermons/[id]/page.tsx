import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Button from "@/components/ui/Button";
import { guestGet } from "@/lib/api";
import type { Paginated, Sermon, SermonLink } from "@/lib/api-types";

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

  return (
    <>
      <article>
        <header className="hero-gradient texture-overlay">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            <Breadcrumbs
              crumbs={[
                { label: "Home", href: "/" },
                { label: "Sermons", href: "/sermons" },
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
          {sermon.cover_image && (
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
          )}

          <div className="prose max-w-none text-ink-soft leading-relaxed whitespace-pre-line">
            {sermon.description}
          </div>

          {media.length > 0 && (
            <section className="mt-12">
              <h2 className="ornament ornament-left font-display text-3xl text-ink mb-8 pt-8">
                Watch &amp; Listen
              </h2>
              <ul className="space-y-4">
                {media.map((link, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 bg-white rounded-sm shadow-sm px-6 py-4"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary mb-1">
                        {link.type}
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
            <Button href="/sermons" variant="outline">
              All Sermons
            </Button>
          </div>
        </div>
      </article>
    </>
  );
}
