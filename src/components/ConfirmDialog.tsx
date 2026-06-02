import { Modal } from "./Modal";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "确认删除",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} widthClass="max-w-md">
      <p className="text-sm text-kitchen-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="k-button-secondary" onClick={onCancel}>
          取消
        </button>
        <button className="k-button bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
