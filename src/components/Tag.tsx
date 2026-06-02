import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-kitchen-mint px-2 py-1 text-xs font-semibold text-stone-700">
      {children}
    </span>
  );
}
