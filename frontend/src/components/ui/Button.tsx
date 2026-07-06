import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm transition-all duration-300 rounded-sm px-8 py-3 border-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(139,111,71,0.3)]",
  outline:
    "border-primary text-primary bg-transparent hover:bg-primary hover:text-white",
  ghost:
    "border-transparent text-primary hover:text-primary-dark hover:bg-warm",
};

type ButtonProps = {
  variant?: Variant;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export default function Button({
  variant = "primary",
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = clsx(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
