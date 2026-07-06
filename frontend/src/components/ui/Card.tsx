import clsx from "clsx";

type CardProps = {
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function Card({ hover = true, className, children }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-sm shadow-sm overflow-hidden",
        hover && "card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
