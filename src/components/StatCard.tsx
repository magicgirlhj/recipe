import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "orange" | "sage" | "clay";
}

const toneClass = {
  orange: "bg-orange-100 text-orange-700",
  sage: "bg-green-100 text-green-700",
  clay: "bg-rose-100 text-rose-700",
};

export function StatCard({ icon: Icon, label, value, tone = "orange" }: StatCardProps) {
  return (
    <div className="k-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-kitchen-muted">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClass[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
