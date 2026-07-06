import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import MediaUploadForm from "@/components/admin/MediaUploadForm";
import Pagination from "@/components/admin/Pagination";
import SearchBar from "@/components/admin/SearchBar";
import { adminFetch } from "@/lib/api";
import clsx from "clsx";

export const metadata: Metadata = { title: "Media Files" };

type MediaFileRow = {
  id: number;
  name: string;
  description: string | null;
  media_type: "image" | "video" | "audio";
  type: "file" | "url";
  url: string | null;
  created_at: string | null;
};

type Props = { searchParams: Promise<{ type?: string; search?: string; page?: string }> };

const tabs = [
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
  { key: "audio", label: "Audio" },
] as const;

export default async function MediaFilesPage({ searchParams }: Props) {
  const { type: rawType, search, page } = await searchParams;
  const type = (["image", "video", "audio"].includes(rawType ?? "") ? rawType : "image") as
    | "image"
    | "video"
    | "audio";

  const params = new URLSearchParams({ type });
  if (search) params.set("search", search);
  if (page) params.set("page", page);

  const files = await adminFetch<{
    data: MediaFileRow[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/mediafiles?${params}`);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Media Files</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/console/mediafiles?type=${tab.key}`}
            className={clsx(
              "px-4 py-2 rounded-sm text-sm font-medium transition-colors",
              type === tab.key
                ? "bg-primary text-white"
                : "bg-white text-ink hover:bg-warm border border-warm-deep",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">
          Add {type === "image" ? "Image" : type === "video" ? "Video" : "Audio"}
        </h2>
        <MediaUploadForm mediaType={type} key={type} />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search by name or description…" />
        <p className="text-sm text-ink-soft">{files.meta.total} total</p>
      </div>

      {files.data.length === 0 ? (
        <Card className="p-8 text-center" hover={false}>
          <p className="text-sm text-ink-soft">No {type} files yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.data.map((file) => (
            <Card key={file.id} className="p-4 flex flex-col" hover={false}>
              {file.media_type === "image" && file.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-40 object-cover rounded-sm mb-3"
                />
              )}
              <p className="text-sm font-medium text-ink">{file.name}</p>
              {file.description && (
                <p className="text-xs text-ink-soft mt-1 flex-1">{file.description}</p>
              )}
              <div className="flex items-center justify-between gap-2 mt-3">
                {file.url ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium uppercase tracking-wider text-primary hover:text-primary-dark"
                  >
                    {file.type === "url" ? "Open Link" : "Open File"}
                  </a>
                ) : (
                  <span className="text-xs text-ink-soft">No source</span>
                )}
                <DeleteButton
                  endpoint={`/bff/admin/mediafiles/${file.id}`}
                  confirmText="Delete this file?"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        currentPage={files.meta.current_page}
        lastPage={files.meta.last_page}
        basePath="/console/mediafiles"
        searchParams={{ type, search }}
      />
    </div>
  );
}
