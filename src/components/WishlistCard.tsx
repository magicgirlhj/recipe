import { CalendarDays, ExternalLink, Heart, Link as LinkIcon, Sparkles } from "lucide-react";
import type { WishlistItem } from "../data/types";
import { formatDate } from "../utils/date";
import { Tag } from "./Tag";

interface WishlistCardProps {
  item: WishlistItem;
  onClick?: () => void;
}

export function WishlistCard({ item, onClick }: WishlistCardProps) {
  return (
    <button className="k-card group p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <h3 className="line-clamp-2 text-xl font-black leading-snug text-kitchen-ink">{item.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-kitchen-muted">
            {item.notes || "还没有备注，先把这个想吃的念头存下来。"}
          </p>
        </div>

        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-20 w-20 shrink-0 rounded-lg border border-stone-200 object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-kitchen-muted">
        <span className="flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1.5 text-rose-600">
          <Sparkles size={15} />
          想吃 {item.cravingLevel}/5
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1.5">
          <Heart size={14} />
          Wishlist
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1.5">
          <CalendarDays size={14} />
          {formatDate(item.createdAt)}
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1.5">
          <LinkIcon size={14} />
          {item.sourceUrl ? "有来源" : "无来源"}
          {item.sourceUrl ? <ExternalLink size={12} /> : null}
        </span>
      </div>
    </button>
  );
}
