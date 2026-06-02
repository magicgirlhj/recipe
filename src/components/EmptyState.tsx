import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="k-card flex min-h-44 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-kitchen-muted">
        <Icon size={22} />
      </div>
      <p className="font-bold">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-kitchen-muted">{description}</p> : null}
    </div>
  );
}
