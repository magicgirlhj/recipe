import { ArrowUpRight, BookOpen, Heart, RefreshCcw, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import { Tag } from "../components/Tag";
import { useKitchen } from "../context/KitchenContext";
import { publicRecipes } from "../data/sampleData";
import type { PublicRecipe, Recipe, RecommendationItem, RecommendationMode, WishlistItem } from "../data/types";
import { generateRecommendations } from "../utils/recommendations";

const modeOptions: { value: RecommendationMode; label: string }[] = [
  { value: "balanced", label: "综合推荐" },
  { value: "fridge", label: "冰箱优先" },
  { value: "wishlist", label: "Wishlist 优先" },
  { value: "random", label: "随机探索" },
];

const sourceLabel = {
  recipe: "我的菜谱",
  wishlist: "Wishlist",
  public: "公共菜谱",
};

const sourceIcon = {
  recipe: BookOpen,
  wishlist: Heart,
  public: Utensils,
};

export function Recommendation() {
  const { recipes, wishlist, inventory } = useKitchen();
  const [mode, setMode] = useState<RecommendationMode>("balanced");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<RecommendationItem | null>(null);

  const recommendations = useMemo(
    () => generateRecommendations(mode, recipes, wishlist, inventory, 5),
    [inventory, mode, recipes, refreshKey, wishlist],
  );

  const detail = selected ? findRecommendationDetail(selected, recipes, wishlist) : null;

  return (
    <div>
      <PageHeader
        title="今天吃什么？"
        actions={
          <button className="k-button-secondary" onClick={() => setRefreshKey((key) => key + 1)}>
            <RefreshCcw size={17} />
            换一组
          </button>
        }
      />

      <div className="mb-6">
        <SegmentedControl
          value={mode}
          options={modeOptions}
          onChange={(nextMode) => {
            setMode(nextMode);
            setRefreshKey((key) => key + 1);
          }}
        />
      </div>

      <div className="grid gap-4">
        {recommendations.map((item, index) => {
          const Icon = sourceIcon[item.source];
          return (
            <button
              key={`${item.id}-${refreshKey}`}
              className="k-card grid gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[auto_1fr_auto]"
              onClick={() => setSelected(item)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-kitchen-mint text-green-700">
                <Icon size={22} />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-kitchen-orange">TOP {index + 1}</span>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-kitchen-muted">{sourceLabel[item.source]}</span>
                </div>
                <h3 className="text-xl font-black">{item.name}</h3>
                <p className="mt-2 text-sm text-kitchen-muted">{item.reason}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                <div className="text-left md:text-right">
                  <p className="text-xs font-semibold text-kitchen-muted">匹配度</p>
                  <p className="text-3xl font-black text-kitchen-orange">{item.score}</p>
                </div>
                <span className="k-button-secondary">
                  查看
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <RecommendationDetail item={selected} detail={detail} />
        </Modal>
      ) : null}
    </div>
  );
}

function findRecommendationDetail(
  item: RecommendationItem,
  recipes: Recipe[],
  wishlist: WishlistItem[],
) {
  if (item.source === "recipe") return recipes.find((recipe) => recipe.id === item.sourceId);
  if (item.source === "wishlist") return wishlist.find((wish) => wish.id === item.sourceId);
  return publicRecipes.find((recipe) => recipe.id === item.sourceId);
}

function RecommendationDetail({
  item,
  detail,
}: {
  item: RecommendationItem;
  detail: ReturnType<typeof findRecommendationDetail> | null;
}) {
  const publicDetail = item.source === "public" ? (detail as PublicRecipe | undefined) : null;
  const recipeLike = item.source === "recipe" ? (detail as Recipe | undefined) : null;
  const wishlistLike = item.source === "wishlist" ? (detail as WishlistItem | undefined) : null;

  return (
    <div>
      {item.image ? <img src={item.image} alt={item.name} className="mb-5 aspect-[16/9] w-full rounded-lg object-cover" /> : null}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-semibold text-kitchen-muted">来源</p>
          <p className="mt-1 font-black">{sourceLabel[item.source]}</p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-semibold text-kitchen-muted">推荐分数</p>
          <p className="mt-1 font-black">{item.score}</p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs font-semibold text-kitchen-muted">冰箱匹配</p>
          <p className="mt-1 font-black">{item.matchedIngredients.length ? item.matchedIngredients.join("、") : "暂无"}</p>
        </div>
      </div>
      <section className="mt-4 rounded-lg bg-white p-4">
        <h3 className="font-black">推荐原因</h3>
        <p className="mt-2 text-sm text-kitchen-muted">{item.reason}</p>
      </section>

      {recipeLike ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg bg-white p-4">
            <h3 className="font-black">食材</h3>
            <div className="mt-3 space-y-2">
              {recipeLike.ingredients.map((ingredient, index) => (
                <div className="flex justify-between text-sm" key={`${ingredient.name}-${index}`}>
                  <span className="font-semibold">{ingredient.name}</span>
                  <span className="text-kitchen-muted">{ingredient.amount}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg bg-white p-4">
            <h3 className="font-black">步骤</h3>
            <ol className="mt-3 space-y-2 text-sm text-kitchen-muted">
              {recipeLike.steps.map((step, index) => (
                <li key={`${step}-${index}`}>
                  <span className="mr-2 font-black text-kitchen-orange">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}

      {publicDetail ? (
        <section className="mt-4 rounded-lg bg-white p-4">
          <h3 className="font-black">公共菜谱食材</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {publicDetail.ingredients.map((ingredient) => (
              <span className="rounded-md bg-kitchen-mint px-2 py-1 text-sm font-semibold" key={ingredient.name}>
                {ingredient.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {wishlistLike ? (
        <section className="mt-4 rounded-lg bg-white p-4">
          <h3 className="font-black">Wishlist 信息</h3>
          <p className="mt-2 text-sm text-kitchen-muted">想吃指数 {wishlistLike.cravingLevel}/5</p>
          {wishlistLike.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-kitchen-muted">{wishlistLike.notes}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
