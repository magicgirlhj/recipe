import { useEffect, useState, type FormEvent } from "react";
import { FoodIcon } from "../FoodIcon";
import { foodIconOptions, matchFoodIconByName, resolveFoodIcon, type FoodIconOption } from "../../data/foodIcons";
import type { InventoryDraft, InventoryItem, InventoryLocation } from "../../data/types";
import { daysBetweenDates } from "../../utils/date";

interface InventoryFormProps {
  initial?: InventoryItem;
  onSubmit: (draft: InventoryDraft) => void;
  onCancel: () => void;
}

export function InventoryForm({ initial, onSubmit, onCancel }: InventoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [iconKey, setIconKey] = useState(initial?.iconKey ?? matchFoodIconByName(initial?.name)?.key ?? "");
  const [manualIcon, setManualIcon] = useState(Boolean(initial?.iconKey));
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? "1");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [location, setLocation] = useState<InventoryLocation>(initial?.location ?? "fridge");
  const [shelfLifeDays, setShelfLifeDays] = useState(
    (initial?.shelfLifeDays ?? daysBetweenDates(initial?.createdAt, initial?.expireDate) ?? 7).toString(),
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const selectedIcon = resolveFoodIcon({ iconKey, name });

  useEffect(() => {
    if (manualIcon) return;
    setIconKey(matchFoodIconByName(name)?.key ?? "");
  }, [manualIcon, name]);

  function chooseIcon(option: FoodIconOption) {
    setIconKey(option.key);
    setManualIcon(true);
    if (!name.trim()) setName(option.label);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const matchedIcon = iconKey || matchFoodIconByName(name)?.key;

    onSubmit({
      name: name.trim(),
      iconKey: matchedIcon || undefined,
      quantity: quantity ? Number(quantity) : 1,
      unit: unit.trim() || undefined,
      category: undefined,
      location,
      shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : undefined,
      expireDate: undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-sm font-bold">食材名称</span>
          <input
            className="k-input"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setManualIcon(false);
            }}
            required
          />
        </label>
        <div>
          <span className="mb-1 block text-sm font-bold">图标</span>
          <FoodIcon iconKey={iconKey} name={name} className="h-12 w-12 p-1.5 sm:h-[42px] sm:w-[42px]" />
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-bold">常用食材图标</span>
          <span className="text-xs font-semibold text-kitchen-muted">{selectedIcon.label}</span>
        </div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {foodIconOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={[
                "flex aspect-square items-center justify-center rounded-lg border bg-white p-1.5 transition hover:border-kitchen-orange hover:bg-orange-50",
                selectedIcon.key === option.key ? "border-kitchen-orange ring-2 ring-orange-100" : "border-stone-200",
              ].join(" ")}
              onClick={() => chooseIcon(option)}
              title={option.label}
              aria-label={`选择${option.label}图标`}
            >
              <img src={option.src} alt="" className="h-full w-full object-contain k-pixel-image" draggable={false} />
            </button>
          ))}
        </div>
      </section>

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
          <span className="mb-1 block text-sm font-bold">存放位置</span>
          <select className="k-input" value={location} onChange={(event) => setLocation(event.target.value as InventoryLocation)}>
            <option value="fridge">冷藏</option>
            <option value="freezer">冷冻</option>
            <option value="pantry">常温</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">多久过期（天）</span>
          <input
            className="k-input"
            min="0"
            step="1"
            type="number"
            value={shelfLifeDays}
            onChange={(event) => setShelfLifeDays(event.target.value)}
            placeholder="例如 7"
          />
        </label>
      </div>
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
