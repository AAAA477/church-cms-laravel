import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickEditForm from "@/components/admin/QuickEditForm";
import QuoteRescheduleForm from "@/components/admin/QuoteRescheduleForm";
import { adminFetch } from "@/lib/api";
import type { AdminQuote } from "@/lib/api-types";

export const metadata: Metadata = { title: "Quotes" };

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

export default async function QuotesPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const quotes = await adminFetch<{
    data: AdminQuote[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/quotes${qs}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-4xl text-ink">Quotes</h1>
        <Button href="/console/quotes/new">Add Quote</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search quote text…" />
        <p className="text-sm text-ink-soft">{quotes.meta.total} total</p>
      </div>

      {quotes.data.length === 0 ? (
        <EmptyState
          title="No quotes found"
          message={search ? `No results for "${search}"` : "Add your first quote to get started."}
        />
      ) : (
        <div className="space-y-4">
          {quotes.data.map((quote) => (
            <Card key={quote.id} className="p-5" hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  {quote.image && (
                    <Image
                      src={quote.image}
                      alt=""
                      width={64}
                      height={64}
                      className="rounded-sm object-cover border border-warm-deep shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    {quote.text && <p className="text-sm text-ink">{quote.text}</p>}
                    {quote.english_quotes && (
                      <p className="text-sm text-ink-soft italic mt-1">{quote.english_quotes}</p>
                    )}
                    <p className="text-xs text-ink-soft mt-2">
                      Publishes {new Date(quote.publish_on).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <QuoteRescheduleForm quoteId={quote.id} />
                  <div className="flex items-center gap-2">
                    <QuickEditForm
                      endpoint={`/bff/admin/quotes/${quote.id}`}
                      fields={[
                        { name: "text", label: "Quote Text", value: quote.text, type: "textarea" },
                        { name: "english_quotes", label: "English Scripture", value: quote.english_quotes, type: "textarea" },
                        { name: "tamil_quotes", label: "Tamil Scripture", value: quote.tamil_quotes, type: "textarea" },
                      ]}
                    />
                    <DeleteButton endpoint={`/bff/admin/quotes/${quote.id}`} confirmText="Delete this quote?" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        currentPage={quotes.meta.current_page}
        lastPage={quotes.meta.last_page}
        basePath="/console/quotes"
        searchParams={{ search }}
      />

      {!search && quotes.data.length === 0 && (
        <p className="text-center mt-6">
          <Link href="/console/quotes/new" className="text-primary hover:text-primary-dark">
            Add your first quote →
          </Link>
        </p>
      )}
    </div>
  );
}
