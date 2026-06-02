import { useState, type FormEvent } from "react";
import type { InventoryDraft, InventoryItem, InventoryLocation } from "../../data/types";

interface InventoryFormProps {
  initial?: InventoryItem;
  onSubmit: (draft: InventoryDraft) => void;
  onCancel: () => void;
}

export function InventoryForm({ initial, onSubmit, onCancel }: InventoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [location, setLocation] = useState<InventoryLocation>(initial?.location ?? "fridge");
  const [expireDate, setExpireDate] = useState(initial?.expireDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      quantity: quantity ? Number(quantity) : undefined,
      unit: unit.trim() || undefined,
      category: category.trim() || undefined,
      location,
      expireDate: expireDate || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">食材名称</span>
        <input className="k-input" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold">数量</span>
          <input className="k-input" min="0" step="0.1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">单位</span>
          <input className="k-input" value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="个 / g / 包" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">分类</span>
          <input className="k-input" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="蔬菜 / 肉类" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">存放位置</span>
          <select className="k-input" value={location} onChange={(event) => setLocation(event.target.value as InventoryLocation)}>
            <option value="fridge">冷藏</option>
            <option value="freezer">冷冻</option>
            <option value="pantry">常温</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">过期日期</span>
        <input className="k-input" type="date" value={expireDate} onChange={(event) => setExpireDate(event.target.value)} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">备注</span>
        <textarea className="k-input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
        <button className="k-button-secondary" type="button" onClick={onCancel}>
          取消
        </button>
        <button className="k-button-primary" type="submit">
          保存食材
        </button>
      </div>
    </form>
  );
}
