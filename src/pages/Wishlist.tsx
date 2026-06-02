import { ArrowUpRight, Heart, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Tag } from "../components/Tag";
import { WishlistCard } from "../components/WishlistCard";
import { WishlistForm } from "../components/forms/WishlistForm";
import { useKitchen } from "../context/KitchenContext";
import type { WishlistItem } from "../data/types";
import { fullDate } from "../utils/date";

export function Wishlist() {
  const {
    wishlist,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    convertWishlistToRecipe,
  } = useKitchen();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<WishlistItem | null>(null);
  const [notice, setNotice] = useState("");

  const selectedItem = wishlist.find((item) => item.id === selectedId) ?? null;
  const editingItem = wishlist.find((item) => item.id === editingId) ?? null;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return wishlist.filter((item) =>
      [item.name, item.notes ?? "", ...item.tags].join(" ").toLowerCase().includes(query),
    );
  }, [search, wishlist]);

  return (
    <div>
      <PageHeader
        title="想吃清单"
        actions={
          <button className="k-button-primary" onClick={() => setCreating(true)}>
            <Plus size={18} />
            添加想吃
          </button>
        }
      />

      {notice ? (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {notice}
        </div>
      ) : null}

      <label className="relative mb-5 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-kitchen-muted" size={18} />
        <input
          className="k-input pl-10"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索菜名、标签、备注"
        />
      </label>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <WishlistCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Heart} title="没有找到想吃项目" />
      )}

      {selectedItem ? (
        <Modal title={selectedItem.name} onClose={() => setSelectedId(null)}>
          <WishlistDetail
            item={selectedItem}
            onEdit={() => setEditingId(selectedItem.id)}
            onDelete={() => setDeleting(selectedItem)}
            onConvert={() => {
              const recipe = convertWishlistToRecipe(selectedItem.id);
              if (recipe) {
                setNotice(`已将「${recipe.name}」转成菜谱`);
                setSelectedId(null);
              }
            }}
          />
        </Modal>
      ) : null}

      {creating ? (
        <Modal title="添加想吃" onClose={() => setCreating(false)}>
          <WishlistForm
            onCancel={() => setCreating(false)}
            onSubmit={(draft) => {
              const item = addWishlistItem(draft);
              setCreating(false);
              setSelectedId(item.id);
            }}
          />
        </Modal>
      ) : null}

      {editingItem ? (
        <Modal title="编辑想吃" onClose={() => setEditingId(null)}>
          <WishlistForm
            initial={editingItem}
            onCancel={() => setEditingId(null)}
            onSubmit={(draft) => {
              updateWishlistItem(editingItem.id, draft);
              setEditingId(null);
            }}
          />
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="删除 Wishlist"
          description={`确定删除「${deleting.name}」吗？`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteWishlistItem(deleting.id);
            setDeleting(null);
            setSelectedId(null);
          }}
        />
      ) : null}
    </div>
  );
}

function WishlistDetail({
  item,
  onEdit,
  onDelete,
  onConvert,
}: {
  item: WishlistItem;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
}) {
  return (
    <div>
      {item.image ? <img src={item.image} alt={item.name} className="mb-5 aspect-[16/9] w-full rounded-lg object-cover" /> : null}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-4">
          <Sparkles className="mb-2 text-kitchen-orange" size={18} />
          <p className="text-xs font-semibold text-kitchen-muted">想吃指数</p>
          <p className="mt-1 text-xl font-black">{item.cravingLevel}/5</p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <Heart className="mb-2 text-rose-500" size={18} />
          <p className="text-xs font-semibold text-kitchen-muted">创建时间</p>
          <p className="mt-1 text-xl font-black">{fullDate(item.createdAt)}</p>
        </div>
      </div>

      {item.sourceUrl ? (
        <a
          className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-kitchen-orange hover:text-orange-700"
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          查看来源
          <ArrowUpRight size={16} />
        </a>
      ) : null}

      {item.notes ? (
        <section className="mt-4 rounded-lg bg-white p-4">
          <h3 className="font-black">备注</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-kitchen-muted">{item.notes}</p>
        </section>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-stone-200 pt-4">
        <button className="k-button-secondary" onClick={onEdit}>
          编辑
        </button>
        <button className="k-button-secondary text-red-600 hover:bg-red-50" onClick={onDelete}>
          <Trash2 size={16} />
          删除
        </button>
        <button className="k-button-primary" onClick={onConvert}>
          转成菜谱
        </button>
      </div>
    </div>
  );
}
