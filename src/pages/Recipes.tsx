import { BookOpen, ChefHat, ClipboardList, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { RecipeCard } from "../components/RecipeCard";
import { SegmentedControl } from "../components/SegmentedControl";
import { Tag } from "../components/Tag";
import { RecipeBatchImport } from "../components/forms/RecipeBatchImport";
import { RecipeForm } from "../components/forms/RecipeForm";
import { useKitchen } from "../context/KitchenContext";
import type { Recipe } from "../data/types";
import { formatDate, fullDate } from "../utils/date";

const difficultyLabel = {
  easy: "简单",
  medium: "适中",
  hard: "费工夫",
};

export function Recipes() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, markCooked } = useKitchen();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("全部");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [batchImporting, setBatchImporting] = useState(false);
  const [deleting, setDeleting] = useState<Recipe | null>(null);

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedId) ?? null;
  const editingRecipe = recipes.find((recipe) => recipe.id === editingId) ?? null;

  const tagFilters = useMemo(() => {
    const customTags = recipes
      .flatMap((recipe) => recipe.tags)
      .map((item) => item.trim())
      .filter(Boolean);

    return ["全部", ...Array.from(new Set(customTags))];
  }, [recipes]);

  useEffect(() => {
    if (tag !== "全部" && !tagFilters.includes(tag)) {
      setTag("全部");
    }
  }, [tag, tagFilters]);

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
          <div className="flex flex-wrap gap-2">
            <button className="k-button-secondary" onClick={() => setBatchImporting(true)}>
              <ClipboardList size={18} />
              批量导入
            </button>
            <button className="k-button-primary" onClick={() => setCreating(true)}>
              <Plus size={18} />
              新建菜谱
            </button>
          </div>
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
        <Modal title="菜谱详情" onClose={() => setSelectedId(null)} widthClass="max-w-5xl">
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

      {batchImporting ? (
        <Modal title="批量导入菜谱" onClose={() => setBatchImporting(false)} widthClass="max-w-5xl">
          <RecipeBatchImport
            existingRecipes={recipes}
            onCancel={() => setBatchImporting(false)}
            onImport={(drafts) => {
              const createdRecipes: Recipe[] = [];
              drafts
                .slice()
                .reverse()
                .forEach((draft) => {
                  createdRecipes.unshift(addRecipe(draft));
                });
              setBatchImporting(false);
              if (createdRecipes[0]) setSelectedId(createdRecipes[0].id);
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
  const primaryTags = recipe.tags.slice(0, 3);
  const tagLine = primaryTags.length ? primaryTags.join(" / ") : "我的菜谱";
  const detailItems = [
    recipe.cookingTime ? `${recipe.cookingTime} 分钟` : "未填写时间",
    recipe.cookingMethod || "未填写方式",
    recipe.difficulty ? difficultyLabel[recipe.difficulty] : "未填写难度",
    `做过 ${recipe.cookedCount} 次`,
    `最近 ${formatDate(recipe.lastCookedAt)}`,
  ];

  return (
    <div className="-m-5 bg-kitchen-paper px-5 pb-5 pt-4 sm:m-0 sm:bg-transparent sm:p-0">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-stone-200 pb-5 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8">
          <div>
            <p className="text-sm font-bold text-kitchen-muted">{tagLine}</p>
            <h2 className="mt-2 text-4xl font-black leading-none tracking-normal text-kitchen-ink sm:text-5xl lg:text-6xl">
              {recipe.name}
            </h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5 lg:mt-0 lg:max-w-sm lg:justify-end">
            {recipe.tags.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)] lg:gap-12">
          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h3 className="text-3xl font-black leading-none text-kitchen-ink">食材</h3>
              <span className="text-sm font-bold text-kitchen-muted">{recipe.ingredients.length} 项</span>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 text-base"
                  key={`${ingredient.name}-${index}`}
                >
                  <span className="font-black text-kitchen-ink">{ingredient.name}</span>
                  <span className="text-right text-sm font-bold text-kitchen-muted">{ingredient.amount || "适量"}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h3 className="text-3xl font-black leading-none text-kitchen-ink">步骤</h3>
              <span className="text-sm font-bold text-kitchen-muted">{recipe.steps.length} 步</span>
            </div>
            <ol className="space-y-5 border-y border-stone-200 py-5 lg:space-y-6">
              {recipe.steps.map((step, index) => (
                <li className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4" key={`${step}-${index}`}>
                  <span className="pt-1 text-sm font-black text-kitchen-orange">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="m-0 text-base leading-7 text-kitchen-ink lg:text-lg lg:leading-8">{step}</p>
                </li>
              ))}
            </ol>

            {recipe.notes ? (
              <section className="mt-6 border-b border-stone-200 pb-5">
                <h3 className="text-xl font-black">备注</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-kitchen-muted">{recipe.notes}</p>
              </section>
            ) : null}

            {recipe.image ? (
              <section className="mt-6 border-b border-stone-200 pb-5">
                <h3 className="text-xl font-black">照片</h3>
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="mt-3 aspect-[16/9] w-full rounded-lg object-cover lg:max-h-72"
                />
              </section>
            ) : null}
          </section>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-3 gap-y-2 border-b border-stone-200 pb-5 text-xs font-black text-kitchen-muted">
          {detailItems.map((item) => (
            <span className="border-b border-stone-300 pb-1" key={item}>
              {item}
            </span>
          ))}
          <span className="border-b border-stone-300 pb-1">创建于 {fullDate(recipe.createdAt)}</span>
        </div>

        <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <button className="k-button-secondary min-h-11" onClick={onEdit}>
            编辑
          </button>
          <button className="k-button-secondary min-h-11 text-red-600 hover:bg-red-50" onClick={onDelete}>
            <Trash2 size={16} />
            删除
          </button>
          <button className="k-button-primary min-h-11" onClick={onCooked}>
            <ChefHat size={16} />
            今天做了
          </button>
        </div>
      </div>
    </div>
  );
}
