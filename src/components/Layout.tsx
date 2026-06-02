import {
  BookOpen,
  ChefHat,
  Heart,
  Home,
  Refrigerator,
  Settings,
  Sparkles,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "首页", icon: Home },
  { to: "/recipes", label: "菜谱", icon: BookOpen },
  { to: "/wishlist", label: "想吃", icon: Heart },
  { to: "/fridge", label: "冰箱", icon: Refrigerator },
  { to: "/recommendation", label: "推荐", icon: Sparkles },
  { to: "/settings", label: "设置", icon: Settings },
];

export function Layout() {
  return (
    <div className="min-h-screen text-kitchen-ink">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 border-r border-stone-200/80 bg-kitchen-paper/90 px-4 py-5 backdrop-blur lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-kitchen-orange text-white">
            <ChefHat size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-kitchen-muted">My Kitchen</p>
            <h1 className="text-lg font-bold">今天吃什么</h1>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-kitchen-mint text-kitchen-ink"
                    : "text-kitchen-muted hover:bg-stone-100 hover:text-kitchen-ink",
                ].join(" ")
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:ml-64 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-6 border-t border-stone-200 bg-kitchen-paper/95 px-2 pb-2 pt-2 backdrop-blur lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition",
                isActive ? "bg-kitchen-mint text-kitchen-ink" : "text-kitchen-muted",
              ].join(" ")
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
