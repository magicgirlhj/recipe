import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
}

export function Modal({ title, children, onClose, widthClass = "max-w-3xl" }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-kitchen-paper shadow-2xl sm:rounded-lg ${widthClass}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-kitchen-paper/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="k-button-ghost h-9 w-9 p-0" onClick={onClose} aria-label="关闭">
            <X size={19} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
