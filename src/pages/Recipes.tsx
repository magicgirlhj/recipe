import { BookOpen, CalendarClock, ChefHat, Clock3, Flame, Plus, Search, Trash2, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { RecipeCard } from "../components/RecipeCard";
import { SegmentedControl } from "../components/SegmentedControl";
import { Tag } from "../components/Tag";
import { RecipeForm } from "../components/forms/RecipeForm";
import { useKitchen } from "../context/KitchenContext";
import type { Recipe } from "../data/types";
import { formatDate, fullDate } from "../utils/date";

const tagFilters = ["全部", "早餐", "午餐", "晚餐", "快手菜", "减脂", "高蛋白", "中餐", "日料", "韩餐"] as const;

const difficultyLabel = {
  easy: "简单",
  medium: "适中",
  hard: "费工夫",
};

export function Recipes() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, markCooked } = useKitchen();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<(typeof tagFilters)[number]>("全部");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Recipe | null>(null);

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedId) ?? null;
  const editingRecipe = recipes.find((recipe) => recipe.id === editingId) ?? null;

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const inTag = tag === "全部" || recipe.tags.includes(tag);
      const haystack = [
        recipe.name,
        ...recipe.tags,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ]
        .join(" ")
        .toLowerCase();
      return inTag && (!query || haystack.includes(query));
    });
  }, [recipes, search, tag]);

  return (
    <div>
      <PageHeader
        title="我的菜谱"
        actions={
          <button className="k-button-primary" onClick={() => setCreating(true)}>
            <Plus size={18} />
            新建菜谱
          </button>
        }
      />

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-kitchen-muted" size={18} />
          <input
            className="k-input pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索菜名、标签、食材"
          />
        </label>
        <SegmentedControl value={tag} options={tagFilters.map((item) => ({ value: item, label: item }))} onChange={setTag} />
      </div>

      {filteredRecipes.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedId(recipe.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="没有找到菜谱" />
      )}

      {selectedRecipe ? (
        <Modal title={selectedRecipe.name} onClose={() => setSelectedId(null)}>
          <RecipeDetail
            recipe={selectedRecipe}
            onCooked={() => markCooked(selectedRecipe.id)}
            onEdit={() => setEditingId(selectedRecipe.id)}
            onDelete={() => setDeleting(selectedRecipe)}
          />
        </Modal>
      ) : null}

      {creating ? (
        <Modal title="新建菜谱" onClose={() => setCreating(false)}>
          <RecipeForm
            onCancel={() => setCreating(false)}
            onSubmit={(draft) => {
              const recipe = addRecipe(draft);
              setCreating(false);
              setSelectedId(recipe.id);
            }}
          />
        </Modal>
      ) : null}

      {editingRecipe ? (
        <Modal title="编辑菜谱" onClose={() => setEditingId(null)}>
          <RecipeForm
            initial={editingRecipe}
            onCancel={() => setEditingId(null)}
            onSubmit={(draft) => {
              updateRecipe(editingRecipe.id, draft);
              setEditingId(null);
            }}
          />
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="删除菜谱"
          description={`确定删除「${deleting.name}」吗？这个操作只会影响本地浏览器数据。`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteRecipe(deleting.id);
            setDeleting(null);
            setSelectedId(null);
          }}
        />
      ) : null}
    </div>
  );
}

function RecipeDetail({
  recipe,
  onCooked,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onCooked: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      {recipe.image ? <img src={recipe.image} alt={recipe.name} className="mb-5 aspect-[16/9] w-full rounded-lg object-cover" /> : null}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {recipe.tags.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <DetailMetric icon={Clock3} label="制作时间" value={recipe.cookingTime ? `${recipe.cookingTime} 分钟` : "未填写"} />
        <DetailMetric icon={Flame} label="烹饪方式" value={recipe.cookingMethod || "未填写"} />
        <DetailMetric icon={ChefHat} label="难度" value={recipe.difficulty ? difficultyLabel[recipe.difficulty] : "未填写"} />
        <DetailMetric icon={BookOpen} label="做过次数" value={`${recipe.cookedCount} 次`} />
        <DetailMetric icon={CalendarClock} label="最近做过" value={formatDate(recipe.lastCookedAt)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-black">食材</h3>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <div className="flex justify-between rounded-lg bg-white px-3 py-2 text-sm" key={`${ingredient.name}-${index}`}>
                <span className="font-semibold">{ingredient.name}</span>
                <span className="text-kitchen-muted">{ingredient.amount}</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-3 font-black">步骤</h3>
          <ol className="space-y-2">
            {recipe.steps.map((step, index) => (
              <li className="rounded-lg bg-white px-3 py-2 text-sm text-kitchen-muted" key={`${step}-${index}`}>
                <span className="mr-2 font-black text-kitchen-orange">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>

      {recipe.notes ? (
        <section className="mt-6 rounded-lg bg-white p-4">
          <h3 className="font-black">备注</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-kitchen-muted">{recipe.notes}</p>
        </section>
      ) : null}

      <p className="mt-4 text-xs font-semibold text-kitchen-muted">创建于 {fullDate(recipe.createdAt)}</p>

      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-stone-200 pt-4">
        <button className="k-button-secondary" onClick={onEdit}>
          编辑
        </button>
        <button className="k-button-secondary text-red-600 hover:bg-red-50" onClick={onDelete}>
          <Trash2 size={16} />
          删除
        </button>
        <button className="k-button-primary" onClick={onCooked}>
          <ChefHat size={16} />
          今天做了
        </button>
      </div>
    </div>
  );
}

function DetailMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <Icon className="mb-2 text-kitchen-orange" size={18} />
      <p className="text-xs font-semibold text-kitchen-muted">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
