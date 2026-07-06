import Link from "next/link";
import clsx from "clsx";

type PaginationProps = {
  currentPage: number;
  lastPage: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

export default function Pagination({ currentPage, lastPage, basePath, searchParams }: PaginationProps) {
  if (lastPage <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="flex justify-center gap-2 mt-8" aria-label="Pagination">
      {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          className={clsx(
            "h-9 w-9 flex items-center justify-center rounded-sm text-sm border transition-colors",
            page === currentPage
              ? "bg-primary border-primary text-white"
              : "border-warm-deep text-ink-soft hover:border-primary hover:text-primary",
          )}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
