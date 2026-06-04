import { AlertTriangle, CalendarPlus, CheckCircle2, MapPin, Package, Snowflake, Thermometer } from "lucide-react";
import type { InventoryItem } from "../data/types";
import { daysUntil, expiryLabel, formatDate } from "../utils/date";
import { FoodIcon } from "./FoodIcon";

interface InventoryCardProps {
  item: InventoryItem;
  onClick?: () => void;
}

const locationMeta = {
  fridge: { label: "冷藏", icon: Thermometer },
  freezer: { label: "冷冻", icon: Snowflake },
  pantry: { label: "常温", icon: Package },
};

export function locationLabel(location: InventoryItem["location"]) {
  return locationMeta[location].label;
}

export function InventoryCard({ item, onClick }: InventoryCardProps) {
  const days = daysUntil(item.expireDate);
  const expired = days !== undefined && days < 0;
  const urgent = days !== undefined && days >= 0 && days <= 3;
  const LocationIcon = locationMeta[item.location].icon;

  return (
    <button
      className={[
        "k-card w-full p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg",
        expired ? "border-red-200 bg-red-50" : urgent ? "border-orange-200 bg-orange-50" : "",
      ].join(" ")}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <FoodIcon iconKey={item.iconKey} name={item.name} category={item.category} className="h-16 w-16 p-1.5" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-black">{item.name}</h3>
          <p className="mt-1 text-sm font-semibold text-kitchen-muted">
            {item.quantity ?? "-"} {item.unit || ""} {item.category ? `· ${item.category}` : ""}
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
      </div>
    </button>
  );
}
