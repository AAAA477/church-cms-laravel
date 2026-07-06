import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hero-gradient texture-overlay flex-1 flex items-center justify-center">
      <div className="text-center px-4 py-32">
        <p className="font-display text-7xl text-primary mb-4">404</p>
        <h1 className="font-display text-3xl text-ink mb-3">Page not found</h1>
        <p className="text-ink-soft mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-flex bg-primary border-2 border-primary text-white text-sm font-medium uppercase tracking-wider px-8 py-3 rounded-sm transition-all hover:bg-primary-dark hover:border-primary-dark"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
