import { ArrowRight, BookOpen, Heart, Refrigerator, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InventoryCard } from "../components/InventoryCard";
import { PageHeader } from "../components/PageHeader";
import { RecipeCard } from "../components/RecipeCard";
import { StatCard } from "../components/StatCard";
import { WishlistCard } from "../components/WishlistCard";
import { useKitchen } from "../context/KitchenContext";
import { generateRecommendations } from "../utils/recommendations";
import { daysUntil } from "../utils/date";

export function Dashboard() {
  const navigate = useNavigate();
  const { recipes, wishlist, inventory } = useKitchen();
  const recentRecipes = [...recipes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const recentWishlist = [...wishlist]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const expiringSoon = inventory
    .filter((item) => {
      const days = daysUntil(item.expireDate);
      return days !== undefined && days >= 0 && days <= 3;
    })
    .sort((a, b) => (daysUntil(a.expireDate) ?? 99) - (daysUntil(b.expireDate) ?? 99))
    .slice(0, 3);
  const recommendations = generateRecommendations("balanced", recipes, wishlist, inventory, 3);

  return (
    <div>
      <PageHeader
        eyebrow="My Kitchen"
        title="我的厨房"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={BookOpen} label="菜谱数量" value={recipes.length} tone="orange" />
        <StatCard icon={Heart} label="Wishlist 数量" value={wishlist.length} tone="clay" />
        <StatCard icon={Refrigerator} label="冰箱食材数量" value={inventory.length} tone="sage" />
      </section>

      <section className="mt-8 grid gap-8">
        <DashboardSection title="最近添加的菜谱" to="/recipes">
          <div className="grid gap-4 md:grid-cols-3">
            {recentRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigate("/recipes")} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="最近收藏的 Wishlist" to="/wishlist">
          <div className="grid gap-4 md:grid-cols-3">
            {recentWishlist.map((item) => (
              <WishlistCard key={item.id} item={item} onClick={() => navigate("/wishlist")} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="冰箱快过期提醒" to="/fridge">
          {expiringSoon.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {expiringSoon.map((item) => (
                <InventoryCard key={item.id} item={item} onClick={() => navigate("/fridge")} />
              ))}
            </div>
          ) : (
            <div className="k-card px-5 py-8 text-sm font-semibold text-kitchen-muted">暂无快过期食材</div>
          )}
        </DashboardSection>

        <DashboardSection title="今天吃什么" to="/recommendation" linkLabel="查看更多推荐">
          <div className="grid gap-4 md:grid-cols-3">
            {recommendations.map((item) => (
              <button
                key={item.id}
                className="k-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => navigate("/recommendation")}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black">{item.name}</h3>
                <p className="mt-2 text-sm text-kitchen-muted">{item.reason}</p>
                <p className="mt-4 text-sm font-black text-kitchen-orange">{item.score} 分</p>
              </button>
            ))}
          </div>
        </DashboardSection>
      </section>
    </div>
  );
}

function DashboardSection({
  title,
  to,
  linkLabel = "查看更多",
  children,
}: {
  title: string;
  to: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{title}</h2>
        <Link className="k-button-ghost" to={to}>
          {linkLabel}
          <ArrowRight size={16} />
        </Link>
      </div>
      {children}
    </section>
  );
}
