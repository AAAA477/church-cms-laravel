import Card from "@/components/ui/Card";

type StatTileProps = {
  label: string;
  value: number | string;
  icon?: string;
};

export default function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <Card className="p-5" hover={false}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
            {label}
          </p>
          <p className="font-display text-3xl text-ink">{value}</p>
        </div>
        {icon && (
          <span className="text-2xl opacity-70" aria-hidden>
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}
