import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Ingredient, Recipe, RecipeDifficulty, RecipeDraft } from "../../data/types";

interface RecipeFormProps {
  initial?: Recipe;
  onSubmit: (draft: RecipeDraft) => void;
  onCancel: () => void;
}

const splitTags = (value: string) =>
  value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export function RecipeForm({ initial, onSubmit, onCancel }: RecipeFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [tags, setTags] = useState(initial?.tags.join("，") ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients.length ? initial.ingredients : [{ name: "", amount: "" }],
  );
  const [steps, setSteps] = useState<string[]>(initial?.steps.length ? initial.steps : [""]);
  const [cookingMethod, setCookingMethod] = useState(initial?.cookingMethod ?? "");
  const [cookingTime, setCookingTime] = useState(initial?.cookingTime?.toString() ?? "");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>(initial?.difficulty ?? "easy");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanIngredients = ingredients
      .map((item) => ({ name: item.name.trim(), amount: item.amount?.trim() }))
      .filter((item) => item.name);
    const cleanSteps = steps.map((step) => step.trim()).filter(Boolean);

    onSubmit({
      name: name.trim(),
      image: image.trim() || undefined,
      tags: splitTags(tags),
      ingredients: cleanIngredients.length ? cleanIngredients : [{ name: "待补充" }],
      steps: cleanSteps.length ? cleanSteps : ["待补充做法"],
      cookingMethod: cookingMethod.trim() || undefined,
      cookingTime: cookingTime ? Number(cookingTime) : undefined,
      difficulty,
      notes: notes.trim() || undefined,
    });
  }

  const updateIngredient = (index: number, value: Partial<Ingredient>) => {
    setIngredients((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...value } : item)));
  };

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold">菜名</span>
          <input className="k-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold">图片链接</span>
          <input className="k-input" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold">标签</span>
          <input className="k-input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="自由填写，用逗号分隔，例如：一人食，少油，便当" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">烹饪方式</span>
          <input
            className="k-input"
            value={cookingMethod}
            onChange={(event) => setCookingMethod(event.target.value)}
            placeholder="炒 / 煎 / 炖 / 烤 / 蒸"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">制作时间</span>
          <input
            className="k-input"
            min="0"
            type="number"
            value={cookingTime}
            onChange={(event) => setCookingTime(event.target.value)}
            placeholder="分钟"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">难度</span>
          <select className="k-input" value={difficulty} onChange={(event) => setDifficulty(event.target.value as RecipeDifficulty)}>
            <option value="easy">简单</option>
            <option value="medium">适中</option>
            <option value="hard">费工夫</option>
          </select>
        </label>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">食材</h3>
          <button
            className="k-button-secondary"
            type="button"
            onClick={() => setIngredients((items) => [...items, { name: "", amount: "" }])}
          >
            <Plus size={16} />
            添加
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={index}>
              <input
                className="k-input"
                value={ingredient.name}
                onChange={(event) => updateIngredient(index, { name: event.target.value })}
                placeholder="食材"
              />
              <input
                className="k-input"
                value={ingredient.amount ?? ""}
                onChange={(event) => updateIngredient(index, { amount: event.target.value })}
                placeholder="用量"
              />
              <button
                className="k-button-secondary h-10 w-10 p-0"
                type="button"
                onClick={() => setIngredients((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="删除食材"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">步骤</h3>
          <button className="k-button-secondary" type="button" onClick={() => setSteps((items) => [...items, ""])}>
            <Plus size={16} />
            添加
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div className="grid grid-cols-[1fr_auto] gap-2" key={index}>
              <textarea
                className="k-input min-h-16"
                value={step}
                onChange={(event) => setSteps((items) => items.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                placeholder={`步骤 ${index + 1}`}
              />
              <button
                className="k-button-secondary h-10 w-10 p-0"
                type="button"
                onClick={() => setSteps((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="删除步骤"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <label className="block">
        <span className="mb-1 block text-sm font-bold">备注</span>
        <textarea className="k-input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
        <button className="k-button-secondary" type="button" onClick={onCancel}>
          取消
        </button>
        <button className="k-button-primary" type="submit">
          保存菜谱
        </button>
      </div>
    </form>
  );
}
