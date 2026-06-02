import { ExternalLink, Heart, Link as LinkIcon, Sparkles } from "lucide-react";
import type { WishlistItem } from "../data/types";
import { formatDate } from "../utils/date";
import { Tag } from "./Tag";

interface WishlistCardProps {
  item: WishlistItem;
  onClick?: () => void;
}

export function WishlistCard({ item, onClick }: WishlistCardProps) {
  return (
    <button className="k-card group overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-lg" onClick={onClick}>
      <div className="aspect-[4/3] bg-stone-100">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center bg-rose-50 text-rose-400">
            <Heart size={36} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-black">{item.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-kitchen-muted">
          <Sparkles size={15} />
          想吃指数 {item.cravingLevel}/5
        </div>
        {item.notes ? <p className="mt-2 line-clamp-2 text-sm text-kitchen-muted">{item.notes}</p> : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-kitchen-muted">
          <span>{formatDate(item.createdAt)}</span>
          {item.sourceUrl ? (
            <span className="flex items-center gap-1">
              <LinkIcon size={13} />
              有来源
              <ExternalLink size={12} />
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
