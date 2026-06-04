import { resolveFoodIcon } from "../data/foodIcons";

interface FoodIconProps {
  iconKey?: string;
  name?: string;
  category?: string;
  className?: string;
  imageClassName?: string;
}

export function FoodIcon({ iconKey, name, category, className = "", imageClassName = "" }: FoodIconProps) {
  const icon = resolveFoodIcon({ iconKey, name, category });

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white/85",
        className,
      ].join(" ")}
      title={icon.label}
    >
      <img
        src={icon.src}
        alt={icon.label}
        className={["h-full w-full object-contain k-pixel-image", imageClassName].join(" ")}
        draggable={false}
      />
    </span>
  );
}
