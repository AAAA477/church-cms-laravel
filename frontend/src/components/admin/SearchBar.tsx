"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SearchBar({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("search") as string;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        name="search"
        defaultValue={searchParams.get("search") ?? ""}
        placeholder={placeholder}
        className="rounded-sm border border-warm-deep bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors w-64"
      />
      <button
        type="submit"
        className="text-sm font-medium uppercase tracking-wider px-4 py-2 rounded-sm border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
      >
        Search
      </button>
    </form>
  );
}
