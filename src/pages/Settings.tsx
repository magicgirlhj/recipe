import { RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useKitchen } from "../context/KitchenContext";

export function Settings() {
  const { resetDemoData } = useKitchen();

  return (
    <div>
      <PageHeader title="设置" />
      <div className="grid gap-4 md:grid-cols-2">
        <section className="k-card p-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-kitchen-mint text-green-700">
            <SettingsIcon size={22} />
          </div>
          <h2 className="text-xl font-black">本地存储</h2>
          <p className="mt-2 text-sm text-kitchen-muted">
            当前数据保存在浏览器 localStorage 中。换浏览器、清理站点数据或使用无痕模式都会影响这些记录。
          </p>
        </section>
        <section className="k-card p-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <RotateCcw size={22} />
          </div>
          <h2 className="text-xl font-black">示例数据</h2>
          <p className="mt-2 text-sm text-kitchen-muted">恢复初始示例数据，适合演示或重新体验第一版数据结构。</p>
          <button className="k-button-secondary mt-4" onClick={resetDemoData}>
            <RotateCcw size={16} />
            恢复示例数据
          </button>
        </section>
      </div>
    </div>
  );
}
