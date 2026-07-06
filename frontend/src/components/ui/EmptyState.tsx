import Button from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function EmptyState({
  title,
  message,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warm">
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="font-display text-2xl text-ink mb-2">{title}</h3>
      {message && <p className="text-ink-soft mb-8">{message}</p>}
      {ctaLabel && ctaHref && (
        <Button href={ctaHref} variant="outline">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
