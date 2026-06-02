import { Plus, Refrigerator, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { InventoryCard, locationLabel } from "../components/InventoryCard";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { InventoryForm } from "../components/forms/InventoryForm";
import { useKitchen } from "../context/KitchenContext";
import type { InventoryItem, InventoryLocation } from "../data/types";
import { daysUntil, expiryLabel, fullDate } from "../utils/date";

const locations: InventoryLocation[] = ["fridge", "freezer", "pantry"];

export function Fridge() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useKitchen();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);

  const selectedItem = inventory.find((item) => item.id === selectedId) ?? null;
  const editingItem = inventory.find((item) => item.id === editingId) ?? null;

  const sortedInventory = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...inventory]
      .filter((item) => [item.name, item.category ?? "", item.notes ?? ""].join(" ").toLowerCase().includes(query))
      .sort((a, b) => (daysUntil(a.expireDate) ?? 999) - (daysUntil(b.expireDate) ?? 999));
  }, [inventory, search]);

  const urgentItems = sortedInventory.filter((item) => {
    const days = daysUntil(item.expireDate);
    return days !== undefined && days <= 3;
  });
  const urgentIds = new Set(urgentItems.map((item) => item.id));

  return (
    <div>
      <PageHeader
        title="我的冰箱"
        actions={
          <button className="k-button-primary" onClick={() => setCreating(true)}>
            <Plus size={18} />
            添加食材
          </button>
        }
      />

      <label className="relative mb-5 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-kitchen-muted" size={18} />
        <input
          className="k-input pl-10"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索食材、分类、备注"
        />
      </label>

      {urgentItems.length ? (
        <section className="mb-7">
          <h2 className="mb-3 text-xl font-black">快过期和已过期</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {urgentItems.map((item) => (
              <InventoryCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
            ))}
          </div>
        </section>
      ) : null}

      {sortedInventory.length ? (
        <div className="grid gap-7">
          {locations.map((location) => {
            const items = sortedInventory.filter((item) => item.location === location && !urgentIds.has(item.id));
            if (!items.length) return null;
            return (
              <section key={location}>
                <h2 className="mb-3 text-xl font-black">{locationLabel(location)}</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <InventoryCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Refrigerator} title="冰箱里还没有记录" />
      )}

      {selectedItem ? (
        <Modal title={selectedItem.name} onClose={() => setSelectedId(null)} widthClass="max-w-xl">
          <InventoryDetail item={selectedItem} onEdit={() => setEditingId(selectedItem.id)} onDelete={() => setDeleting(selectedItem)} />
        </Modal>
      ) : null}

      {creating ? (
        <Modal title="添加食材" onClose={() => setCreating(false)} widthClass="max-w-xl">
          <InventoryForm
            onCancel={() => setCreating(false)}
            onSubmit={(draft) => {
              const item = addInventoryItem(draft);
              setCreating(false);
              setSelectedId(item.id);
            }}
          />
        </Modal>
      ) : null}

      {editingItem ? (
        <Modal title="编辑食材" onClose={() => setEditingId(null)} widthClass="max-w-xl">
          <InventoryForm
            initial={editingItem}
            onCancel={() => setEditingId(null)}
            onSubmit={(draft) => {
              updateInventoryItem(editingItem.id, draft);
              setEditingId(null);
            }}
          />
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="删除食材"
          description={`确定删除「${deleting.name}」吗？`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteInventoryItem(deleting.id);
            setDeleting(null);
            setSelectedId(null);
          }}
        />
      ) : null}
    </div>
  );
}

function InventoryDetail({
  item,
  onEdit,
  onDelete,
}: {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Detail label="数量" value={`${item.quantity ?? "-"} ${item.unit ?? ""}`} />
        <Detail label="分类" value={item.category || "未填写"} />
        <Detail label="存放位置" value={locationLabel(item.location)} />
        <Detail label="过期状态" value={expiryLabel(item.expireDate)} />
        <Detail label="过期日期" value={item.expireDate ? fullDate(item.expireDate) : "未设置"} />
        <Detail label="创建时间" value={fullDate(item.createdAt)} />
      </div>

      {item.notes ? (
        <section className="mt-4 rounded-lg bg-white p-4">
          <h3 className="font-black">备注</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-kitchen-muted">{item.notes}</p>
        </section>
      ) : null}

      <div className="mt-6 flex justify-end gap-2 border-t border-stone-200 pt-4">
        <button className="k-button-secondary" onClick={onEdit}>
          编辑
        </button>
        <button className="k-button-secondary text-red-600 hover:bg-red-50" onClick={onDelete}>
          <Trash2 size={16} />
          删除
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-4">
      <p className="text-xs font-semibold text-kitchen-muted">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
