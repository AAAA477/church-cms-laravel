import Breadcrumbs, { type Crumb } from "@/components/site/Breadcrumbs";

export type { Crumb };

type PageHeaderProps = {
  overline?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
};

export default function PageHeader({
  overline,
  title,
  subtitle,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <header className="hero-gradient texture-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs crumbs={breadcrumbs} />}
        {overline && (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4">
            {overline}
          </p>
        )}
        <div className="mx-auto mb-6 h-[3px] w-[60px] bg-primary" aria-hidden />
        <h1 className="font-display text-4xl sm:text-5xl text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl mx-auto text-ink-soft leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
