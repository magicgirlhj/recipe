import { AlertTriangle, CalendarPlus, CheckCircle2, MapPin, Minus, Package, Plus, Snowflake, Thermometer } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { InventoryItem } from "../data/types";
import { daysUntil, expiryLabel, formatDate } from "../utils/date";
import { FoodIcon } from "./FoodIcon";

interface InventoryCardProps {
  item: InventoryItem;
  onClick?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

const locationMeta = {
  fridge: { label: "冷藏", icon: Thermometer },
  freezer: { label: "冷冻", icon: Snowflake },
  pantry: { label: "常温", icon: Package },
};

export function locationLabel(location: InventoryItem["location"]) {
  return locationMeta[location].label;
}

export function InventoryCard({ item, onClick, onIncrement, onDecrement }: InventoryCardProps) {
  const days = daysUntil(item.expireDate);
  const expired = days !== undefined && days < 0;
  const urgent = days !== undefined && days >= 0 && days <= 3;
  const LocationIcon = locationMeta[item.location].icon;
  const quantity = item.quantity ?? 1;

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <article
      className={[
        "k-card w-full p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg",
        onClick ? "cursor-pointer" : "",
        expired ? "border-red-200 bg-red-50" : urgent ? "border-orange-200 bg-orange-50" : "",
      ].join(" ")}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start gap-3">
        <FoodIcon iconKey={item.iconKey} name={item.name} className="h-16 w-16 p-1.5" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-black">{item.name}</h3>
          <p className="mt-1 text-sm font-semibold text-kitchen-muted">
            {quantity} {item.unit || ""}
          </p>
        </div>
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            expired ? "bg-red-100 text-red-600" : urgent ? "bg-orange-100 text-orange-600" : "bg-kitchen-mint text-green-700",
          ].join(" ")}
        >
          {expired || urgent ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-white/75 px-2 py-2">
        <span className="text-xs font-bold text-kitchen-muted">库存数量</span>
        <div className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-kitchen-muted transition hover:bg-stone-100 hover:text-kitchen-ink disabled:cursor-not-allowed disabled:opacity-40"
            onClick={(event) => {
              event.stopPropagation();
              onDecrement?.();
            }}
            disabled={quantity <= 0}
            aria-label={`减少${item.name}数量`}
          >
            <Minus size={15} />
          </button>
          <span className="min-w-12 text-center text-sm font-black text-kitchen-ink">
            {quantity}
            {item.unit || ""}
          </span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-kitchen-muted transition hover:bg-stone-100 hover:text-kitchen-ink"
            onClick={(event) => {
              event.stopPropagation();
              onIncrement?.();
            }}
            aria-label={`增加${item.name}数量`}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-kitchen-muted">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/75 px-2 py-1">
          <LocationIcon size={13} />
          {locationMeta[item.location].label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white/75 px-2 py-1">
          <MapPin size={13} />
          {expiryLabel(item.expireDate)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white/75 px-2 py-1">
          <CalendarPlus size={13} />
          入库 {formatDate(item.createdAt)}
        </span>
        {item.shelfLifeDays !== undefined ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-white/75 px-2 py-1">
            保质 {item.shelfLifeDays} 天
          </span>
        ) : null}
      </div>
    </article>
  );
}
